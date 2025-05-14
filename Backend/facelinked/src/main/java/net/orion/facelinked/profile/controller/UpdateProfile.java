package net.orion.facelinked.profile.controller;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfile {
    private String name;
    private String location;
    private String hobbies;
    private boolean inRelationship;
}
