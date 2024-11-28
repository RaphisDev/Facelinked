package net.orion.facelinked.profile.controller;

import lombok.RequiredArgsConstructor;
import net.orion.facelinked.auth.repository.UserRepository;
import net.orion.facelinked.profile.Profile;
import net.orion.facelinked.profile.ProfileRequest;
import net.orion.facelinked.profile.repository.ProfileRepository;
import net.orion.facelinked.profile.service.StorageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

@Controller
@RequestMapping("/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final StorageService storageService;

    //Make Get with GraphQL
    @ResponseStatus(HttpStatus.FOUND)
    @GetMapping("/{username}")
    private ResponseEntity<Profile> GetProfile(@PathVariable String username) {
        Optional<Profile> profile = profileRepository.findByUsername(username);
        if (profile.isPresent())
            return ResponseEntity.ok(profile.get());
        else {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
    }
    //Make Put/Update with GraphQL

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
            if(!userRepository.findByEmail(userDetails.getUsername()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND)).getUserName().equals(profile.getUsername())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not allowed to complete this profile");
            }
        }
        else {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }

        if(profileRepository.existsByUsername(profile.getUsername())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT);
        }
        profileRepository.save(Profile.builder().profilePicturePath(profile.getProfilePicturePath())
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