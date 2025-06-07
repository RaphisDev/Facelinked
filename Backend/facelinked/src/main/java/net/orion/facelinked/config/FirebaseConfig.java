package net.orion.facelinked.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.Objects;

@Configuration
public class FirebaseConfig {
    @PostConstruct
    public void initialize() throws IOException {
        GoogleCredentials credentials;

        try {
            // Try to load from classpath resource
            credentials = GoogleCredentials.fromStream(
                    Objects.requireNonNull(getClass().getClassLoader().getResourceAsStream("serviceAccountKey.json")));
        } catch (Exception e) {
            String envCredentials = System.getenv("FIREBASE_CREDENTIALS");
            if (envCredentials != null && !envCredentials.isEmpty()) {
                credentials = GoogleCredentials.fromStream(new ByteArrayInputStream(envCredentials.getBytes()));
            } else {
                throw new IOException("Firebase credentials not found", e);
            }
        }

        FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(credentials)
                .build();

        if (FirebaseApp.getApps().isEmpty()) {
            FirebaseApp.initializeApp(options);
        }
    }
}
