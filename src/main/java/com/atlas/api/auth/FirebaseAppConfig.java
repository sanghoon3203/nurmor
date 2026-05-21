package com.atlas.api.auth;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.io.FileInputStream;
import java.io.IOException;

@Configuration
@Profile("gcp")
public class FirebaseAppConfig {

    public FirebaseAppConfig(
        @Value("${atlas.firebase.storage-bucket}") String storageBucket,
        @Value("${atlas.firebase.service-account-path:}") String serviceAccountPath
    ) throws IOException {
        if (!FirebaseApp.getApps().isEmpty()) {
            return;
        }

        GoogleCredentials credentials = serviceAccountPath == null || serviceAccountPath.isBlank()
            ? GoogleCredentials.getApplicationDefault()
            : GoogleCredentials.fromStream(new FileInputStream(serviceAccountPath));

        FirebaseOptions options = FirebaseOptions.builder()
            .setCredentials(credentials)
            .setStorageBucket(storageBucket)
            .build();
        FirebaseApp.initializeApp(options);
    }
}
