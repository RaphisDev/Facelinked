package net.orion.facelinked.config;

import net.orion.facelinked.networks.service.NetworkService;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;

public class WebSocketChannelInterceptor implements ChannelInterceptor {

    private NetworkService networkService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
        var principalName = accessor.getUser() != null ? accessor.getUser().getName() : null;

        var destination = accessor.getDestination();

        if (destination != null && destination.startsWith("/networks")) {
            if (principalName == null) {
                throw new IllegalArgumentException("User not authenticated");
            }
            System.out.println("Checking network access. Check if it requires authentication");

            var networkId = destination.split("/")[2];
            if (networkService.isPrivate(networkId)) {
                if (!networkService.isMemberOfNetwork(networkId, principalName)) {
                    throw new IllegalArgumentException("User not authorized to send message");
                }
            }
        }

        if(destination != null && destination.startsWith("/user")) {
            var destinationName = destination.split("/")[2];

            if (destinationName == null) {
                throw new IllegalArgumentException("Destination name not found");
            }
            if(principalName == null) {
                throw new IllegalArgumentException("User not authenticated");
            }

            if (!destinationName.equals(principalName)) {
                throw new IllegalArgumentException("User not authorized to receive message");
            }
        }

        return message;
    }
}
