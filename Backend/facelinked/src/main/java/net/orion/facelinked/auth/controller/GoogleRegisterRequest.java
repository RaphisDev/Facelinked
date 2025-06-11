package net.orion.facelinked.auth.controller;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoogleRegisterRequest {

    private String username;
    private String name;
    private String googleToken;
    private String email;
    private boolean android;
}
