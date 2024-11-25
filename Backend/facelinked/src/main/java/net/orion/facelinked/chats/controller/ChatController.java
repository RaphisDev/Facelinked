package net.orion.facelinked.chats.controller;

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
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.socket.client.WebSocketClient;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

@Controller
@AllArgsConstructor
public class ChatController {

    private SimpMessagingTemplate template;
    private UserRepository userRepository;

    //For Networks, let user that are in the page connect the websocket
    @MessageMapping("/chat")
    public void send(MessageRequest message, @AuthenticationPrincipal UserDetails senderDetails) {

        System.out.println(message.getContent());
        if (senderDetails == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        var sender = userRepository.findByEmail(senderDetails.getUsername()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND)).getUserName();
        //Only send to the receiver, not everyone, look at video
        template.convertAndSend("/user/" + message.getReceiver() + "/queue/messages",
                ChatMessage.builder()
                .content(message.getContent())
                .timestamp((message.getTimestamp()))
                .senderId(sender)
                .receiverId(message.getReceiver())
                .build());
    }
}
