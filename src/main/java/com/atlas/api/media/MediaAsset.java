package com.atlas.api.media;

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
@Table(name = "media_assets")
public class MediaAsset {

    @Id
    private UUID id;

    @Column(nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private MediaType type;

    @Column(nullable = false, length = 300)
    private String storageKey;

    @Column(nullable = false, length = 120)
    private String mimeType;

    @Column(nullable = false)
    private long sizeBytes;

    @Column(nullable = false, length = 128)
    private String checksum;

    @Column(nullable = false)
    private Instant createdAt;

    protected MediaAsset() {
    }

    public MediaAsset(UUID userId, MediaType type, String storageKey, String mimeType, long sizeBytes, String checksum) {
        this.id = UUID.randomUUID();
        this.userId = userId;
        this.type = type;
        this.storageKey = storageKey;
        this.mimeType = mimeType;
        this.sizeBytes = sizeBytes;
        this.checksum = checksum;
    }

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getUserId() {
        return userId;
    }

    public MediaType getType() {
        return type;
    }

    public String getStorageKey() {
        return storageKey;
    }

    public String getMimeType() {
        return mimeType;
    }

    public long getSizeBytes() {
        return sizeBytes;
    }

    public String getChecksum() {
        return checksum;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
