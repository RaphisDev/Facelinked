package net.orion.facelinked.config;

import lombok.AllArgsConstructor;
import net.orion.facelinked.auth.services.JwtAuthService;
import net.orion.facelinked.auth.services.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaders;
import org.springframework.messaging.simp.stomp.StompSession;
import org.springframework.messaging.simp.stomp.StompSessionHandler;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Controller;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.lang.reflect.Type;
import java.security.Principal;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Controller
@AllArgsConstructor
public class WebSocketAuthenticationHandler {

    private static final Map<String, ConnectionInfo> pendingConnections = new ConcurrentHashMap<>();
    private static final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
    private final JwtAuthService jwtService;
    private final UserDetailsService userDetailsService;
    private final UserService userService;

    @MessageMapping("/auth")
    public void handleAuthentication(SimpMessageHeaderAccessor session, String token, WebSocketSession webSocketSession) { //how to get SimpMessageHeaderAccessor? (this shouldn't work I think)
        if (token == null || token.isEmpty()) {
            webSocketSession.close();
            return;
        }
        final String email;
        email = jwtService.extractEmail(token);
        if (email != null) {
            UserDetails userDetails = null;
            try {
                userDetails = this.userDetailsService.loadUserByUsername(email);
            } catch (UsernameNotFoundException e) {
                webSocketSession.close();
                return;
            }
            if (userDetails == null) {
                webSocketSession.close();
                return;
            }
            if(jwtService.isTokenValid(token, userDetails)) {
                UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(authenticationToken);

                var username = userService.findByEmail(email).getUserName();

                session.setUser(new Principal() {
                    @Override
                    public String getName() {
                        return username;
                    }
                });

                pendingConnections.remove(webSocketSession.getId());
                session.send("/auth", new TextMessage("{'type':'auth_success'}"));
            }
            else {
                session.close();
            }
        }
    }

    public static void afterConnected(WebSocketSession webSocketSession) {
        String sessionId = session.StompSession.getId(); //TODO: Get StompSession or something like that
        pendingConnections.put(sessionId, new ConnectionInfo(session, webSocketSession.getId()));

        scheduler.schedule(() -> {
            if (pendingConnections.containsKey(webSocketSession.getId())) {
                session.close();
                pendingConnections.remove(webSocketSession.getId());
            }
        }, 30, TimeUnit.SECONDS);
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) {
        pendingConnections.remove(session.getId());
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        pendingConnections.remove(session.getId());
    }

    private static class ConnectionInfo {
        final WebSocketSession webSocketSession;
        final SimpMessageHeaderAccessor session;
        final long connectedAt;

        ConnectionInfo(SimpMessageHeaderAccessor session, WebSocketSession webSocketSession) {
            this.session = session;
            this.webSocketSession = webSocketSession;
            this.connectedAt = System.currentTimeMillis();
        }
    }
}