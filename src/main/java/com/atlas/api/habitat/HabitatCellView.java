package com.atlas.api.habitat;

import java.util.Arrays;
import java.util.List;

public final class HabitatCellView {

    private HabitatCellView() {
    }

    public static String regionName(HabitatCell cell) {
        if (hasText(cell.getDisplayName())) {
            return cell.getDisplayName();
        }
        return "생태 셀 " + cell.getCellKey();
    }

    public static String description(HabitatCell cell) {
        if (hasText(cell.getDescription())) {
            return cell.getDescription();
        }
        return "%s 주변의 공개 관찰 기록을 모아 만든 지역 생태 셀입니다.".formatted(regionName(cell));
    }

    public static List<String> habitatTypes(HabitatCell cell) {
        if (!hasText(cell.getHabitatTypesCsv())) {
            return List.of("URBAN_GREEN");
        }
        return Arrays.stream(cell.getHabitatTypesCsv().split(","))
            .map(String::trim)
            .filter(value -> !value.isBlank())
            .toList();
    }

    public static List<HabitatBoundaryPoint> boundaryCoordinates(HabitatCell cell) {
        double lat = cell.getCenterLat();
        double lng = cell.getCenterLng();
        double latRadius = 0.0025;
        double lngRadius = 0.0022;
        int seed = Math.abs(cell.getCellKey().hashCode());
        double[][] points = {
            {-0.96, -0.28},
            {-0.68, -0.88},
            {0.04, -1.0},
            {0.72, -0.74},
            {0.96, -0.08},
            {0.66, 0.78},
            {-0.02, 1.0},
            {-0.78, 0.66}
        };

        return java.util.stream.IntStream.range(0, points.length)
            .mapToObj(index -> {
                double wobble = 1 + (((seed + index) % 3) - 1) * 0.09;
                return new HabitatBoundaryPoint(
                    lat + points[index][0] * latRadius * wobble,
                    lng + points[index][1] * lngRadius * (2 - wobble)
                );
            })
            .toList();
    }

    public static String terrainDescription(HabitatCell cell) {
        List<String> types = habitatTypes(cell);
        if (types.contains("LAKE") || types.contains("RIVER") || types.contains("WETLAND")) {
            return "수변 환경을 중심으로 조류, 어류, 곤충 기록이 함께 쌓이는 지역입니다.";
        }
        if (types.contains("FOREST") || types.contains("PARK") || types.contains("TRAIL")) {
            return "나무가 많은 산책 동선과 녹지 가장자리에서 생물 기록이 누적되는 지역입니다.";
        }
        return "도시 생활권 안의 작은 녹지와 이동 경로에서 생태 기록이 모이는 지역입니다.";
    }

    private static boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
