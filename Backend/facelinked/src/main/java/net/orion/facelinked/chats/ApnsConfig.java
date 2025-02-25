package net.orion.facelinked.chats;

import com.eatthepath.pushy.apns.ApnsClient;
import com.eatthepath.pushy.apns.ApnsClientBuilder;
import com.eatthepath.pushy.apns.auth.ApnsSigningKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.File;
import java.io.IOException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;

@Configuration
public class ApnsConfig {

    @Value("${apns.key.path}")
    private String apnsKeyPath;

    @Value("${apns.key.id}")
    private String apnsKeyId;

    @Value("${apns.team.id}")
    private String apnsTeamId;

    @Bean
    public ApnsClient apnsClient() throws IOException {
        try {
            return new ApnsClientBuilder()
                    .setApnsServer(ApnsClientBuilder.PRODUCTION_APNS_HOST)
                    .setSigningKey(ApnsSigningKey.loadFromPkcs8File(new File(apnsKeyPath),
                            apnsTeamId, apnsKeyId))
                    .build();
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new RuntimeException(e);
        }
    }
}

