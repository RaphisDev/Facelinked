package net.orion.facelinked.profile;

import com.amazonaws.services.dynamodbv2.datamodeling.*;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import net.orion.facelinked.networks.NetworkMember;

import java.util.Date;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@DynamoDBTable(tableName = "Profile")
public class Profile {

    @DynamoDBHashKey
    String username;
    @DynamoDBAttribute(attributeName = "name")
    String name;
    @DynamoDBAttribute(attributeName = "profilePicturePath")
    String profilePicturePath;
    @DynamoDBAttribute(attributeName = "dateOfBirth")
    String dateOfBirth;
    @DynamoDBAttribute(attributeName="hobbies")
    String hobbies;
    @DynamoDBAttribute(attributeName="inRelationship")
    boolean inRelationship;
    @DynamoDBAttribute(attributeName="partner")
    String partner;
    @DynamoDBAttribute(attributeName="location")
    String location;
    @DynamoDBAttribute(attributeName="score")
    Integer score;
    @DynamoDBAttribute(attributeName="friends")
    @DynamoDBTyped(DynamoDBMapperFieldModel.DynamoDBAttributeType.L)
    List<NetworkMember> friends;
    @DynamoDBAttribute(attributeName="searchName")
    String searchName;
}