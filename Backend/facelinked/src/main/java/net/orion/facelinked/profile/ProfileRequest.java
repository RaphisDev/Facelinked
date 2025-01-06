package net.orion.facelinked.profile;

import lombok.Builder;
import lombok.Data;

@Data
public class ProfileRequest {

    String username;
    String name;
    String profilePicturePath;
    String dateOfBirth;
    String hobbies;
    boolean inRelationship;
    String partner;
    String location;
}