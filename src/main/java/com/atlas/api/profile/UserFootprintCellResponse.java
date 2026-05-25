package com.atlas.api.profile;

import java.util.UUID;

public record UserFootprintCellResponse(
    UUID habitatCellId,
    String regionName,
    double centerLat,
    double centerLng,
    long reportCount,
    double intensity
) {
}
