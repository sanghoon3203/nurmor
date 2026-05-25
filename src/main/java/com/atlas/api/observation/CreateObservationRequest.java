package com.atlas.api.observation;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.List;

public record CreateObservationRequest(
    @NotEmpty List<java.util.UUID> mediaAssetIds,
    @DecimalMin("-90.0") @DecimalMax("90.0") double latitude,
    @DecimalMin("-180.0") @DecimalMax("180.0") double longitude,
    @PositiveOrZero double locationAccuracyMeters,
    @Size(max = 120) String locationName,
    @jakarta.validation.constraints.NotNull Instant capturedAt
) {
}
