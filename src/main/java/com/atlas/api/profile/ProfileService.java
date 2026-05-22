package com.atlas.api.profile;

import com.atlas.api.analysis.SpeciesCandidate;
import com.atlas.api.analysis.SpeciesCandidateRepository;
import com.atlas.api.auth.AuthenticatedUser;
import com.atlas.api.observation.ObservationRecord;
import com.atlas.api.observation.ObservationRecordRepository;
import com.atlas.api.observation.ObservationStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;

@Service
public class ProfileService {

    private final UserProfileRepository userProfileRepository;
    private final ObservationRecordRepository observationRecordRepository;
    private final SpeciesCandidateRepository speciesCandidateRepository;

    public ProfileService(UserProfileRepository userProfileRepository,
                          ObservationRecordRepository observationRecordRepository,
                          SpeciesCandidateRepository speciesCandidateRepository) {
        this.userProfileRepository = userProfileRepository;
        this.observationRecordRepository = observationRecordRepository;
        this.speciesCandidateRepository = speciesCandidateRepository;
    }

    @Transactional
    public UserProfileResponse get(AuthenticatedUser user) {
        return UserProfileResponse.from(getOrCreate(user));
    }

    @Transactional
    public UserProfileResponse update(AuthenticatedUser user, UpdateProfileRequest request) {
        UserProfile profile = getOrCreate(user);
        profile.update(request.displayName(), request.avatarUrl(), request.publicContributor());
        return UserProfileResponse.from(userProfileRepository.save(profile));
    }

    @Transactional(readOnly = true)
    public UserStatsResponse stats(AuthenticatedUser user) {
        UUID userId = userId(user);
        long reportCount = observationRecordRepository.countByUserId(userId);
        long plantedObservationCount = observationRecordRepository.countByUserIdAndStatus(userId, ObservationStatus.PLANTED);
        long discoveredSpeciesCount = observationRecordRepository.countDistinctSelectedSpeciesByUserIdAndStatus(userId, ObservationStatus.PLANTED);
        long achievementCount = Math.min(plantedObservationCount, 1);
        return new UserStatsResponse(reportCount, discoveredSpeciesCount, plantedObservationCount, achievementCount);
    }

    @Transactional(readOnly = true)
    public List<RecentObservationResponse> recentObservations(AuthenticatedUser user) {
        return observationRecordRepository.findTop10ByUserIdOrderByCapturedAtDesc(userId(user))
            .stream()
            .map(this::toRecentObservationResponse)
            .toList();
    }

    private UserProfile getOrCreate(AuthenticatedUser user) {
        UUID userId = userId(user);
        return userProfileRepository.findById(userId)
            .orElseGet(() -> userProfileRepository.save(new UserProfile(
                userId,
                user.firebaseUid(),
                user.email(),
                defaultDisplayName(user)
            )));
    }

    private RecentObservationResponse toRecentObservationResponse(ObservationRecord record) {
        return new RecentObservationResponse(
            record.getId(),
            record.getHabitatCellId(),
            displayName(record),
            record.getStatus(),
            record.getPublicLat(),
            record.getPublicLng(),
            record.getCapturedAt()
        );
    }

    private String displayName(ObservationRecord record) {
        UUID candidateId = record.getSelectedSpeciesCandidateId();
        if (candidateId == null) {
            return "분석 대기 기록";
        }
        return speciesCandidateRepository.findById(candidateId)
            .map(SpeciesCandidate::getCommonNameKo)
            .orElse("알 수 없는 기록");
    }

    private static String defaultDisplayName(AuthenticatedUser user) {
        if (user.displayName() != null && !user.displayName().isBlank()) {
            return user.displayName();
        }
        return "Atlas 탐험가";
    }

    private static UUID userId(AuthenticatedUser user) {
        return UUID.nameUUIDFromBytes(user.firebaseUid().getBytes(StandardCharsets.UTF_8));
    }
}
