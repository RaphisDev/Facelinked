package net.orion.facelinked.profile.controller;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Profile {

    @jakarta.persistence.Id
    String username;
    String name;
    String profilePicturePath;
    @Positive
    int age;
    String schoolName;
    boolean inRelationship;
    String partner;
    String location;
}
