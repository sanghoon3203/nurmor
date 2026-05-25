package com.atlas.api.habitat;

import com.atlas.api.codex.DisplayGroup;

import java.util.UUID;

public record HabitatCellReportSpecies(
    UUID codexEntryId,
    String displayName,
    String scientificName,
    DisplayGroup displayGroup,
    String description,
    String imageUrl,
    int observationCount
) {
}
