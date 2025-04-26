package net.orion.facelinked.config;

import lombok.AllArgsConstructor;
import net.orion.facelinked.networks.service.NetworkService;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;

@AllArgsConstructor
public class WebSocketChannelInterceptor implements ChannelInterceptor {

    private NetworkService networkService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

        // Skip authentication check for CONNECT messages, as they are handled by WebSocketAuthenticationHandler
        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            return message;
        }

        // Skip authentication check for SUBSCRIBE to /auth, as this is used for authentication
        if (StompCommand.SUBSCRIBE.equals(accessor.getCommand()) && 
            accessor.getDestination() != null && 
            accessor.getDestination().startsWith("/auth")) {
            return message;
        }

        // For all other messages, check authentication
        var principalName = accessor.getUser() != null ? accessor.getUser().getName() : null;
        var destination = accessor.getDestination();

        // If no destination, just check authentication
        if (destination == null) {
            if (principalName == null && !StompCommand.DISCONNECT.equals(accessor.getCommand())) {
                throw new IllegalArgumentException("User not authenticated");
            }
            return message;
        }

        // Handle network messages
        if (destination.startsWith("/networks")) {
            // Extract network ID from destination
            String[] parts = destination.split("/");
            if (parts.length < 3) {
                throw new IllegalArgumentException("Invalid network destination format");
            }

            var networkId = parts[2];

            // Check authentication
            if (principalName == null) {
                throw new IllegalArgumentException("User not authenticated for network access");
            }

            // Get network and check authorization
            var network = networkService.getNetwork(networkId);
            if (network.isPrivate()) {
                if (network.getMembers().stream().noneMatch(member -> member.getMemberId().equals(principalName))) {
                    throw new IllegalArgumentException("User not authorized to access this network");
                }
            }
        }

        // Handle user-specific messages
        if (destination.startsWith("/user")) {
            // Extract destination username from path
            String[] parts = destination.split("/");
            if (parts.length < 3) {
                throw new IllegalArgumentException("Invalid user destination format");
            }

            var destinationName = parts[2];

            // Check authentication
            if (principalName == null) {
                throw new IllegalArgumentException("User not authenticated for user-specific message");
            }

            // Check authorization - user can only send/receive messages for themselves
            if (!destinationName.equals(principalName)) {
                throw new IllegalArgumentException("User not authorized to access messages for " + destinationName);
            }
        }

        return message;
    }
}
