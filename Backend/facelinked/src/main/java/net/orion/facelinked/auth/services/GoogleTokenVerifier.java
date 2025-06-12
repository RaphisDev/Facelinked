package net.orion.facelinked.auth.services;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.json.jackson2.JacksonFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class GoogleTokenVerifier {
    @Value("${google.android.client.id}")
    private String ANDROID_CLIENT_ID;

    @Value("${google.ios.client.id}")
    private String IOS_CLIENT_ID;

    public GoogleIdToken.Payload verifyToken(String idTokenString, boolean isAndroid) throws Exception {
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                .setAudience(Collections.singletonList(isAndroid ? ANDROID_CLIENT_ID : IOS_CLIENT_ID))
                .setIssuer("https://accounts.google.com")
                .build();

        GoogleIdToken idToken = verifier.verify(idTokenString);
        if (idToken != null) {
            return idToken.getPayload();
        } else {
            throw new Exception("Invalid ID token.");
        }
    }
}
