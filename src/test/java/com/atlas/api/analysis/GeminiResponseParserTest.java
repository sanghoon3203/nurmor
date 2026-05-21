package com.atlas.api.analysis;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class GeminiResponseParserTest {

    private final GeminiResponseParser parser = new GeminiResponseParser(new ObjectMapper());

    @Test
    void parsesStructuredCandidatesFromGenerateContentResponse() {
        String response = """
            {
              "candidates": [{
                "content": {
                  "parts": [{
                    "text": "{\\"candidates\\":[{\\"commonNameKo\\":\\"노랑나비\\",\\"scientificName\\":\\"Eurema hecabe\\",\\"confidence\\":0.87,\\"evidence\\":\\"노란 날개와 작은 체형\\"}]}"
                  }]
                }
              }]
            }
            """;

        List<GeminiCandidate> candidates = parser.parse(response);

        assertThat(candidates).hasSize(1);
        assertThat(candidates.getFirst().commonNameKo()).isEqualTo("노랑나비");
        assertThat(candidates.getFirst().scientificName()).isEqualTo("Eurema hecabe");
        assertThat(candidates.getFirst().confidence()).isEqualTo(0.87);
        assertThat(candidates.getFirst().evidence()).isEqualTo("노란 날개와 작은 체형");
    }

    @Test
    void normalizesPercentageConfidence() {
        String response = """
            {
              "candidates": [{
                "content": {
                  "parts": [{
                    "text": "{\\"candidates\\":[{\\"commonNameKo\\":\\"참새\\",\\"scientificName\\":null,\\"confidence\\":87,\\"evidence\\":\\"작은 조류\\"}]}"
                  }]
                }
              }]
            }
            """;

        List<GeminiCandidate> candidates = parser.parse(response);

        assertThat(candidates.getFirst().confidence()).isEqualTo(0.87);
    }
}
