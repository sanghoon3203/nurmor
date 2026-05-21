package com.atlas.api.habitat;

public record HabitatCellResponse(
    String id,
    String cellKey,
    double centerLat,
    double centerLng,
    String bloomState,
    int bloomScore,
    int observationCount,
    int speciesCount,
    int contributorCount
) {
    public static HabitatCellResponse from(HabitatCell cell) {
        return new HabitatCellResponse(
            cell.getId().toString(),
            cell.getCellKey(),
            cell.getCenterLat(),
            cell.getCenterLng(),
            cell.getBloomState().name(),
            cell.getBloomScore(),
            cell.getObservationCount(),
            cell.getSpeciesCount(),
            cell.getContributorCount()
        );
    }
}
