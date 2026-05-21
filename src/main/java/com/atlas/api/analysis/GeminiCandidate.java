package com.atlas.api.analysis;

public record GeminiCandidate(
    String commonNameKo,
    String scientificName,
    double confidence,
    String evidence
) {
}
