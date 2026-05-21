package com.atlas.api.analysis;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class GeminiResponseParser {

    private final ObjectMapper objectMapper;

    public GeminiResponseParser(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public List<GeminiCandidate> parse(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            String structuredText = root.path("candidates")
                .path(0)
                .path("content")
                .path("parts")
                .path(0)
                .path("text")
                .asText("");
            if (structuredText.isBlank()) {
                throw new IllegalStateException("Gemini response did not contain structured text");
            }

            JsonNode payload = objectMapper.readTree(structuredText);
            JsonNode candidatesNode = payload.path("candidates");
            if (!candidatesNode.isArray()) {
                throw new IllegalStateException("Gemini response candidates field is not an array");
            }

            List<GeminiCandidate> candidates = new ArrayList<>();
            for (JsonNode node : candidatesNode) {
                String commonNameKo = requiredText(node, "commonNameKo");
                String scientificName = nullableText(node, "scientificName");
                double confidence = normalizeConfidence(node.path("confidence").asDouble(0.0));
                String evidence = requiredText(node, "evidence");
                candidates.add(new GeminiCandidate(commonNameKo, scientificName, confidence, evidence));
            }
            if (candidates.isEmpty()) {
                throw new IllegalStateException("Gemini response contained no species candidates");
            }
            return candidates;
        } catch (Exception exception) {
            throw new IllegalStateException("Gemini structured response parsing failed", exception);
        }
    }

    private static String requiredText(JsonNode node, String fieldName) {
        String value = nullableText(node, fieldName);
        if (value == null || value.isBlank()) {
            throw new IllegalStateException("Missing Gemini field: " + fieldName);
        }
        return value;
    }

    private static String nullableText(JsonNode node, String fieldName) {
        JsonNode value = node.path(fieldName);
        if (value.isMissingNode() || value.isNull()) {
            return null;
        }
        return value.asText();
    }

    private static double normalizeConfidence(double confidence) {
        if (confidence > 1.0) {
            return confidence / 100.0;
        }
        return Math.max(0.0, Math.min(1.0, confidence));
    }
}
