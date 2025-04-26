package net.orion.facelinked.config;

import lombok.AllArgsConstructor;
import net.orion.facelinked.auth.services.JwtAuthService;
import net.orion.facelinked.auth.services.UserService;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageType;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Controller
@AllArgsConstructor
public class WebSocketAuthenticationHandler {

    private static final Map<String, String> sessionIdToUsername = new ConcurrentHashMap<>();
    private static final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
    private final JwtAuthService jwtService;
    private final UserDetailsService userDetailsService;
    private final UserService userService;

    @MessageMapping("/auth")
    public void handleAuthentication(SimpMessageHeaderAccessor headerAccessor, @Payload String token) {
        String sessionId = headerAccessor.getSessionId();

        if (token == null || token.isEmpty()) {
            return;
        }

        final String email = jwtService.extractEmail(token);
        if (email != null) {
            UserDetails userDetails;
            try {
                userDetails = this.userDetailsService.loadUserByUsername(email);
            } catch (UsernameNotFoundException e) {
                return;
            }

            if (jwtService.isTokenValid(token, userDetails)) {
                UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(authenticationToken);

                var username = userService.findByEmail(email).getUserName();

                // Store the authenticated username with the session ID
                sessionIdToUsername.put(sessionId, username);

                // Set the user principal in the message headers
                headerAccessor.setUser(new Principal() {
                    @Override
                    public String getName() {
                        return username;
                    }
                });
            }
        }
    }

    /**
     * Authenticates a WebSocket connection using a JWT token from the headers
     * @param message The message to authenticate
     * @param channel The message channel
     * @return true if authentication was successful, false otherwise
     */
    public boolean authenticateConnection(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

        // Check if this is a CONNECT frame
        if (accessor.getCommand() == null) {
            return false;
        }

        // For CONNECT messages, extract the token and authenticate
        if (accessor.getCommand().equals(org.springframework.messaging.simp.stomp.StompCommand.CONNECT)) {
            String authHeader = accessor.getFirstNativeHeader("Authorization");

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                String email = jwtService.extractEmail(token);

                if (email != null) {
                    try {
                        UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                        if (jwtService.isTokenValid(token, userDetails)) {
                            var username = userService.findByEmail(email).getUserName();

                            // Create authentication token
                            UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities());

                            // Set user principal
                            accessor.setUser(new Principal() {
                                @Override
                                public String getName() {
                                    return username;
                                }
                            });

                            // Store session ID to username mapping
                            sessionIdToUsername.put(accessor.getSessionId(), username);

                            return true;
                        }
                    } catch (UsernameNotFoundException e) {
                        return false;
                    }
                }
            }
            return false;
        }

        // For other messages, check if the session is authenticated
        String sessionId = accessor.getSessionId();
        if (sessionId != null && sessionIdToUsername.containsKey(sessionId)) {
            // Session is authenticated, set the user principal
            String username = sessionIdToUsername.get(sessionId);
            accessor.setUser(new Principal() {
                @Override
                public String getName() {
                    return username;
                }
            });
            return true;
        }

        return false;
    }

    /**
     * Removes a session from the authenticated sessions map
     * @param sessionId The session ID to remove
     */
    public static void removeSession(String sessionId) {
        sessionIdToUsername.remove(sessionId);
    }
}
