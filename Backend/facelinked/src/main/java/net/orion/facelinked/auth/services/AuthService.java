package net.orion.facelinked.auth.services;

import lombok.RequiredArgsConstructor;
import net.orion.facelinked.auth.Role;
import net.orion.facelinked.auth.User;
import net.orion.facelinked.auth.controller.AuthenticationRequest;
import net.orion.facelinked.auth.controller.AuthenticationResponse;
import net.orion.facelinked.auth.controller.RegisterRequest;
import net.orion.facelinked.auth.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService
{
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtAuthService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthenticationResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }

        var user = User.builder()
                .email(request.getEmail().toLowerCase())
                .name(request.getName())
                .userName(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        userRepository.save(user);
        var jwtToken = jwtService.generateToken(user);

        return AuthenticationResponse.builder()
                .token(jwtToken)
                .build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) throws Exception {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().toLowerCase(), request.getPassword())
        );
        var user = userRepository.findByEmail(request.getEmail().toLowerCase()).orElseThrow(() -> new Exception("User not found"));

        var jwtToken = jwtService.generateToken(user);

        return AuthenticationResponse.builder()
                .token(jwtToken)
                .username(user.getUserName())
                .build();
    }
}
