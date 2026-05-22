package com.atlas.api.codex;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "codex_entries")
public class CodexEntry {

    @Id
    private UUID id;

    @Column(nullable = false)
    private UUID habitatCellId;

    @Column(nullable = false, length = 180)
    private String speciesKey;

    @Column(nullable = false, length = 120)
    private String displayName;

    @Column(length = 160)
    private String scientificName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private CodexCategory category;

    @Column(length = 300)
    private String representativeMediaKey;

    @Column(nullable = false)
    private long discoveryNumber;

    @Column(nullable = false)
    private int observationCount;

    @Column(nullable = false)
    private double bestConfidence;

    @Column(nullable = false)
    private Instant firstObservedAt;

    @Column(nullable = false)
    private Instant lastObservedAt;

    protected CodexEntry() {
    }

    public CodexEntry(UUID habitatCellId, String speciesKey, String displayName, String scientificName,
                      CodexCategory category, String representativeMediaKey, long discoveryNumber,
                      double bestConfidence, Instant observedAt) {
        this.id = UUID.randomUUID();
        this.habitatCellId = habitatCellId;
        this.speciesKey = speciesKey;
        this.displayName = displayName;
        this.scientificName = scientificName;
        this.category = category;
        this.representativeMediaKey = representativeMediaKey;
        this.discoveryNumber = discoveryNumber;
        this.observationCount = 1;
        this.bestConfidence = bestConfidence;
        this.firstObservedAt = observedAt;
        this.lastObservedAt = observedAt;
    }

    public void addObservation(double confidence, Instant observedAt) {
        observationCount += 1;
        bestConfidence = Math.max(bestConfidence, confidence);
        lastObservedAt = observedAt;
    }

    public UUID getId() {
        return id;
    }

    public UUID getHabitatCellId() {
        return habitatCellId;
    }

    public String getSpeciesKey() {
        return speciesKey;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getScientificName() {
        return scientificName;
    }

    public CodexCategory getCategory() {
        return category;
    }

    public String getRepresentativeMediaKey() {
        return representativeMediaKey;
    }

    public long getDiscoveryNumber() {
        return discoveryNumber;
    }

    public int getObservationCount() {
        return observationCount;
    }

    public double getBestConfidence() {
        return bestConfidence;
    }

    public Instant getFirstObservedAt() {
        return firstObservedAt;
    }

    public Instant getLastObservedAt() {
        return lastObservedAt;
    }
}
