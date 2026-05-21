package com.atlas.api.observation;

public record BloomScoreInput(
    int uniqueObservations,
    int distinctSpecies,
    int distinctMediaTypes,
    int repeatConfirmations,
    int contributorCount
) {
}
