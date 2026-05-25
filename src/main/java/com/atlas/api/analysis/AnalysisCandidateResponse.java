package com.atlas.api.analysis;

import com.atlas.api.codex.CodexCategory;
import com.atlas.api.codex.DisplayGroup;
import com.atlas.api.codex.SpeciesClassifier;

import java.util.UUID;

public record AnalysisCandidateResponse(
    UUID id,
    String commonNameKo,
    String scientificName,
    CodexCategory category,
    DisplayGroup displayGroup,
    double confidence,
    String evidence
) {
    public static AnalysisCandidateResponse from(SpeciesCandidate candidate) {
        CodexCategory category = CodexCategory.infer(candidate.getCommonNameKo(), candidate.getScientificName());
        return new AnalysisCandidateResponse(
            candidate.getId(),
            candidate.getCommonNameKo(),
            candidate.getScientificName(),
            category,
            SpeciesClassifier.displayGroup(candidate.getCommonNameKo(), candidate.getScientificName(), category),
            candidate.getConfidence(),
            candidate.getEvidence()
        );
    }
}
