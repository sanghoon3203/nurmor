package com.atlas.api.analysis;

import com.atlas.api.media.MediaAsset;
import com.atlas.api.observation.ObservationRecord;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Profile({"local", "test", "default"})
public class StubGeminiAnalysisClient implements GeminiAnalysisClient {

    @Override
    public List<GeminiCandidate> analyze(ObservationRecord observationRecord, List<MediaAsset> mediaAssets) {
        return List.of(
            new GeminiCandidate("노랑나비", "Eurema hecabe", 0.87, "노란 날개색과 작은 체형이 관찰됩니다."),
            new GeminiCandidate("흰나비류", null, 0.54, "날개 형태는 유사하지만 색상과 무늬가 불확실합니다.")
        );
    }
}
