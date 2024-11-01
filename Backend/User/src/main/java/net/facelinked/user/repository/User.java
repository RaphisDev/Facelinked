package net.facelinked.user.repository;

import jakarta.validation.constraints.*;
import org.springframework.data.annotation.Id;

public record User(@Id String username, @NotEmpty String name,
                   String profilePicturePath, @Positive int age,
                   String schoolName, Class schoolClass,
                   boolean inRelationship, String partner, String location, Status status)
{

}
