package com.atlas.api.profile;

public record UserStatsResponse(
    long reportCount,
    long discoveredSpeciesCount,
    long plantedObservationCount,
    long achievementCount
) {
}
