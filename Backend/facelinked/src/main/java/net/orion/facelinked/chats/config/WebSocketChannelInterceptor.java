package net.orion.facelinked.chats.config;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;

public class WebSocketChannelInterceptor implements ChannelInterceptor {

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
        var principalName = accessor.getUser() != null ? accessor.getUser().getName() : null;

        var destination = accessor.getDestination();

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
