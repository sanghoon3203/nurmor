package com.atlas.api.auth;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("gcp")
public class FirebaseAdminTokenVerifier implements FirebaseTokenVerifier {

    @Override
    public AuthenticatedUser verify(String idToken) {
        try {
            FirebaseToken token = FirebaseAuth.getInstance().verifyIdToken(idToken);
            return new AuthenticatedUser(token.getUid(), token.getEmail(), token.getName());
        } catch (com.google.firebase.auth.FirebaseAuthException exception) {
            throw new FirebaseAuthException("invalid firebase token", exception);
        }
    }
}
