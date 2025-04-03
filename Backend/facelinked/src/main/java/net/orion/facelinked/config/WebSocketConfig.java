package net.orion.facelinked.config;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import net.orion.facelinked.auth.repository.UserRepository;
import net.orion.facelinked.auth.services.JwtAuthService;
import net.orion.facelinked.auth.services.UserService;
import net.orion.facelinked.networks.service.NetworkService;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.security.authentication.CachingUserDetailsService;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

import java.security.Principal;
import java.util.Map;

@EnableWebSocketMessageBroker
@Configuration
@AllArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final UserService userService;
    private final NetworkService networkService;
    private final JwtAuthService jwtService;
    private final UserDetailsService userDetailsService;

    @AllArgsConstructor
    public class HandshakeHandler extends DefaultHandshakeHandler {

        private final UserDetailsService userDetailsService;

        @Override
        protected Principal determineUser(ServerHttpRequest request, WebSocketHandler wsHandler,
                                          Map<String, Object> attributes) {
            var protocols = request.getHeaders().getFirst("Sec-WebSocket-Protocol");
            String token = null;
            if (protocols != null && protocols.contains(",")) {
                token = protocols.split(",")[0].trim();
            }

            final String email;
            if (token == null) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No token provided");
            }
            email = jwtService.extractEmail(token);
            if (email != null) {
                UserDetails userDetails = null;
                try {
                    userDetails = this.userDetailsService.loadUserByUsername(email);
                } catch (UsernameNotFoundException e) {
                    throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
                }
                if(jwtService.isTokenValid(token, userDetails)) {
                    UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    SecurityContextHolder.getContext().setAuthentication(authenticationToken);

                    var username = userService.findByEmail(email).getUserName();

                    return new Principal() {
                        @Override
                        public String getName() {
                            return username;
                        }
                    };
                }
            }

            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token");
        }
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/networks", "/user");
        config.setApplicationDestinationPrefixes("/app");
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws").setHandshakeHandler(new HandshakeHandler(userDetailsService)).setAllowedOriginPatterns("https://www.facelinked.com");
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration channelRegistration) {
        channelRegistration.interceptors(new WebSocketChannelInterceptor(networkService));
    }
}