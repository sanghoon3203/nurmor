package com.atlas.api.community;

import com.atlas.api.codex.DisplayGroup;

import java.time.Instant;
import java.util.UUID;

public record CommunityDiscoveryResponse(
    UUID discoveryId,
    UUID habitatCellId,
    long codexNumber,
    String displayName,
    String scientificName,
    DisplayGroup displayGroup,
    double confidence,
    double distanceKm,
    double publicLat,
    double publicLng,
    Instant capturedAt,
    String contributorName,
    String imageUrl,
    String regionName,
    int likeCount,
    int commentCount
) {
}
