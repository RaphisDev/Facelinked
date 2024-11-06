package net.orion.facelinked.controller;

import jakarta.validation.Valid;
import net.orion.facelinked.repository.UserRepository;
import net.orion.facelinked.repository.User;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

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
    private void Create(@Valid @RequestBody User user)
    {
        //Let it get PictureFile instead of Path to upload it
        userRepository.create(user);
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