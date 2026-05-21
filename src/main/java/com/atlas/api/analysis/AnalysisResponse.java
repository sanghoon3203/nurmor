package com.atlas.api.analysis;

import java.util.List;
import java.util.UUID;

public record AnalysisResponse(
    UUID jobId,
    UUID observationRecordId,
    String model,
    String status,
    List<AnalysisCandidateResponse> candidates
) {
}
