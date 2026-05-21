package com.atlas.api.analysis;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "analysis_jobs")
public class AnalysisJob {

    @Id
    private UUID id;

    @Column(nullable = false)
    private UUID observationRecordId;

    @Column(nullable = false, length = 80)
    private String model;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private AnalysisStatus status;

    @Column(nullable = false, length = 40)
    private String promptVersion;

    @Column(length = 2000)
    private String errorMessage;

    @Column(nullable = false)
    private Instant createdAt;

    @Column
    private Instant completedAt;

    protected AnalysisJob() {
    }

    public AnalysisJob(UUID observationRecordId, String model, String promptVersion) {
        this.id = UUID.randomUUID();
        this.observationRecordId = observationRecordId;
        this.model = model;
        this.promptVersion = promptVersion;
        this.status = AnalysisStatus.QUEUED;
        this.createdAt = Instant.now();
    }

    public void running() {
        status = AnalysisStatus.RUNNING;
    }

    public void succeeded() {
        status = AnalysisStatus.SUCCEEDED;
        completedAt = Instant.now();
    }

    public void failed(String errorMessage) {
        status = AnalysisStatus.FAILED;
        this.errorMessage = errorMessage;
        completedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getObservationRecordId() {
        return observationRecordId;
    }

    public String getModel() {
        return model;
    }

    public AnalysisStatus getStatus() {
        return status;
    }
}
