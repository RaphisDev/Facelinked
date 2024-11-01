package net.facelinked.user.repository;

import jakarta.validation.constraints.Positive;

import java.util.Dictionary;

public record Class(@Positive int grade, char classIdentifier)
{
    //add user to a global class instance to let others watch students in the class
}
