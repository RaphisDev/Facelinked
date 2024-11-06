package net.orion.facelinked.repository;

import jakarta.validation.constraints.*;
import org.springframework.data.annotation.Id;

public record User(@Id String username, @NotEmpty String name,
                   String profilePicturePath, @Positive int age,
                   String schoolName, boolean inRelationship,
                   String partner, String location)
{

}
