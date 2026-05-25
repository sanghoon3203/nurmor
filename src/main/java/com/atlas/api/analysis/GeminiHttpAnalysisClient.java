package com.atlas.api.analysis;

import com.atlas.api.media.MediaAsset;
import com.atlas.api.observation.ObservationRecord;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.cloud.storage.Blob;
import com.google.firebase.cloud.StorageClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
@Profile("gcp")
public class GeminiHttpAnalysisClient implements GeminiAnalysisClient {

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final GeminiResponseParser responseParser;
    private final String apiKey;
    private final String model;

    public GeminiHttpAnalysisClient(
        ObjectMapper objectMapper,
        GeminiResponseParser responseParser,
        @Value("${atlas.gemini.api-key}") String apiKey,
        @Value("${atlas.gemini.model:gemini-3.1-flash-lite}") String model
    ) {
        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = objectMapper;
        this.responseParser = responseParser;
        this.apiKey = apiKey;
        this.model = model;
    }

    @Override
    public List<GeminiCandidate> analyze(ObservationRecord observationRecord, List<MediaAsset> mediaAssets) {
        try {
            String body = objectMapper.writeValueAsString(requestBody(observationRecord, mediaAssets));
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
            return responseParser.parse(response.body());
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Gemini request interrupted", exception);
        } catch (Exception exception) {
            throw new IllegalStateException("Gemini request failed", exception);
        }
    }

    private Map<String, Object> requestBody(ObservationRecord observationRecord, List<MediaAsset> mediaAssets) {
        List<Map<String, Object>> parts = new ArrayList<>();
        parts.add(Map.of("text", prompt(observationRecord)));
        for (MediaAsset mediaAsset : mediaAssets) {
            parts.add(mediaPart(mediaAsset));
        }

        return Map.of(
            "contents", List.of(Map.of("parts", parts)),
            "generationConfig", Map.of(
                "responseMimeType", "application/json",
                "responseJsonSchema", responseSchema()
            )
        );
    }

    private static String prompt(ObservationRecord observationRecord) {
        return promptForAnalysis(
            observationRecord.getPublicLat(),
            observationRecord.getPublicLng(),
            observationRecord.getCapturedAt().toString()
        );
    }

    static String promptForAnalysis(double publicLat, double publicLng, String capturedAt) {
        return """
            당신은 생태 관찰 기록을 검토하는 분류 보조자입니다.
            업로드된 사진, 영상 또는 소리에서 실제로 관찰 가능한 생물 후보만 JSON으로 반환하세요.

            필수 출력:
            - candidates: 1개 이상 5개 이하
            - 각 후보의 commonNameKo: 한국어 통용명. 종 확정이 어려우면 "흰나비류"처럼 분류군 수준의 신중한 이름
            - 각 후보의 scientificName: 가능하면 이항식 학명(Genus species). 종 수준이 불확실하면 Genus sp. 또는 가장 좁은 분류군 학명. null 금지
            - 각 후보의 confidence: 0과 1 사이 숫자
            - 각 후보의 evidence: 한국어 1문장. 색, 형태, 무늬, 소리, 움직임, 보이는 부위 등 관찰 특징을 2개 이상 포함

            금지:
            - 보이지 않거나 들리지 않는 특징을 단정하지 마세요.
            - 위치만으로 종을 확정하지 마세요.
            - 설명 문장이나 Markdown 없이 JSON schema에 맞는 값만 반환하세요.

            참고 metadata:
            publicLat=%s, publicLng=%s, capturedAt=%s
            """.formatted(
            publicLat,
            publicLng,
            capturedAt
        ).trim();
    }

    private static Map<String, Object> responseSchema() {
        Map<String, Object> candidateProperties = new LinkedHashMap<>();
        candidateProperties.put("commonNameKo", Map.of("type", "string", "description", "Korean common name or cautious taxon label"));
        candidateProperties.put("scientificName", Map.of("type", "string", "description", "Scientific name for the most specific safe taxon; never null"));
        candidateProperties.put("confidence", Map.of("type", "number", "minimum", 0, "maximum", 1));
        candidateProperties.put("evidence", Map.of("type", "string", "description", "One Korean sentence with at least two observable visual or audio features"));

        return Map.of(
            "type", "object",
            "properties", Map.of(
                "candidates", Map.of(
                    "type", "array",
                    "minItems", 1,
                    "maxItems", 5,
                    "items", Map.of(
                        "type", "object",
                        "properties", candidateProperties,
                        "required", List.of("commonNameKo", "scientificName", "confidence", "evidence")
                    )
                )
            ),
            "required", List.of("candidates")
        );
    }

    private static Map<String, Object> mediaPart(MediaAsset mediaAsset) {
        byte[] bytes = readFirebaseStorageObject(mediaAsset);
        return Map.of(
            "inlineData", Map.of(
                "mimeType", mediaAsset.getMimeType(),
                "data", Base64.getEncoder().encodeToString(bytes)
            )
        );
    }

    private static byte[] readFirebaseStorageObject(MediaAsset mediaAsset) {
        StorageObjectRef ref = StorageObjectRef.from(mediaAsset.getStorageKey());
        Blob blob = StorageClient.getInstance().bucket(ref.bucket()).get(ref.objectPath());
        if (blob == null) {
            throw new IllegalStateException("Firebase Storage object not found: " + mediaAsset.getStorageKey());
        }
        return blob.getContent();
    }

    private record StorageObjectRef(String bucket, String objectPath) {

        static StorageObjectRef from(String storageKey) {
            String prefix = "firebase://";
            if (!storageKey.startsWith(prefix)) {
                throw new IllegalStateException("Unsupported storage key: " + storageKey);
            }
            String withoutScheme = storageKey.substring(prefix.length());
            int slash = withoutScheme.indexOf('/');
            if (slash <= 0 || slash == withoutScheme.length() - 1) {
                throw new IllegalStateException("Invalid Firebase storage key: " + storageKey);
            }
            return new StorageObjectRef(withoutScheme.substring(0, slash), withoutScheme.substring(slash + 1));
        }
    }
}
