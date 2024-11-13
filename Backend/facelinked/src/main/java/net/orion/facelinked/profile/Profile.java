package net.orion.facelinked.profile;

import jakarta.persistence.Entity;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

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
    String dateOfBirth;
    String schoolName;
    boolean inRelationship;
    String partner;
    String location;
}
