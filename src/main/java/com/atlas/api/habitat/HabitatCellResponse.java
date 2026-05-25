package com.atlas.api.habitat;

import java.util.List;

public record HabitatCellResponse(
    String id,
    String cellKey,
    String regionName,
    String description,
    double centerLat,
    double centerLng,
    String bloomState,
    int bloomScore,
    int observationCount,
    int speciesCount,
    int contributorCount,
    List<String> habitatTypes,
    List<HabitatBoundaryPoint> boundaryCoordinates
) {
    public static HabitatCellResponse from(HabitatCell cell) {
        return new HabitatCellResponse(
            cell.getId().toString(),
            cell.getCellKey(),
            HabitatCellView.regionName(cell),
            HabitatCellView.description(cell),
            cell.getCenterLat(),
            cell.getCenterLng(),
            cell.getBloomState().name(),
            cell.getBloomScore(),
            cell.getObservationCount(),
            cell.getSpeciesCount(),
            cell.getContributorCount(),
            HabitatCellView.habitatTypes(cell),
            HabitatCellView.boundaryCoordinates(cell)
        );
    }
}
