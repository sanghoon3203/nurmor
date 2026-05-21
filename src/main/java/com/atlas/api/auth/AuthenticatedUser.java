package com.atlas.api.auth;

public record AuthenticatedUser(
    String firebaseUid,
    String email,
    String displayName
) {
}
