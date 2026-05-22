package com.atlas.api.community;

import com.atlas.api.analysis.SpeciesCandidate;
import com.atlas.api.analysis.SpeciesCandidateRepository;
import com.atlas.api.common.ApiException;
import com.atlas.api.geo.GeoBounds;
import com.atlas.api.geo.GeoMath;
import com.atlas.api.observation.ObservationRecord;
import com.atlas.api.observation.ObservationRecordRepository;
import com.atlas.api.observation.ObservationStatus;
import com.atlas.api.observation.Visibility;
import com.atlas.api.profile.UserProfileRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CommunityService {

    private static final double MAX_RADIUS_KM = 50.0;
    private static final int MAX_ITEMS = 50;

    private final ObservationRecordRepository observationRecordRepository;
    private final SpeciesCandidateRepository speciesCandidateRepository;
    private final UserProfileRepository userProfileRepository;

    public CommunityService(ObservationRecordRepository observationRecordRepository,
                            SpeciesCandidateRepository speciesCandidateRepository,
                            UserProfileRepository userProfileRepository) {
        this.observationRecordRepository = observationRecordRepository;
        this.speciesCandidateRepository = speciesCandidateRepository;
        this.userProfileRepository = userProfileRepository;
    }

    @Transactional(readOnly = true)
    public List<CommunityDiscoveryResponse> discoveries(double lat, double lng, double radiusKm) {
        validateSearch(lat, lng, radiusKm);
        GeoBounds bounds = GeoMath.bounds(lat, lng, radiusKm);
        return observationRecordRepository.findPublicDiscoveries(
                ObservationStatus.PLANTED,
                Visibility.PRIVATE,
                bounds.minLat(),
                bounds.maxLat(),
                bounds.minLng(),
                bounds.maxLng()
            )
            .stream()
            .filter(record -> GeoMath.haversineKm(lat, lng, record.getPublicLat(), record.getPublicLng()) <= radiusKm)
            .limit(MAX_ITEMS)
            .map(record -> toDiscoveryResponse(record, lat, lng))
            .toList();
    }

    private CommunityDiscoveryResponse toDiscoveryResponse(ObservationRecord record, double lat, double lng) {
        SpeciesCandidate candidate = record.getSelectedSpeciesCandidateId() == null
            ? null
            : speciesCandidateRepository.findById(record.getSelectedSpeciesCandidateId()).orElse(null);
        double distanceKm = GeoMath.haversineKm(lat, lng, record.getPublicLat(), record.getPublicLng());
        return new CommunityDiscoveryResponse(
            record.getId(),
            record.getHabitatCellId(),
            candidate == null ? "알 수 없는 발견" : candidate.getCommonNameKo(),
            candidate == null ? null : candidate.getScientificName(),
            candidate == null ? 0.0 : candidate.getConfidence(),
            Math.round(distanceKm * 10.0) / 10.0,
            record.getPublicLat(),
            record.getPublicLng(),
            record.getCapturedAt(),
            contributorName(record),
            0,
            0
        );
    }

    private String contributorName(ObservationRecord record) {
        return userProfileRepository.findById(record.getUserId())
            .filter(profile -> profile.isPublicContributor())
            .map(profile -> profile.getDisplayName())
            .orElse("익명 탐험가");
    }

    private static void validateSearch(double lat, double lng, double radiusKm) {
        if (lat < -90.0 || lat > 90.0 || lng < -180.0 || lng > 180.0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "invalid coordinate");
        }
        if (radiusKm <= 0.0 || radiusKm > MAX_RADIUS_KM) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "radiusKm must be between 0 and 50");
        }
    }
}
