package com.atlas.api.codex;

import java.util.UUID;

public record CodexEntryResponse(
    UUID id,
    UUID habitatCellId,
    String speciesKey,
    String displayName,
    int observationCount,
    double bestConfidence
) {
    static CodexEntryResponse from(CodexEntry entry) {
        return new CodexEntryResponse(
            entry.getId(),
            entry.getHabitatCellId(),
            entry.getSpeciesKey(),
            entry.getDisplayName(),
            entry.getObservationCount(),
            entry.getBestConfidence()
        );
    }
}
