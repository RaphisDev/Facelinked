package net.orion.facelinked.networks;

import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBTypeConverter;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import net.orion.facelinked.networks.NetworkMember;

import java.util.ArrayList;
import java.util.List;

public class NetworkMemberListConverter implements DynamoDBTypeConverter<List<String>, List<NetworkMember>> {
    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public List<String> convert(List<NetworkMember> members) {
        if (members == null) return new ArrayList<>();
        return members.stream()
                .map(member -> {
                    try {
                        return objectMapper.writeValueAsString(member);
                    } catch (JsonProcessingException e) {
                        throw new RuntimeException(e);
                    }
                })
                .toList();
    }

    @Override
    public List<NetworkMember> unconvert(List<String> strings) {
        if (strings == null) return new ArrayList<>();
        return strings.stream()
                .map(str -> {
                    try {
                        return objectMapper.readValue(str, NetworkMember.class);
                    } catch (JsonProcessingException e) {
                        throw new RuntimeException(e);
                    }
                })
                .toList();
    }
}