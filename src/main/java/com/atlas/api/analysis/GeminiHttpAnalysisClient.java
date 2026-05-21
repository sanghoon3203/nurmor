package com.atlas.api.analysis;

import com.atlas.api.observation.ObservationRecord;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;

@Component
@Profile("gcp")
public class GeminiHttpAnalysisClient implements GeminiAnalysisClient {

    private final HttpClient httpClient;
    private final String apiKey;
    private final String model;

    public GeminiHttpAnalysisClient(
        @Value("${atlas.gemini.api-key}") String apiKey,
        @Value("${atlas.gemini.model:gemini-3-flash-preview}") String model
    ) {
        this.httpClient = HttpClient.newHttpClient();
        this.apiKey = apiKey;
        this.model = model;
    }

    @Override
    public List<GeminiCandidate> analyze(ObservationRecord observationRecord) {
        try {
            String body = """
                {
                  "contents": [{
                    "parts": [{
                      "text": "사진, 영상, 소리 metadata를 바탕으로 생물 후보를 한국어로 신중하게 추정하세요. 확정하지 말고 추정으로 답하세요."
                    }]
                  }]
                }
                """;
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent".formatted(model)))
                .header("Content-Type", "application/json")
                .header("x-goog-api-key", apiKey)
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 400) {
                throw new IllegalStateException("Gemini request failed: " + response.statusCode());
            }
            return List.of(new GeminiCandidate("미확인 생물", null, 0.1, "Gemini 응답 parsing adapter가 아직 연결되지 않았습니다."));
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Gemini request interrupted", exception);
        } catch (Exception exception) {
            throw new IllegalStateException("Gemini request failed", exception);
        }
    }
}
