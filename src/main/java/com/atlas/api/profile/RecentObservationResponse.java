package com.atlas.api.profile;

import com.atlas.api.observation.ObservationStatus;

import java.time.Instant;
import java.util.UUID;

public record RecentObservationResponse(
    UUID observationId,
    UUID habitatCellId,
    String displayName,
    ObservationStatus status,
    double publicLat,
    double publicLng,
    Instant capturedAt
) {
}
