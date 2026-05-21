package com.atlas.api.auth;

public interface FirebaseTokenVerifier {

    AuthenticatedUser verify(String idToken);
}
