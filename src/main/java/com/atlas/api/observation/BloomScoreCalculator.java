package com.atlas.api.observation;

import org.springframework.stereotype.Component;

@Component
public class BloomScoreCalculator {

    public BloomScoreResult calculate(BloomScoreInput input) {
        if (input.uniqueObservations() <= 0) {
            return new BloomScoreResult(0, BloomState.UNOBSERVED);
        }

        int observationScore = Math.min(40, input.uniqueObservations() * 4);
        int speciesScore = Math.min(25, input.distinctSpecies() * 4);
        int mediaScore = Math.min(15, input.distinctMediaTypes() * 5);
        int repeatScore = Math.min(10, input.repeatConfirmations() * 2);
        int contributorScore = Math.min(10, input.contributorCount() * 2);
        int score = Math.min(100, observationScore + speciesScore + mediaScore + repeatScore + contributorScore);

        return new BloomScoreResult(score, stateFor(score));
    }

    private static BloomState stateFor(int score) {
        if (score == 0) {
            return BloomState.UNOBSERVED;
        }
        if (score <= 20) {
            return BloomState.SEEDED;
        }
        if (score < 80) {
            return BloomState.GROWING;
        }
        return BloomState.BLOOMED;
    }
}
