package com.atlas.api.auth;

public class FirebaseAuthException extends RuntimeException {

    public FirebaseAuthException(String message, Throwable cause) {
        super(message, cause);
    }
}
