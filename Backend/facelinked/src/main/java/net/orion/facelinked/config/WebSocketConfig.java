package net.orion.facelinked.config;

import lombok.AllArgsConstructor;
import net.orion.facelinked.auth.services.JwtAuthService;
import net.orion.facelinked.auth.services.UserService;
import net.orion.facelinked.networks.service.NetworkService;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@EnableWebSocketMessageBroker
@Configuration
@AllArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final UserService userService;
    private final NetworkService networkService;
    private final JwtAuthService jwtService;
    private final UserDetailsService userDetailsService;
    private final WebSocketAuthenticationHandler webSocketAuthenticationHandler;

    public class HandshakeHandler extends DefaultHandshakeHandler {
        @Override
        protected Principal determineUser(ServerHttpRequest request, WebSocketHandler wsHandler,
                                          Map<String, Object> attributes) {
            // Extract token from Authorization header
            List<String> authHeaders = request.getHeaders().get("Authorization");
            if (authHeaders != null && !authHeaders.isEmpty()) {
                String authHeader = authHeaders.get(0);
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    String token = authHeader.substring(7);
                    String email = jwtService.extractEmail(token);

                    if (email != null) {
                        try {
                            var userDetails = userDetailsService.loadUserByUsername(email);
                            if (jwtService.isTokenValid(token, userDetails)) {
                                var username = userService.findByEmail(email).getUserName();

                                // Return a Principal with the username
                                return new Principal() {
                                    @Override
                                    public String getName() {
                                        return username;
                                    }
                                };
                            }
                        } catch (Exception e) {
                            // Authentication failed, continue with null principal
                        }
                    }
                }
            }

            // If no valid token, return a Principal with null name
            return new Principal() {
                @Override
                public String getName() {
                    return null;
                }
            };
        }
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/networks", "/user", "/auth");
        config.setApplicationDestinationPrefixes("/app");
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setHandshakeHandler(new HandshakeHandler())
                .setAllowedOriginPatterns("https://www.facelinked.com");
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        // Add the WebSocketChannelInterceptor for network authorization
        registration.interceptors(new WebSocketChannelInterceptor(networkService));

        // Add an interceptor for authentication
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public org.springframework.messaging.Message<?> preSend(org.springframework.messaging.Message<?> message, 
                                                                   org.springframework.messaging.MessageChannel channel) {
                // Authenticate the connection
                webSocketAuthenticationHandler.authenticateConnection(message, channel);
                return message;
            }
        });
    }

    @Override
    public void configureClientOutboundChannel(ChannelRegistration registration) {
        // Add an interceptor for outbound messages to ensure authentication
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public org.springframework.messaging.Message<?> preSend(org.springframework.messaging.Message<?> message, 
                                                                   org.springframework.messaging.MessageChannel channel) {
                // Check if the message has a user principal
                org.springframework.messaging.simp.stomp.StompHeaderAccessor accessor = 
                    org.springframework.messaging.simp.stomp.StompHeaderAccessor.wrap(message);

                if (accessor.getUser() == null || accessor.getUser().getName() == null) {
                    // If no user is set, check if the session is authenticated
                    String sessionId = accessor.getSessionId();
                    if (sessionId != null) {
                        // Let the message through, the WebSocketChannelInterceptor will handle authorization
                        return message;
                    }
                }

                return message;
            }
        });
    }
}
