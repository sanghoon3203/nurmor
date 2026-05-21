package com.atlas.api.auth;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile({"local", "test", "default"})
public class LocalTokenVerifier implements FirebaseTokenVerifier {

    @Override
    public AuthenticatedUser verify(String idToken) {
        if (idToken == null || idToken.isBlank() || idToken.equals("invalid")) {
            throw new FirebaseAuthException("invalid local token", null);
        }
        return new AuthenticatedUser("local-" + idToken, idToken + "@atlas.local", "Local User");
    }
}
