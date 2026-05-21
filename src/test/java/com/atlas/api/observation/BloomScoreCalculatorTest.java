package com.atlas.api.observation;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class BloomScoreCalculatorTest {

    private final BloomScoreCalculator calculator = new BloomScoreCalculator();

    @Test
    void emptyCellRemainsUnobserved() {
        BloomScoreResult result = calculator.calculate(new BloomScoreInput(0, 0, 0, 0, 0));

        assertThat(result.score()).isZero();
        assertThat(result.state()).isEqualTo(BloomState.UNOBSERVED);
    }

    @Test
    void firstValidRecordSeedsCell() {
        BloomScoreResult result = calculator.calculate(new BloomScoreInput(1, 1, 1, 1, 1));

        assertThat(result.score()).isBetween(1, 20);
        assertThat(result.state()).isEqualTo(BloomState.SEEDED);
    }

    @Test
    void diverseRepeatedRecordsCanBloomCell() {
        BloomScoreResult result = calculator.calculate(new BloomScoreInput(20, 8, 3, 7, 5));

        assertThat(result.score()).isEqualTo(100);
        assertThat(result.state()).isEqualTo(BloomState.BLOOMED);
    }
}
