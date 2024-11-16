package net.orion.facelinked.profile.config;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.ProfileCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

@Configuration
public class StorageConfig {

    @Value("${cloud.aws.credentials.profile-name}")
    private String profileName;

    @Value("${cloud.aws.region.static}")
    private String region;

    @Bean
    public S3Presigner generateS3Client() {
        return S3Presigner.builder().credentialsProvider(ProfileCredentialsProvider.builder().profileName(profileName).build()).region(Region.of(region)).build();
    }
}