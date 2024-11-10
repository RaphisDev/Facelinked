package net.orion.facelinked.profile.controller;

import lombok.RequiredArgsConstructor;
import net.orion.facelinked.auth.User;
import net.orion.facelinked.auth.repository.UserRepository;
import net.orion.facelinked.profile.repository.ProfileRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;


@Controller
@RequestMapping("/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileRepository profileRepository;

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
        profileRepository.delete(profileRepository.findByUsername(username).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND)));
    }
}
