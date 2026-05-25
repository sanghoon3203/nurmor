package com.atlas.api.observation;

import java.time.Instant;
import java.util.UUID;

public record ObservationResponse(
    UUID id,
    UUID habitatCellId,
    String status,
    String visibility,
    String locationName,
    double publicLat,
    double publicLng,
    Instant capturedAt
) {
    static ObservationResponse from(ObservationRecord record) {
        return new ObservationResponse(
            record.getId(),
            record.getHabitatCellId(),
            record.getStatus().name(),
            record.getVisibility().name(),
            record.getLocationName(),
            record.getPublicLat(),
            record.getPublicLng(),
            record.getCapturedAt()
        );
    }
}
