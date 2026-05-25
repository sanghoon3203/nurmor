package com.atlas.api.analysis;

import com.atlas.api.media.MediaAsset;
import com.atlas.api.observation.ObservationRecord;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.cloud.storage.Blob;
import com.google.firebase.cloud.StorageClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
@Profile("gcp")
public class GeminiHttpAnalysisClient implements GeminiAnalysisClient {

    private static final Logger log = LoggerFactory.getLogger(GeminiHttpAnalysisClient.class);

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
        this.httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();
        this.objectMapper = objectMapper;
        this.responseParser = responseParser;
        this.apiKey = apiKey;
        this.model = model;
    }

    @Override
    public List<GeminiCandidate> analyze(ObservationRecord observationRecord, List<MediaAsset> mediaAssets) {
        long startedAt = System.currentTimeMillis();
        try {
            log.info("gemini request building observationId={} mediaCount={}", observationRecord.getId(), mediaAssets.size());
            String body = objectMapper.writeValueAsString(requestBody(observationRecord, mediaAssets));
            log.info("gemini request sending observationId={} bodyBytes={}", observationRecord.getId(), body.length());
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent".formatted(model)))
                .header("Content-Type", "application/json")
                .header("x-goog-api-key", apiKey)
                .timeout(Duration.ofSeconds(60))
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            log.info(
                "gemini response received observationId={} status={} elapsedMs={}",
                observationRecord.getId(),
                response.statusCode(),
                System.currentTimeMillis() - startedAt
            );
            if (response.statusCode() >= 400) {
                throw new IllegalStateException("Gemini request failed: " + response.statusCode());
            }
            List<GeminiCandidate> candidates = responseParser.parse(response.body());
            log.info("gemini response parsed observationId={} candidateCount={}", observationRecord.getId(), candidates.size());
            return candidates;
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
            당신은 대한민국 생태 관찰 기록을 검토하는 분류 보조자입니다.
            업로드된 사진, 영상 또는 소리에서 실제로 관찰 가능한 생물 후보만 JSON으로 반환하세요.

            핵심 원칙:
            - 가능한 한 구체적인 종 단위 이름을 우선하세요. 예: 나비가 아니라 호랑나비, 배추흰나비, 노랑나비처럼 판단하세요.
            - 조류, 곤충, 식물, 포유류도 보이는 특징 또는 들리는 특징이 충분하면 구체적인 후보를 제시하세요.
            - 근거가 부족하면 넓은 분류군을 쓰되 confidence를 낮추고 불확실한 이유를 evidence에 적으세요.
            - 후보는 1개 이상 5개 이하로, 가능성이 높은 순서대로 반환하세요.

            필수 출력:
            - candidates: 1개 이상 5개 이하
            - 각 후보의 commonNameKo: 한국어 통용명. 종 확정이 어려우면 "흰나비류"처럼 분류군 수준의 신중한 이름
            - 각 후보의 scientificName: 가능하면 이항식 학명(Genus species). 종 수준이 불확실하면 Genus sp. 또는 가장 좁은 분류군 학명. null 금지
            - 각 후보의 confidence: 0과 1 사이 숫자
            - 각 후보의 evidence: 한국어 1문장. 색, 형태, 무늬, 소리, 움직임, 보이는 부위 등 관찰 특징을 2개 이상 포함

            사진/영상 판정 기준:
            - 몸 형태, 날개 무늬, 색 패치, 더듬이, 잎/꽃 형태, 부리 형태, 크기, 주변 서식지 단서를 사용하세요.
            - 사진 속 글자, 뉴스 제목, 앱 라벨, OCR 결과는 약한 참고 정보로만 사용하세요.
            - 화면을 다시 촬영한 사진이면 화질 한계로 확신도를 낮추세요.

            소리 판정 기준:
            - 울음소리의 높낮이, 리듬, 반복 구간, 떨림, 짹짹거림, 간격, 길이, 음절 수, 배경 소음을 근거로 삼으세요.
            - 한국에서 흔한 소리 후보는 직박구리, 참새, 박새, 까치, 까마귀, 매미류, 귀뚜라미류, 청개구리, 맹꽁이, 고라니 등을 우선 고려하세요.
            - 녹음이 너무 짧거나 사람 말, 음악, 차량 소음이 크면 낮은 confidence와 함께 더 긴 조용한 녹음이 필요하다고 설명하세요.

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
        candidateProperties.put("commonNameKo", Map.of(
            "type", "string",
            "description", "Most specific Korean common name supported by visible or audible evidence"
        ));
        candidateProperties.put("scientificName", Map.of(
            "type", "string",
            "description", "Scientific name for the most specific safe taxon; never null"
        ));
        candidateProperties.put("confidence", Map.of("type", "number", "minimum", 0, "maximum", 1));
        candidateProperties.put("evidence", Map.of(
            "type", "string",
            "description", "One Korean sentence with at least two observable visual or audio features"
        ));

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
        log.info("firebase storage read starting mediaAssetId={} bucket={} object={}", mediaAsset.getId(), ref.bucket(), ref.objectPath());
        long startedAt = System.currentTimeMillis();
        Blob blob = StorageClient.getInstance().bucket(ref.bucket()).get(ref.objectPath());
        if (blob == null) {
            throw new IllegalStateException("Firebase Storage object not found: " + mediaAsset.getStorageKey());
        }
        byte[] content = blob.getContent();
        log.info(
            "firebase storage read completed mediaAssetId={} bytes={} elapsedMs={}",
            mediaAsset.getId(),
            content.length,
            System.currentTimeMillis() - startedAt
        );
        return content;
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
