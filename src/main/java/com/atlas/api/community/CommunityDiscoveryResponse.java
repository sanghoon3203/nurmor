package com.atlas.api.community;

import java.time.Instant;
import java.util.UUID;

public record CommunityDiscoveryResponse(
    UUID discoveryId,
    UUID habitatCellId,
    String displayName,
    String scientificName,
    double confidence,
    double distanceKm,
    double publicLat,
    double publicLng,
    Instant capturedAt,
    String contributorName,
    int likeCount,
    int commentCount
) {
}
