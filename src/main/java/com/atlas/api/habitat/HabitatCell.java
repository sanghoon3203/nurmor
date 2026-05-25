package com.atlas.api.habitat;

import com.atlas.api.observation.BloomState;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "habitat_cells")
public class HabitatCell {

    @Id
    private UUID id;

    @Column(nullable = false, unique = true, length = 80)
    private String cellKey;

    @Column(nullable = false)
    private double centerLat;

    @Column(nullable = false)
    private double centerLng;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private BloomState bloomState;

    @Column(nullable = false)
    private int bloomScore;

    @Column(nullable = false)
    private int observationCount;

    @Column(nullable = false)
    private int speciesCount;

    @Column(nullable = false)
    private int contributorCount;

    @Column(nullable = false, length = 120)
    private String displayName;

    @Column(nullable = false, length = 1000)
    private String description;

    @Column(nullable = false, length = 200)
    private String habitatTypesCsv;

    @Column(length = 4000)
    private String boundaryGeoJson;

    @Column(nullable = false)
    private Instant updatedAt;

    protected HabitatCell() {
    }

    public HabitatCell(String cellKey, double centerLat, double centerLng) {
        this.id = UUID.randomUUID();
        this.cellKey = cellKey;
        this.centerLat = centerLat;
        this.centerLng = centerLng;
        this.bloomState = BloomState.UNOBSERVED;
        this.bloomScore = 0;
        this.observationCount = 0;
        this.speciesCount = 0;
        this.contributorCount = 0;
        this.displayName = "";
        this.description = "";
        this.habitatTypesCsv = "URBAN_GREEN";
        this.boundaryGeoJson = null;
        this.updatedAt = Instant.now();
    }

    @PrePersist
    @PreUpdate
    void touch() {
        updatedAt = Instant.now();
    }

    public void updateBloom(int bloomScore, BloomState bloomState, int observationCount, int speciesCount, int contributorCount) {
        this.bloomScore = bloomScore;
        this.bloomState = bloomState;
        this.observationCount = observationCount;
        this.speciesCount = speciesCount;
        this.contributorCount = contributorCount;
    }

    public UUID getId() {
        return id;
    }

    public String getCellKey() {
        return cellKey;
    }

    public double getCenterLat() {
        return centerLat;
    }

    public double getCenterLng() {
        return centerLng;
    }

    public BloomState getBloomState() {
        return bloomState;
    }

    public int getBloomScore() {
        return bloomScore;
    }

    public int getObservationCount() {
        return observationCount;
    }

    public int getSpeciesCount() {
        return speciesCount;
    }

    public int getContributorCount() {
        return contributorCount;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }

    public String getHabitatTypesCsv() {
        return habitatTypesCsv;
    }

    public String getBoundaryGeoJson() {
        return boundaryGeoJson;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
