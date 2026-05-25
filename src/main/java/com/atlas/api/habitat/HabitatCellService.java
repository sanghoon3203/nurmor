package com.atlas.api.habitat;

import com.atlas.api.codex.CodexEntry;
import com.atlas.api.codex.CodexEntryRepository;
import com.atlas.api.codex.DisplayGroup;
import com.atlas.api.codex.SpeciesClassifier;
import com.atlas.api.common.ApiException;
import com.atlas.api.geo.GeoBounds;
import com.atlas.api.geo.GeoMath;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
public class HabitatCellService {

    private static final double DEFAULT_LAT = 37.5665;
    private static final double DEFAULT_LNG = 126.9780;
    private static final double DEFAULT_RADIUS_KM = 5.0;
    private static final double MAX_RADIUS_KM = 50.0;

    private final HabitatCellRepository repository;
    private final CodexEntryRepository codexEntryRepository;

    public HabitatCellService(HabitatCellRepository repository, CodexEntryRepository codexEntryRepository) {
        this.repository = repository;
        this.codexEntryRepository = codexEntryRepository;
    }

    @Transactional(readOnly = true)
    public List<HabitatCell> nearby() {
        return nearby(DEFAULT_LAT, DEFAULT_LNG, DEFAULT_RADIUS_KM);
    }

    @Transactional(readOnly = true)
    public List<HabitatCell> nearby(double lat, double lng, double radiusKm) {
        validateSearch(lat, lng, radiusKm);
        GeoBounds bounds = GeoMath.bounds(lat, lng, radiusKm);
        return repository.findByCenterLatBetweenAndCenterLngBetween(
                bounds.minLat(),
                bounds.maxLat(),
                bounds.minLng(),
                bounds.maxLng()
            )
            .stream()
            .filter(cell -> GeoMath.haversineKm(lat, lng, cell.getCenterLat(), cell.getCenterLng()) <= radiusKm)
            .toList();
    }

    @Transactional(readOnly = true)
    public HabitatCell get(UUID id) {
        return repository.findById(id).orElseThrow();
    }

    @Transactional(readOnly = true)
    public HabitatCellReportResponse report(UUID id) {
        HabitatCell cell = get(id);
        List<CodexEntry> entries = codexEntryRepository.findByHabitatCellIdOrderByLastObservedAtDesc(id);
        List<HabitatCellReportSpecies> featuredSpecies = entries.stream()
            .limit(8)
            .map(HabitatCellService::toReportSpecies)
            .toList();
        List<HabitatCellReportImage> representativeImages = entries.stream()
            .map(entry -> entry.getRepresentativeMediaKey() == null
                ? null
                : new HabitatCellReportImage(entry.getRepresentativeMediaKey(), entry.getDisplayName()))
            .filter(Objects::nonNull)
            .limit(6)
            .toList();

        return new HabitatCellReportResponse(
            cell.getId(),
            HabitatCellView.regionName(cell),
            "%s의 공개 기록 %d건과 생물 %d종을 모은 생태 보고서입니다.".formatted(
                HabitatCellView.regionName(cell),
                cell.getObservationCount(),
                cell.getSpeciesCount()
            ),
            HabitatCellView.terrainDescription(cell),
            HabitatCellView.habitatTypes(cell),
            cell.getBloomScore(),
            cell.getObservationCount(),
            cell.getSpeciesCount(),
            featuredSpecies,
            representativeImages,
            List.of()
        );
    }

    private static void validateSearch(double lat, double lng, double radiusKm) {
        if (lat < -90.0 || lat > 90.0 || lng < -180.0 || lng > 180.0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "invalid coordinate");
        }
        if (radiusKm <= 0.0 || radiusKm > MAX_RADIUS_KM) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "radiusKm must be between 0 and 50");
        }
    }

    private static HabitatCellReportSpecies toReportSpecies(CodexEntry entry) {
        DisplayGroup displayGroup = SpeciesClassifier.displayGroup(entry.getDisplayName(), entry.getScientificName(), entry.getCategory());
        return new HabitatCellReportSpecies(
            entry.getId(),
            entry.getDisplayName(),
            entry.getScientificName(),
            displayGroup,
            SpeciesClassifier.speciesDescription(entry.getDisplayName(), displayGroup),
            entry.getRepresentativeMediaKey(),
            entry.getObservationCount()
        );
    }
}
