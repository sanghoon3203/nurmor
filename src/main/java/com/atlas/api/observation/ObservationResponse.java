package com.atlas.api.observation;

import java.util.UUID;

public record ObservationResponse(
    UUID id,
    UUID habitatCellId,
    String status,
    double publicLat,
    double publicLng
) {
    static ObservationResponse from(ObservationRecord record) {
        return new ObservationResponse(
            record.getId(),
            record.getHabitatCellId(),
            record.getStatus().name(),
            record.getPublicLat(),
            record.getPublicLng()
        );
    }
}
