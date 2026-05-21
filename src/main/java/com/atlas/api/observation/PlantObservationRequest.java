package com.atlas.api.observation;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record PlantObservationRequest(
    @NotNull UUID speciesCandidateId,
    @NotNull Visibility visibility
) {
}
