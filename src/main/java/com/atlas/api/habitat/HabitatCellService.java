package com.atlas.api.habitat;

import com.atlas.api.common.ApiException;
import com.atlas.api.geo.GeoBounds;
import com.atlas.api.geo.GeoMath;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class HabitatCellService {

    private static final double DEFAULT_LAT = 37.5665;
    private static final double DEFAULT_LNG = 126.9780;
    private static final double DEFAULT_RADIUS_KM = 5.0;
    private static final double MAX_RADIUS_KM = 50.0;

    private final HabitatCellRepository repository;

    public HabitatCellService(HabitatCellRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<HabitatCell> nearby() {
        return nearby(DEFAULT_LAT, DEFAULT_LNG, DEFAULT_RADIUS_KM);
    }

    @Transactional(readOnly = true)
    public List<HabitatCell> nearby(double lat, double lng, double radiusKm) {
        validateSearch(lat, lng, radiusKm);
        GeoBounds bounds = GeoMath.bounds(lat, lng, radiusKm);
        return repository.findByCenterLatBetweenAndCenterLngBetween(
                bounds.minLat(),
                bounds.maxLat(),
                bounds.minLng(),
                bounds.maxLng()
            )
            .stream()
            .filter(cell -> GeoMath.haversineKm(lat, lng, cell.getCenterLat(), cell.getCenterLng()) <= radiusKm)
            .toList();
    }

    @Transactional(readOnly = true)
    public HabitatCell get(UUID id) {
        return repository.findById(id).orElseThrow();
    }

    private static void validateSearch(double lat, double lng, double radiusKm) {
        if (lat < -90.0 || lat > 90.0 || lng < -180.0 || lng > 180.0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "invalid coordinate");
        }
        if (radiusKm <= 0.0 || radiusKm > MAX_RADIUS_KM) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "radiusKm must be between 0 and 50");
        }
    }
}
