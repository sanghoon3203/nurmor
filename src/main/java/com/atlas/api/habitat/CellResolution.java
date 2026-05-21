package com.atlas.api.habitat;

public record CellResolution(
    String cellKey,
    double centerLat,
    double centerLng
) {
}
