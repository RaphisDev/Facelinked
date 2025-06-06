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

        var principalName = accessor.getUser() != null ? accessor.getUser().getName() : null;
        var destination = accessor.getDestination();

        if (destination == null) {
            throw new IllegalArgumentException("User not authenticated");
        }

        if (destination.startsWith("/networks")) {
            String[] parts = destination.split("/");
            if (parts.length < 3) {
                throw new IllegalArgumentException("Invalid network destination format");
            }

            var networkId = parts[2];

            if (principalName == null) {
                throw new IllegalArgumentException("User not authenticated for network access");
            }

            var network = networkService.getNetwork(networkId);
            if (network.isPrivate()) {
                if (network.getMembers().stream().noneMatch(member -> member.getMemberId().equals(principalName))) {
                    throw new IllegalArgumentException("User not authorized to access this network");
                }
            }
        }

        if (destination.startsWith("/user")) {
            String[] parts = destination.split("/");
            if (parts.length < 3) {
                throw new IllegalArgumentException("Invalid user destination format");
            }

            var destinationName = parts[2];

            if (principalName == null) {
                throw new IllegalArgumentException("User not authenticated for user-specific message");
            }

            if (!destinationName.equals(principalName)) {
                throw new IllegalArgumentException("User not authorized to access messages for " + destinationName);
            }
        }

        return message;
    }
}
