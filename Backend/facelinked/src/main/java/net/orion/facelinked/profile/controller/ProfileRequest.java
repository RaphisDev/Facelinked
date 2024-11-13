package net.orion.facelinked.profile.controller;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileRequest {

    private String username;
    private String name;
    private String profilePicturePath;
    private String age;
    private String schoolName;
    private boolean inRelationship;
    private String partner;
    private String location;
}
