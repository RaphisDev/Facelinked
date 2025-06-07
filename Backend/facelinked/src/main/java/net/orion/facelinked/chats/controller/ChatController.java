package net.orion.facelinked.chats.controller;

import com.eatthepath.pushy.apns.ApnsPushNotification;
import com.eatthepath.pushy.apns.PushNotificationResponse;
import com.eatthepath.pushy.apns.util.SimpleApnsPushNotification;
import com.eatthepath.pushy.apns.util.concurrent.PushNotificationFuture;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import net.orion.facelinked.auth.repository.UserRepository;
import net.orion.facelinked.auth.services.UserService;
import net.orion.facelinked.chats.ChatMessage;
import net.orion.facelinked.chats.ChatService;
import net.orion.facelinked.config.AutoPrimaryKey;
import net.orion.facelinked.config.PrimaryKey;
import net.orion.facelinked.profile.service.ProfileService;
import net.orion.facelinked.service.PushNotificationService;
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
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;

@Controller
@AllArgsConstructor
@RestController
@RequestMapping("/messages")
public class ChatController {

    private final UserService userService;
    private final ChatService chatService;
    private final ProfileService profileService;
    private final PushNotificationService pushNotificationService;
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
        var senderProfile = profileService.findByUsername(sender);
        if (senderProfile.getFriends().stream().noneMatch((friend) -> friend.getMemberId().equals(message.getReceiver()))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only send messages to your friends.");
        }
        var senderProfilePicturePath = senderProfile.getProfilePicturePath();
        String senderName = senderProfile.getName();

        var id = chatService.saveToDatabase(new ChatMessage(sender, message.getReceiver(), message.getContent() == null ? "" : message.getContent(), new AutoPrimaryKey(null, System.currentTimeMillis()), message.getImages() == null ? new ArrayList<>() : message.getImages()));

        template.convertAndSendToUser(message.getReceiver(), "/queue/messages",
               new ChatMessage(sender, message.getReceiver(), message.getContent() == null ? "" : message.getContent(), new AutoPrimaryKey(null, id), message.getImages() == null ? new ArrayList<>() : message.getImages()));

        sendPushNotification(message.getReceiver(), message.getContent(), senderName, senderProfilePicturePath, message.getImages() == null ? null : message.getImages().getFirst());
    }

    public void sendPushNotification(String receiver, String message, String sender, String profilePictureUrl, String image) {
        var receiverAccount = userService.findByUsername(receiver);
        if (receiverAccount.getDeviceTokens() == null) {
            return;
        }
        pushNotificationService.sendPushNotification(receiverAccount.getDeviceTokens(), sender, message, profilePictureUrl, image, receiverAccount);
    }

    @PostMapping("/setDeviceToken")
    public ResponseEntity<Void> setDeviceToken(@AuthenticationPrincipal UserDetails userDetails, @RequestBody String token) {

        String sender = userDetails.getUsername();
        var user = userService.findByEmail(sender);

        if (user == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        var tokens = new ArrayList<>(user.getDeviceTokens());
        tokens.add(token);
        user.setDeviceTokens(tokens);
        userService.save(user);

        return ResponseEntity.ok().build();
    }


    @GetMapping("/afterId")
    public ResponseEntity<List<ChatMessage>> getChat(@AuthenticationPrincipal UserDetails userDetails, @RequestParam Long id) {

        String sender = userDetails.getUsername();
        var senderId = userService.findByEmail(sender).getUserName();

        return ResponseEntity.ok(chatService.findByIdAfter(id, senderId));
    }

    @GetMapping("/all")
    public ResponseEntity<List<ChatMessage>> getAllChat(@AuthenticationPrincipal UserDetails userDetails) {

        String sender = userDetails.getUsername();
        var senderId = userService.findByEmail(sender).getUserName();

        return ResponseEntity.ok(chatService.findBySenderOrReceiverId(senderId));
    }
}
