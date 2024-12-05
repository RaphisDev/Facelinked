package net.orion.facelinked.networks;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class MemberAttributeConverter implements AttributeConverter<NetworkMember, String> {
    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(NetworkMember member) {
        try {
            return objectMapper.writeValueAsString(member);
        } catch (JsonProcessingException jpe) {
            System.out.println("Cannot convert Address into JSON");
            return null;
        }
    }

    @Override
    public NetworkMember convertToEntityAttribute(String value) {
        try {
            return objectMapper.readValue(value, NetworkMember.class);
        } catch (JsonProcessingException e) {
            System.out.println("Cannot convert JSON into Address");
            return null;
        }
    }
}