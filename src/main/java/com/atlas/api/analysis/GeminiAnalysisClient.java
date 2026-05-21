package com.atlas.api.analysis;

import com.atlas.api.observation.ObservationRecord;
import com.atlas.api.media.MediaAsset;

import java.util.List;

public interface GeminiAnalysisClient {

    List<GeminiCandidate> analyze(ObservationRecord observationRecord, List<MediaAsset> mediaAssets);
}
