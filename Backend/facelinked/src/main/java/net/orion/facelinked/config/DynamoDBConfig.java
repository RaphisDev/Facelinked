package net.orion.facelinked.config;

import com.amazonaws.auth.AWSCredentials;
import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.client.builder.AwsClientBuilder;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClientBuilder;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBMapper;
import net.orion.facelinked.chats.ChatMessage;
import org.socialsignin.spring.data.dynamodb.repository.config.EnableDynamoDBRepositories;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import software.amazon.awssdk.auth.credentials.ProfileCredentialsProvider;

@Configuration
@EnableDynamoDBRepositories (basePackages = "net.orion.facelinked")
public class DynamoDBConfig {

    @Value("${cloud.aws.credentials.profile-name}")
    private String profileName;

    @Value("${cloud.aws.region.static}")
    private String region;

    @Bean
    @Primary
    public DynamoDBMapper dynamoDBMapper() {
        return new DynamoDBMapper(AmazonDynamoDBClientBuilder.standard()
                .withCredentials(new AWSStaticCredentialsProvider(awsCredentials()))
                .withRegion(region)
                .build());
    }

    @Bean
    public AmazonDynamoDB amazonDynamoDB() {
        AmazonDynamoDBClientBuilder builder = AmazonDynamoDBClientBuilder.standard()
        .withCredentials(new AWSStaticCredentialsProvider(awsCredentials()));
        AmazonDynamoDB build = builder.build();
        return build;
    }

    public AWSCredentials awsCredentials() {
        var credentials = ProfileCredentialsProvider.builder().profileName(profileName).build().resolveCredentials();
        return new BasicAWSCredentials(credentials.accessKeyId(), credentials.secretAccessKey());
    }
}