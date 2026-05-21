package com.atlas.api.observation;

public record BloomScoreResult(
    int score,
    BloomState state
) {
}
