package com.atlas.api.geo;

public record GeoBounds(
    double minLat,
    double maxLat,
    double minLng,
    double maxLng
) {
}
