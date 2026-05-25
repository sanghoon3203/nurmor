package com.atlas.api.observation;

import com.atlas.api.analysis.*;
import com.atlas.api.codex.CodexCategory;
import com.atlas.api.codex.CodexEntry;
import com.atlas.api.codex.CodexEntryRepository;
import com.atlas.api.codex.SpeciesClassifier;
import com.atlas.api.common.ApiException;
import com.atlas.api.habitat.*;
import com.atlas.api.media.MediaAsset;
import com.atlas.api.media.MediaAssetRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class ObservationService {

    private static final Logger log = LoggerFactory.getLogger(ObservationService.class);

    private final CellKeyService cellKeyService;
    private final HabitatCellRepository habitatCellRepository;
    private final ObservationRecordRepository observationRecordRepository;
    private final AnalysisJobRepository analysisJobRepository;
    private final SpeciesCandidateRepository speciesCandidateRepository;
    private final CodexEntryRepository codexEntryRepository;
    private final MediaAssetRepository mediaAssetRepository;
    private final BloomScoreCalculator bloomScoreCalculator;
    private final GeminiAnalysisClient geminiAnalysisClient;
    private final String geminiModel;

    public ObservationService(CellKeyService cellKeyService,
                              HabitatCellRepository habitatCellRepository,
                              ObservationRecordRepository observationRecordRepository,
                              AnalysisJobRepository analysisJobRepository,
                              SpeciesCandidateRepository speciesCandidateRepository,
                              CodexEntryRepository codexEntryRepository,
                              MediaAssetRepository mediaAssetRepository,
                              BloomScoreCalculator bloomScoreCalculator,
                              GeminiAnalysisClient geminiAnalysisClient,
                              @Value("${atlas.gemini.model:gemini-3.1-flash-lite}") String geminiModel) {
        this.cellKeyService = cellKeyService;
        this.habitatCellRepository = habitatCellRepository;
        this.observationRecordRepository = observationRecordRepository;
        this.analysisJobRepository = analysisJobRepository;
        this.speciesCandidateRepository = speciesCandidateRepository;
        this.codexEntryRepository = codexEntryRepository;
        this.mediaAssetRepository = mediaAssetRepository;
        this.bloomScoreCalculator = bloomScoreCalculator;
        this.geminiAnalysisClient = geminiAnalysisClient;
        this.geminiModel = geminiModel;
    }

    @Transactional
    public ObservationResponse create(UUID userId, CreateObservationRequest request) {
        CellResolution resolution = cellKeyService.resolve(request.latitude(), request.longitude());
        HabitatCell cell = habitatCellRepository.findByCellKey(resolution.cellKey())
            .orElseGet(() -> habitatCellRepository.save(new HabitatCell(
                resolution.cellKey(),
                resolution.centerLat(),
                resolution.centerLng()
            )));
        String locationName = locationName(request.locationName());
        cell.applyDisplayName(locationName);
        habitatCellRepository.save(cell);
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
            locationName,
            mediaCsv,
            request.capturedAt()
        );
        ObservationRecord saved = observationRecordRepository.save(record);
        return ObservationResponse.from(saved);
    }

    @Transactional
    public AnalysisResponse analyze(UUID observationId) {
        long startedAt = System.currentTimeMillis();
        log.info("analysis request started observationId={}", observationId);
        ObservationRecord record = findObservation(observationId);
        record.markAnalyzing();
        AnalysisJob job = analysisJobRepository.save(new AnalysisJob(record.getId(), geminiModel, "habitat-bloom-v1"));
        job.running();
        try {
            List<MediaAsset> mediaAssets = mediaAssetRepository.findAllById(record.getMediaAssetIds());
            if (mediaAssets.size() != record.getMediaAssetIds().size()) {
                log.warn(
                    "analysis media lookup mismatch observationId={} expected={} actual={}",
                    observationId,
                    record.getMediaAssetIds().size(),
                    mediaAssets.size()
                );
                throw new ApiException(HttpStatus.BAD_REQUEST, "observation media assets are missing");
            }
            log.info("analysis gemini call starting observationId={} jobId={} mediaCount={}", observationId, job.getId(), mediaAssets.size());
            List<SpeciesCandidate> candidates = geminiAnalysisClient.analyze(record, mediaAssets).stream()
                .map(candidate -> new SpeciesCandidate(
                    job.getId(),
                    candidate.commonNameKo(),
                    candidate.scientificName(),
                    candidate.confidence(),
                    candidate.evidence()
                ))
                .toList();
            log.info("analysis gemini call completed observationId={} jobId={} candidateCount={}", observationId, job.getId(), candidates.size());
            speciesCandidateRepository.saveAll(candidates);
            record.markNeedsReview();
            job.succeeded();
            log.info(
                "analysis request succeeded observationId={} jobId={} elapsedMs={}",
                observationId,
                job.getId(),
                System.currentTimeMillis() - startedAt
            );
            return toAnalysisResponse(job, candidates);
        } catch (ApiException exception) {
            record.markFailed();
            job.failed(exception.getMessage());
            log.warn(
                "analysis request rejected observationId={} jobId={} elapsedMs={} message={}",
                observationId,
                job.getId(),
                System.currentTimeMillis() - startedAt,
                exception.getMessage()
            );
            throw exception;
        } catch (RuntimeException exception) {
            record.markFailed();
            job.failed(exception.getMessage());
            log.error(
                "analysis request failed observationId={} jobId={} elapsedMs={}",
                observationId,
                job.getId(),
                System.currentTimeMillis() - startedAt,
                exception
            );
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
                CodexCategory.infer(candidate.getCommonNameKo(), candidate.getScientificName()),
                null,
                codexEntryRepository.count() + 1,
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
        int contributors = (int) observationRecordRepository.countDistinctUsersByHabitatCellIdAndStatus(cell.getId(), ObservationStatus.PLANTED);
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
        return SpeciesClassifier.speciesKey(candidate.getCommonNameKo(), candidate.getScientificName());
    }

    private static String locationName(String value) {
        if (value == null || value.isBlank()) {
            return "현재 위치";
        }
        return value.trim();
    }
}
