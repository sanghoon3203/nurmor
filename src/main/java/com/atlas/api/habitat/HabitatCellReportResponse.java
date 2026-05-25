package com.atlas.api.habitat;

import com.atlas.api.community.CommunityDiscoveryResponse;

import java.util.List;
import java.util.UUID;

public record HabitatCellReportResponse(
    UUID habitatCellId,
    String regionName,
    String summary,
    String terrainDescription,
    List<String> habitatTypes,
    int bloomScore,
    int observationCount,
    int speciesCount,
    List<HabitatCellReportSpecies> featuredSpecies,
    List<HabitatCellReportImage> representativeImages,
    List<CommunityDiscoveryResponse> recentDiscoveries
) {
}
