package com.atlas.api.habitat;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class CellKeyService {

    private final double cellSizeDegrees;

    public CellKeyService(@Value("${atlas.cells.size-degrees:0.0025}") double cellSizeDegrees) {
        if (cellSizeDegrees <= 0) {
            throw new IllegalArgumentException("cellSizeDegrees must be positive");
        }
        this.cellSizeDegrees = cellSizeDegrees;
    }

    public CellResolution resolve(double latitude, double longitude) {
        validate(latitude, longitude);
        long latIndex = (long) Math.floor(latitude / cellSizeDegrees);
        long lngIndex = (long) Math.floor(longitude / cellSizeDegrees);
        double centerLat = (latIndex * cellSizeDegrees) + (cellSizeDegrees / 2);
        double centerLng = (lngIndex * cellSizeDegrees) + (cellSizeDegrees / 2);
        return new CellResolution("h:%d:%d".formatted(latIndex, lngIndex), centerLat, centerLng);
    }

    private static void validate(double latitude, double longitude) {
        if (latitude < -90 || latitude > 90) {
            throw new IllegalArgumentException("latitude must be between -90 and 90");
        }
        if (longitude < -180 || longitude > 180) {
            throw new IllegalArgumentException("longitude must be between -180 and 180");
        }
    }
}
