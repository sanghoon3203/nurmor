package com.atlas.api.analysis;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.util.UUID;

@Entity
@Table(name = "species_candidates")
public class SpeciesCandidate {

    @Id
    private UUID id;

    @Column(nullable = false)
    private UUID analysisJobId;

    @Column(nullable = false, length = 120)
    private String commonNameKo;

    @Column(length = 160)
    private String scientificName;

    @Column(nullable = false)
    private double confidence;

    @Column(nullable = false, length = 2000)
    private String evidence;

    protected SpeciesCandidate() {
    }

    public SpeciesCandidate(UUID analysisJobId, String commonNameKo, String scientificName, double confidence, String evidence) {
        this.id = UUID.randomUUID();
        this.analysisJobId = analysisJobId;
        this.commonNameKo = commonNameKo;
        this.scientificName = scientificName;
        this.confidence = confidence;
        this.evidence = evidence;
    }

    public UUID getId() {
        return id;
    }

    public UUID getAnalysisJobId() {
        return analysisJobId;
    }

    public String getCommonNameKo() {
        return commonNameKo;
    }

    public String getScientificName() {
        return scientificName;
    }

    public double getConfidence() {
        return confidence;
    }

    public String getEvidence() {
        return evidence;
    }
}
