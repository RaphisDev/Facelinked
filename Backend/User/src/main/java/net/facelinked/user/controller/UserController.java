package net.facelinked.user.controller;

import jakarta.validation.Valid;
import net.facelinked.user.repository.Status;
import net.facelinked.user.repository.UserRepository;
import net.facelinked.user.repository.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.io.File;

@RestController
@RequestMapping("/user")
public class UserController
{
    private final UserRepository userRepository;

    public UserController(UserRepository userRepository)
    {
        this.userRepository = userRepository;
    }

    @CrossOrigin(origins = "http://localhost:3000")
    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping("")
    private void Create(@Valid @RequestBody User user, File profilePicture)
    {
        //Let it get PictureFile instead of Path to upload it
        userRepository.create(user, profilePicture);
    }

    @CrossOrigin(origins = "http://localhost:3000")
    @ResponseStatus(HttpStatus.FOUND)
    @GetMapping("/{username}")
    private User GetUser(@PathVariable String username)
    {
        return userRepository.findByUsername(username);
    }

    //Make Put/Update with GraphQL
    //Make Get with GraphQL

    @CrossOrigin(origins = "http://localhost:3000")
    @ResponseStatus(HttpStatus.ACCEPTED)
    @DeleteMapping("/{name}")
    private void Delete(@PathVariable String name)
    {
        userRepository.delete(name);
    }
}