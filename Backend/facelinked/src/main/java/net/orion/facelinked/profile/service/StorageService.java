package net.orion.facelinked.profile.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;

import java.security.SecureRandom;
import java.time.Duration;

@Service
public class StorageService {

    @Value("${cloud.aws.s3.bucket.name}")
    private String bucketName;

    private String RandomizeBucketName() {
        byte[] rawBytes = new byte[16];
        SecureRandom random = new SecureRandom();
        random.nextBytes(rawBytes);

        StringBuilder hexString = new StringBuilder();
        for (byte b : rawBytes) {
            hexString.append(String.format("%02x", b));
        }
        return hexString.toString();
    }

    public String generatePresignedUrl() {
        try (S3Presigner presigner = S3Presigner.create()) {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(RandomizeBucketName())
                    .build();

            PresignedPutObjectRequest presignedRequest = presigner.presignPutObject(r -> r.putObjectRequest(putObjectRequest).signatureDuration(Duration.ofMinutes(1)));
            return presignedRequest.url().toString();
        }
    }
}
