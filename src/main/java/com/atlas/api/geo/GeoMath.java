package com.atlas.api.geo;

public final class GeoMath {

    private static final double EARTH_RADIUS_KM = 6371.0;
    private static final double KM_PER_DEGREE_LAT = 111.32;

    private GeoMath() {
    }

    public static GeoBounds bounds(double lat, double lng, double radiusKm) {
        double latDelta = radiusKm / KM_PER_DEGREE_LAT;
        double lngScale = Math.cos(Math.toRadians(lat));
        double lngDelta = Math.abs(lngScale) < 0.0001
            ? 180.0
            : radiusKm / (KM_PER_DEGREE_LAT * lngScale);
        return new GeoBounds(
            Math.max(-90.0, lat - latDelta),
            Math.min(90.0, lat + latDelta),
            Math.max(-180.0, lng - lngDelta),
            Math.min(180.0, lng + lngDelta)
        );
    }

    public static double haversineKm(double fromLat, double fromLng, double toLat, double toLng) {
        double latDistance = Math.toRadians(toLat - fromLat);
        double lngDistance = Math.toRadians(toLng - fromLng);
        double startLat = Math.toRadians(fromLat);
        double endLat = Math.toRadians(toLat);

        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
            + Math.cos(startLat) * Math.cos(endLat)
            * Math.sin(lngDistance / 2) * Math.sin(lngDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_KM * c;
    }
}
