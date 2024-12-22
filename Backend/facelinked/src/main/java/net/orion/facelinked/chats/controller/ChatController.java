package net.orion.facelinked.chats.controller;

import lombok.AllArgsConstructor;
import net.orion.facelinked.auth.repository.UserRepository;
import net.orion.facelinked.auth.services.UserService;
import net.orion.facelinked.chats.ChatMessage;
import net.orion.facelinked.chats.ChatService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.util.List;

@Controller
@AllArgsConstructor
@RestController
@RequestMapping("/messages")
public class ChatController {

    private UserService userService;
    private ChatService chatService;
    private SimpMessagingTemplate template;

    @MessageMapping("/chat")
    public void send(MessageRequest message, Principal senderDetails) {

        if (senderDetails == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        String sender = senderDetails.getName();

        if(sender == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }

        var id = chatService.saveToDatabase(ChatMessage.builder()
                .content(message.getContent())
                .timestamp(message.getTimestamp())
                .senderId(sender)
                .receiverId(message.getReceiver())
                .build());

        template.convertAndSendToUser(message.getReceiver(), "/queue/messages",
                ChatMessage.builder()
                .id(id)
                .content(message.getContent())
                .timestamp((message.getTimestamp()))
                .senderId(sender)
                .build());
    }

    @GetMapping("/afterId")
    public ResponseEntity<List<ChatMessage>> getChat(@AuthenticationPrincipal UserDetails userDetails, @RequestParam String id) {

        if (userDetails == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        String sender = userDetails.getUsername();
        var senderId = userService.findByEmail(sender).getUserName();

        if (senderId == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        return ResponseEntity.ok(chatService.findByIdAfter(id, senderId));
    }

    @GetMapping("/all")
    public ResponseEntity<List<ChatMessage>> getAllChat(@AuthenticationPrincipal UserDetails userDetails) {

        if (userDetails == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        String sender = userDetails.getUsername();
        var senderId = userService.findByEmail(sender).getUserName();

        if (senderId == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        return ResponseEntity.ok(chatService.findBySenderOrReceiverId(senderId));
    }
}
