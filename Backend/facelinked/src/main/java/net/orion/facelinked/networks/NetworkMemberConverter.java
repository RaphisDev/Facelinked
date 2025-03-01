package net.orion.facelinked.networks;

import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBTypeConverter;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.HashMap;
import java.util.Map;

public class NetworkMemberConverter implements DynamoDBTypeConverter<String, NetworkMember> {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String convert(NetworkMember member) {
        try {
            return objectMapper.writeValueAsString(member);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public NetworkMember unconvert(String str) {
        try {
            return objectMapper.readValue(str, NetworkMember.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }
}