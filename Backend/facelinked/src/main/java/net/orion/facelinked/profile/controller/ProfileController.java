package net.orion.facelinked.profile.controller;

import lombok.RequiredArgsConstructor;
import net.orion.facelinked.auth.services.UserService;
import net.orion.facelinked.config.PrimaryKey;
import net.orion.facelinked.profile.Post;
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

import java.util.Date;
import java.util.List;

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

    @ResponseStatus(HttpStatus.FOUND)
    @GetMapping("/search/{username}")
    private ResponseEntity<List<Profile>> SearchProfile(@PathVariable String username) {
        var profile = profileService.searchByUsername(username);
        if(profile.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        System.out.println(profile.get());
        return ResponseEntity.ok(profile.get());
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

        profileService.save(Profile.builder().profilePicturePath(profile.getProfilePicturePath())
                .username(profile.getUsername()).name(profile.getName()).dateOfBirth(profile.getDateOfBirth())
                .hobbies(profile.getHobbies()).score(0).inRelationship(profile.isInRelationship())
                .partner(profile.getPartner()).location(profile.getLocation()).build());
    }

    @ResponseStatus(HttpStatus.ACCEPTED)
    @PostMapping("/post")
    public void Post(@RequestBody Post profile, @AuthenticationPrincipal UserDetails userDetails)
    {
        var sender = userService.findByEmail(userDetails.getUsername()).getUserName();

        profileService.savePost(Post.builder().
                title(profile.getTitle()).
                id(new PrimaryKey(sender, System.currentTimeMillis())).
                content(profile.getContent()).
                likes(0).
                build());
    }

    @ResponseStatus(HttpStatus.FOUND)
    @GetMapping("/posts/all/{username}")
    public ResponseEntity<List<Post>> GetPosts(@PathVariable String username)
    {
        return ResponseEntity.ok(profileService.getPosts(username));
    }

    @ResponseStatus(HttpStatus.FOUND)
    @GetMapping("/posts/last5/{username}")
    public ResponseEntity<List<Post>> GetLast5Posts(@PathVariable String username)
    {
        return ResponseEntity.ok(profileService.getLast5Posts(username));
    }

    @ResponseStatus(HttpStatus.ACCEPTED)
    @GetMapping("/upload")
    private ResponseEntity<String> BucketUrl()
    {
        return ResponseEntity.ok(storageService.generatePresignedUrl());
    }
}