package net.orion.facelinked.profile.controller;

import lombok.RequiredArgsConstructor;
import net.orion.facelinked.auth.services.UserService;
import net.orion.facelinked.profile.Profile;
import net.orion.facelinked.profile.ProfileRequest;
import net.orion.facelinked.profile.service.ProfileService;
import net.orion.facelinked.profile.service.StorageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@Controller
@RequestMapping("/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;
    private final UserService userService;
    private final StorageService storageService;

    @ResponseStatus(HttpStatus.FOUND)
    @GetMapping("/{username}")
    private ResponseEntity<Profile> GetProfile(@PathVariable String username) {
        var profile = profileService.findByUsername(username);
        return ResponseEntity.ok(profile);
    }

    //To-Do: Also delete User
    @ResponseStatus(HttpStatus.ACCEPTED)
    @DeleteMapping("/{username}")
    private void Delete(@PathVariable String username)
    {
        //Only when user is authenticated
        //profileRepository.delete(profileRepository.findByUsername(username).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND)));
    }
    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping("/register")
    private void CompleteProfile(@RequestBody ProfileRequest profile, @AuthenticationPrincipal UserDetails userDetails)
    {
        if (userDetails != null) {
            if(!userService.findByEmail(userDetails.getUsername()).getUserName().equals(profile.getUsername())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not allowed to complete this profile");
            }
        }
        else {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }

        if(profileService.existsByUsername(profile.getUsername())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT);
        }
        profileService.save(Profile.builder().profilePicturePath(profile.getProfilePicturePath())
                .username(profile.getUsername()).name(profile.getName()).dateOfBirth(profile.getDateOfBirth())
                .hobbies(profile.getHobbies()).score(0).inRelationship(profile.isInRelationship())
                .partner(profile.getPartner()).location(profile.getLocation()).build());
    }

    @ResponseStatus(HttpStatus.ACCEPTED)
    @GetMapping("/upload")
    private ResponseEntity<String> BucketUrl()
    {
        return ResponseEntity.ok(storageService.generatePresignedUrl());
    }
}