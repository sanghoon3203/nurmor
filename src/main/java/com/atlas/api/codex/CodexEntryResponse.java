package com.atlas.api.codex;

import java.time.Instant;
import java.util.UUID;

public record CodexEntryResponse(
    UUID id,
    UUID habitatCellId,
    String speciesKey,
    String displayName,
    String scientificName,
    CodexCategory category,
    DisplayGroup displayGroup,
    String regionName,
    String representativeMediaKey,
    long discoveryNumber,
    int observationCount,
    double bestConfidence,
    Instant firstObservedAt,
    Instant lastObservedAt
) {
    static CodexEntryResponse from(CodexEntry entry, String regionName) {
        return new CodexEntryResponse(
            entry.getId(),
            entry.getHabitatCellId(),
            entry.getSpeciesKey(),
            entry.getDisplayName(),
            entry.getScientificName(),
            entry.getCategory(),
            SpeciesClassifier.displayGroup(entry.getDisplayName(), entry.getScientificName(), entry.getCategory()),
            regionName,
            entry.getRepresentativeMediaKey(),
            entry.getDiscoveryNumber(),
            entry.getObservationCount(),
            entry.getBestConfidence(),
            entry.getFirstObservedAt(),
            entry.getLastObservedAt()
        );
    }
}
