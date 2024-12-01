package net.orion.facelinked.chats.controller;

import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AllArgsConstructor;
import net.orion.facelinked.auth.repository.UserRepository;
import net.orion.facelinked.chats.ChatMessage;
import net.orion.facelinked.profile.Profile;
import net.orion.facelinked.profile.repository.ProfileRepository;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.socket.client.WebSocketClient;

import java.security.Principal;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Map;

@Controller
@AllArgsConstructor
public class ChatController {

    private SimpMessagingTemplate template;

    //For Networks, let user that joined a network connect the websocket
    @MessageMapping("/chat")
    public void send(MessageRequest message, Principal senderDetails) {

        if (senderDetails == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        String sender = senderDetails.getName();

        if(sender == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }

        template.convertAndSendToUser(message.getReceiver(), "/queue/messages",
                ChatMessage.builder()
                .content(message.getContent())
                .timestamp((message.getTimestamp()))
                .senderId(sender)
                .chatId(sender + "-" + message.getReceiver())
                .build());
    }
}
