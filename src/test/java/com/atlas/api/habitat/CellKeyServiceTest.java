package com.atlas.api.habitat;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class CellKeyServiceTest {

    private final CellKeyService service = new CellKeyService(0.0025);

    @Test
    void resolvesStableCellForCoordinate() {
        CellResolution resolution = service.resolve(37.5665, 126.9780);

        assertThat(resolution.cellKey()).isEqualTo("h:15026:50791");
        assertThat(resolution.centerLat()).isCloseTo(37.56625, within(0.000001));
        assertThat(resolution.centerLng()).isCloseTo(126.97875, within(0.000001));
    }

    @Test
    void rejectsInvalidLatitude() {
        assertThatThrownBy(() -> service.resolve(91.0, 126.9780))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("latitude");
    }

    @Test
    void rejectsInvalidLongitude() {
        assertThatThrownBy(() -> service.resolve(37.5665, 181.0))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("longitude");
    }

    private static org.assertj.core.data.Offset<Double> within(double value) {
        return org.assertj.core.data.Offset.offset(value);
    }
}
