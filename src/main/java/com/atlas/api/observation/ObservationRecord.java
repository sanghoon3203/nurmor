package com.atlas.api.observation;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "observation_records")
public class ObservationRecord {

    @Id
    private UUID id;

    @Column(nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private UUID habitatCellId;

    @Column(nullable = false)
    private double exactLat;

    @Column(nullable = false)
    private double exactLng;

    @Column(nullable = false)
    private double publicLat;

    @Column(nullable = false)
    private double publicLng;

    @Column(nullable = false)
    private double locationAccuracyMeters;

    @Column(nullable = false, length = 500)
    private String mediaAssetIdsCsv;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private ObservationStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private Visibility visibility;

    @Column
    private UUID selectedSpeciesCandidateId;

    @Column(nullable = false)
    private Instant capturedAt;

    @Column(nullable = false)
    private Instant createdAt;

    protected ObservationRecord() {
    }

    public ObservationRecord(UUID userId, UUID habitatCellId, double exactLat, double exactLng, double publicLat,
                             double publicLng, double locationAccuracyMeters, String mediaAssetIdsCsv, Instant capturedAt) {
        this.id = UUID.randomUUID();
        this.userId = userId;
        this.habitatCellId = habitatCellId;
        this.exactLat = exactLat;
        this.exactLng = exactLng;
        this.publicLat = publicLat;
        this.publicLng = publicLng;
        this.locationAccuracyMeters = locationAccuracyMeters;
        this.mediaAssetIdsCsv = mediaAssetIdsCsv;
        this.status = ObservationStatus.CAPTURED;
        this.visibility = Visibility.PRIVATE;
        this.capturedAt = capturedAt;
    }

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }

    public void markAnalyzing() {
        status = ObservationStatus.ANALYZING;
    }

    public void markNeedsReview() {
        status = ObservationStatus.NEEDS_REVIEW;
    }

    public void markFailed() {
        status = ObservationStatus.FAILED;
    }

    public void plant(UUID selectedSpeciesCandidateId, Visibility visibility) {
        this.selectedSpeciesCandidateId = selectedSpeciesCandidateId;
        this.visibility = visibility;
        this.status = ObservationStatus.PLANTED;
    }

    public UUID getId() {
        return id;
    }

    public UUID getUserId() {
        return userId;
    }

    public UUID getHabitatCellId() {
        return habitatCellId;
    }

    public double getPublicLat() {
        return publicLat;
    }

    public double getPublicLng() {
        return publicLng;
    }

    public ObservationStatus getStatus() {
        return status;
    }

    public Visibility getVisibility() {
        return visibility;
    }

    public UUID getSelectedSpeciesCandidateId() {
        return selectedSpeciesCandidateId;
    }

    public Instant getCapturedAt() {
        return capturedAt;
    }
}
