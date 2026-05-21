package com.atlas.api.analysis;

import java.util.UUID;

public record AnalysisCandidateResponse(
    UUID id,
    String commonNameKo,
    String scientificName,
    double confidence,
    String evidence
) {
    public static AnalysisCandidateResponse from(SpeciesCandidate candidate) {
        return new AnalysisCandidateResponse(
            candidate.getId(),
            candidate.getCommonNameKo(),
            candidate.getScientificName(),
            candidate.getConfidence(),
            candidate.getEvidence()
        );
    }
}
