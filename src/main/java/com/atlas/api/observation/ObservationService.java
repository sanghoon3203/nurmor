package com.atlas.api.observation;

import com.atlas.api.analysis.*;
import com.atlas.api.codex.CodexEntry;
import com.atlas.api.codex.CodexEntryRepository;
import com.atlas.api.common.ApiException;
import com.atlas.api.habitat.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class ObservationService {

    private static final String GEMINI_MODEL = "gemini-3-flash-preview";

    private final CellKeyService cellKeyService;
    private final HabitatCellRepository habitatCellRepository;
    private final ObservationRecordRepository observationRecordRepository;
    private final AnalysisJobRepository analysisJobRepository;
    private final SpeciesCandidateRepository speciesCandidateRepository;
    private final CodexEntryRepository codexEntryRepository;
    private final BloomScoreCalculator bloomScoreCalculator;
    private final GeminiAnalysisClient geminiAnalysisClient;

    public ObservationService(CellKeyService cellKeyService,
                              HabitatCellRepository habitatCellRepository,
                              ObservationRecordRepository observationRecordRepository,
                              AnalysisJobRepository analysisJobRepository,
                              SpeciesCandidateRepository speciesCandidateRepository,
                              CodexEntryRepository codexEntryRepository,
                              BloomScoreCalculator bloomScoreCalculator,
                              GeminiAnalysisClient geminiAnalysisClient) {
        this.cellKeyService = cellKeyService;
        this.habitatCellRepository = habitatCellRepository;
        this.observationRecordRepository = observationRecordRepository;
        this.analysisJobRepository = analysisJobRepository;
        this.speciesCandidateRepository = speciesCandidateRepository;
        this.codexEntryRepository = codexEntryRepository;
        this.bloomScoreCalculator = bloomScoreCalculator;
        this.geminiAnalysisClient = geminiAnalysisClient;
    }

    @Transactional
    public ObservationRecord create(UUID userId, CreateObservationRequest request) {
        CellResolution resolution = cellKeyService.resolve(request.latitude(), request.longitude());
        HabitatCell cell = habitatCellRepository.findByCellKey(resolution.cellKey())
            .orElseGet(() -> habitatCellRepository.save(new HabitatCell(
                resolution.cellKey(),
                resolution.centerLat(),
                resolution.centerLng()
            )));
        String mediaCsv = request.mediaAssetIds().stream()
            .map(UUID::toString)
            .reduce((left, right) -> left + "," + right)
            .orElseThrow();
        ObservationRecord record = new ObservationRecord(
            userId,
            cell.getId(),
            request.latitude(),
            request.longitude(),
            cell.getCenterLat(),
            cell.getCenterLng(),
            request.locationAccuracyMeters(),
            mediaCsv,
            request.capturedAt()
        );
        return observationRecordRepository.save(record);
    }

    @Transactional
    public AnalysisResponse analyze(UUID observationId) {
        ObservationRecord record = findObservation(observationId);
        record.markAnalyzing();
        AnalysisJob job = analysisJobRepository.save(new AnalysisJob(record.getId(), GEMINI_MODEL, "habitat-bloom-v1"));
        job.running();
        try {
            List<SpeciesCandidate> candidates = geminiAnalysisClient.analyze(record).stream()
                .map(candidate -> new SpeciesCandidate(
                    job.getId(),
                    candidate.commonNameKo(),
                    candidate.scientificName(),
                    candidate.confidence(),
                    candidate.evidence()
                ))
                .toList();
            speciesCandidateRepository.saveAll(candidates);
            record.markNeedsReview();
            job.succeeded();
            return toAnalysisResponse(job, candidates);
        } catch (RuntimeException exception) {
            record.markFailed();
            job.failed(exception.getMessage());
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Gemini analysis failed");
        }
    }

    @Transactional(readOnly = true)
    public AnalysisResponse getAnalysis(UUID analysisJobId) {
        AnalysisJob job = analysisJobRepository.findById(analysisJobId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "analysis job not found"));
        return toAnalysisResponse(job, speciesCandidateRepository.findByAnalysisJobId(job.getId()));
    }

    @Transactional
    public HabitatCell plant(UUID observationId, PlantObservationRequest request) {
        ObservationRecord record = findObservation(observationId);
        SpeciesCandidate candidate = speciesCandidateRepository.findById(request.speciesCandidateId())
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "species candidate not found"));
        HabitatCell cell = habitatCellRepository.findById(record.getHabitatCellId())
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "habitat cell not found"));

        String speciesKey = speciesKey(candidate);
        CodexEntry entry = codexEntryRepository.findByHabitatCellIdAndSpeciesKey(cell.getId(), speciesKey)
            .map(existing -> {
                existing.addObservation(candidate.getConfidence(), record.getCapturedAt());
                return existing;
            })
            .orElseGet(() -> new CodexEntry(
                cell.getId(),
                speciesKey,
                candidate.getCommonNameKo(),
                candidate.getScientificName(),
                candidate.getConfidence(),
                record.getCapturedAt()
            ));
        codexEntryRepository.save(entry);
        record.plant(candidate.getId(), request.visibility());
        updateCellBloom(cell);
        return habitatCellRepository.save(cell);
    }

    private void updateCellBloom(HabitatCell cell) {
        int observations = (int) observationRecordRepository.countByHabitatCellIdAndStatus(cell.getId(), ObservationStatus.PLANTED);
        int species = (int) codexEntryRepository.countByHabitatCellId(cell.getId());
        int contributors = Math.min(observations, 1);
        BloomScoreResult result = bloomScoreCalculator.calculate(new BloomScoreInput(observations, species, 1, observations, contributors));
        cell.updateBloom(result.score(), result.state(), observations, species, contributors);
    }

    private ObservationRecord findObservation(UUID observationId) {
        return observationRecordRepository.findById(observationId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "observation not found"));
    }

    private static AnalysisResponse toAnalysisResponse(AnalysisJob job, List<SpeciesCandidate> candidates) {
        return new AnalysisResponse(
            job.getId(),
            job.getObservationRecordId(),
            job.getModel(),
            job.getStatus().name(),
            candidates.stream().map(AnalysisCandidateResponse::from).toList()
        );
    }

    private static String speciesKey(SpeciesCandidate candidate) {
        String source = candidate.getScientificName() == null || candidate.getScientificName().isBlank()
            ? candidate.getCommonNameKo()
            : candidate.getScientificName();
        return source.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9가-힣]+", "-");
    }
}
