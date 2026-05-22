package com.atlas.api.profile;

import java.time.Instant;
import java.util.UUID;

public record UserProfileResponse(
    UUID userId,
    String email,
    String displayName,
    String avatarUrl,
    boolean publicContributor,
    Instant createdAt,
    Instant updatedAt
) {
    static UserProfileResponse from(UserProfile profile) {
        return new UserProfileResponse(
            profile.getUserId(),
            profile.getEmail(),
            profile.getDisplayName(),
            profile.getAvatarUrl(),
            profile.isPublicContributor(),
            profile.getCreatedAt(),
            profile.getUpdatedAt()
        );
    }
}
