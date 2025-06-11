package net.orion.facelinked.auth.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import net.orion.facelinked.auth.repository.UserRepository;
import net.orion.facelinked.auth.User;
import net.orion.facelinked.auth.services.AuthService;
import net.orion.facelinked.profile.service.StorageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthenticationController
{
    private final AuthService authService;

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping("/register")
    private ResponseEntity<AuthenticationResponse> Register(@Valid @RequestBody RegisterRequest request)
    {
        return ResponseEntity.ok(authService.register(request));
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping("/register/google")
    private ResponseEntity<AuthenticationResponse> RegisterGoogle(@Valid @RequestBody GoogleRegisterRequest request)
    {
        try {
            return ResponseEntity.ok(authService.registerGoogle(request));
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }
    }

    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResponse> Authenticate(@RequestBody AuthenticationRequest request) {
        try {
            return ResponseEntity.ok(authService.authenticate(request));
        } catch (Exception e)
        {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("/authenticate/google")
    public ResponseEntity<AuthenticationResponse> Authenticate(@RequestBody GoogleAuthenticationRequest request) {
        try {
            return ResponseEntity.ok(authService.authenticateGoogle(request));
        } catch (Exception e)
        {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
    }
}