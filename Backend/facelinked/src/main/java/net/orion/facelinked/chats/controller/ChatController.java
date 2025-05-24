package net.orion.facelinked.chats.controller;

import com.eatthepath.pushy.apns.ApnsClient;
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

    private final ApnsClient apnsClient;
    private final UserService userService;
    private final ChatService chatService;
    private final ProfileService profileService;
    private SimpMessagingTemplate template;

    @MessageMapping("/chat")
    public void send(MessageRequest message, Principal senderDetails) {

        if (senderDetails == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        String sender = senderDetails.getName();
        String senderProfilePicturePath = profileService.findByUsername(sender).getProfilePicturePath();

        if(sender == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }

        var id = chatService.saveToDatabase(new ChatMessage(sender, message.getReceiver(), message.getContent(), new AutoPrimaryKey(null, System.currentTimeMillis()), message.getImages() == null ? new ArrayList<>() : message.getImages()));

        template.convertAndSendToUser(message.getReceiver(), "/queue/messages",
               new ChatMessage(sender, message.getReceiver(), message.getContent(), new AutoPrimaryKey(null, id), message.getImages() == null ? new ArrayList<>() : message.getImages()));

        sendPushNotification(message.getReceiver(), message.getContent(), sender, senderProfilePicturePath);
    }

    public void sendPushNotification(String receiver, String message, String sender, String profilePictureUrl) {
        var receiverAccount = userService.findByUsername(receiver);
        if (receiverAccount.getDeviceTokens() == null) {
            return;
        }

        for (String token : receiverAccount.getDeviceTokens()) {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = null;
            try {
                root = mapper.readTree(token);
            } catch (JsonProcessingException e) {
                continue;
            }

            JsonNode tokenNode = root.path("token");

            String type = tokenNode.path("type").asText();
            String data = tokenNode.path("data").asText();

            if (type.equals("ios")) {
                String escapedMessage = message.replace("\"", "\\\"").replace("\n", "\\n");
                String escapedSender = sender.replace("\"", "\\\"");
                String escapedProfilePictureUrl = profilePictureUrl.replace("\"", "\\\"");

                String payload = "{"
                        + "\"aps\":{"
                        + "\"alert\":{\"title\":\"" + escapedSender + "\",\"body\":\"" + escapedMessage + "\"},"
                        + "\"sound\":\"default\","
                        + "\"mutable-content\":1"
                        + "},"
                        + "\"profile_picture\":\"" + escapedProfilePictureUrl + "\""
                        + "}";


                SimpleApnsPushNotification pushNotification = new SimpleApnsPushNotification(
                        data, "com.orion.friendslinked", payload, Instant.now());

                PushNotificationFuture<SimpleApnsPushNotification, PushNotificationResponse<SimpleApnsPushNotification>> future = apnsClient.sendNotification(pushNotification);

                future.whenComplete((response, exception) -> {
                    if (exception != null) {
                        System.err.println("Failed to send notification: " + exception.getMessage());
                        exception.printStackTrace();
                    } else if (!response.isAccepted()) {
                        System.err.println("Notification rejected by the device: " + response.getRejectionReason());
                        if (response.getRejectionReason().orElseThrow().contains("BadDeviceToken") ||
                                response.getRejectionReason().orElseThrow().contains("Unregistered")) {
                            removeInvalidToken(sender, data);
                        }
                    }
                });
            }
        }
    }
    
    private void removeInvalidToken(String username, String token) {
        var user = userService.findByUsername(username);
        if (user != null && user.getDeviceTokens() != null) {
            user.getDeviceTokens().remove(token);
            userService.save(user);
            System.out.println("Removed invalid token for user: " + username);
        }
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
