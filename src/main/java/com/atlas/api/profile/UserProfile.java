package com.atlas.api.profile;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "user_profiles")
public class UserProfile {

    @Id
    private UUID userId;

    @Column(nullable = false, unique = true, length = 160)
    private String firebaseUid;

    @Column(length = 240)
    private String email;

    @Column(nullable = false, length = 80)
    private String displayName;

    @Column(length = 500)
    private String avatarUrl;

    @Column(nullable = false)
    private boolean publicContributor;

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    protected UserProfile() {
    }

    public UserProfile(UUID userId, String firebaseUid, String email, String displayName) {
        this.userId = userId;
        this.firebaseUid = firebaseUid;
        this.email = email;
        this.displayName = displayName;
        this.publicContributor = false;
    }

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }

    public void update(String displayName, String avatarUrl, boolean publicContributor) {
        this.displayName = displayName;
        this.avatarUrl = avatarUrl;
        this.publicContributor = publicContributor;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getFirebaseUid() {
        return firebaseUid;
    }

    public String getEmail() {
        return email;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public boolean isPublicContributor() {
        return publicContributor;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
