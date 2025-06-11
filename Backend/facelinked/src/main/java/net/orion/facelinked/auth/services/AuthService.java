package net.orion.facelinked.auth.services;

import com.google.api.client.auth.openidconnect.IdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import net.orion.facelinked.auth.Role;
import net.orion.facelinked.auth.User;
import net.orion.facelinked.auth.controller.*;
import net.orion.facelinked.auth.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class AuthService
{
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtAuthService jwtService;
    private final AuthenticationManager authenticationManager;
    private final GoogleTokenVerifier googleTokenVerifier;

    public AuthenticationResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        var user = User.builder()
                .email(request.getEmail().toLowerCase())
                .name(request.getName())
                .userName(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .deviceTokens(Collections.emptyList())
                .googleId("")
                .build();

        userRepository.save(user);
        var jwtToken = jwtService.generateToken(user);

        return AuthenticationResponse.builder()
                .token(jwtToken)
                .build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) throws Exception {
        if (request.getPassword() == null || request.getPassword().isEmpty()) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail().toLowerCase(), request.getPassword())
            );
            var user = userRepository.findByEmail(request.getEmail().toLowerCase())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

            if (user.getPassword() == null || user.getPassword().isEmpty()) {
                throw new IllegalArgumentException("Invalid credentials");
            }

            var jwtToken = jwtService.generateToken(user);

            return AuthenticationResponse.builder()
                    .token(jwtToken)
                    .username(user.getUserName())
                    .build();
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid credentials");
        }
    }

    public AuthenticationResponse registerGoogle(@Valid GoogleRegisterRequest request) throws Exception {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        var payload = googleTokenVerifier.verifyToken(request.getGoogleToken(), request.isAndroid());
        if (!payload.getEmail().equals(request.getEmail())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        String googleId = payload.getSubject();
        if (googleId.isEmpty()) {
            throw new IllegalArgumentException("Invalid credentials");
        }
        if (userRepository.existsByGoogleId(googleId)) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        var user = User.builder()
                .email(request.getEmail().toLowerCase())
                .name(request.getName())
                .userName(request.getUsername())
                .password("")
                .deviceTokens(Collections.emptyList())
                .googleId(payload.getSubject())
                .build();

        userRepository.save(user);
        var jwtToken = jwtService.generateToken(user);

        return AuthenticationResponse.builder()
                .token(jwtToken)
                .build();
    }


    public AuthenticationResponse authenticateGoogle(GoogleAuthenticationRequest request) throws Exception {
        try {
            var user = userRepository.findByEmail(request.getEmail().toLowerCase())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

            if (user.getGoogleId() == null || user.getGoogleId().isEmpty()) {
                throw new IllegalArgumentException("Invalid credentials");
            }

            var payload = googleTokenVerifier.verifyToken(request.getGoogleToken(), request.isAndroid());
            if (!payload.getSubject().equals(user.getGoogleId())) {
                throw new IllegalArgumentException("Invalid credentials");
            }
            if (!payload.getEmail().equals(user.getEmail())) {
                throw new IllegalArgumentException("Invalid credentials");
            }

            var jwtToken = jwtService.generateToken(user);

            return AuthenticationResponse.builder()
                    .token(jwtToken)
                    .username(user.getUserName())
                    .build();
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid credentials");
        }
    }
}
