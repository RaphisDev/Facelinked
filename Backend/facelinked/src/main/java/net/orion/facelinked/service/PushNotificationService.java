package net.orion.facelinked.service;

import com.eatthepath.pushy.apns.ApnsClient;
import com.eatthepath.pushy.apns.PushNotificationResponse;
import com.eatthepath.pushy.apns.util.SimpleApnsPushNotification;
import com.eatthepath.pushy.apns.util.concurrent.PushNotificationFuture;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import lombok.AllArgsConstructor;
import net.orion.facelinked.auth.User;
import net.orion.facelinked.auth.services.UserService;
import org.springframework.stereotype.Service;

import javax.management.MBeanServerDelegate;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
@AllArgsConstructor
public class PushNotificationService {
    private final UserService userService;
    private final ApnsClient apnsClient;

    public void sendPushNotification(List<String> tokens, String title, String body, String profileImageUrl, String imageUrl, User user) {

        for (String token : tokens) {
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
                String escapedBody = body.replace("\"", "\\\"").replace("\n", "\\n");
                String escapedTitle = title.replace("\"", "\\\"");
                String escapedProfilePictureUrl = profileImageUrl.replace("\"", "\\\"");

                String payload = "{"
                        + "\"aps\":{"
                        + "\"alert\":{\"title\":\"" + escapedTitle + "\",\"body\":\"" + escapedBody + "\"},"
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
                            removeInvalidToken(user, data);
                        }
                    }
                });
            } else if (type.equals("android")) {
                var notification = imageUrl == null ? Notification.builder()
                        .setTitle(title)
                        .setBody(body)
                        .build() : Notification.builder()
                        .setTitle(title)
                        .setBody(body)
                        .setImage(imageUrl).build();

                Message message = Message.builder()
                        .setNotification(notification)
                        .setToken(token)
                        .build();

                try {
                    FirebaseMessaging.getInstance().send(message);
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }
    }

    private void removeInvalidToken(User user, String token) {
        if (user != null && user.getDeviceTokens() != null) {
            var newTokens = new ArrayList<>(user.getDeviceTokens());
            newTokens.remove(token);
            user.setDeviceTokens(newTokens);
            userService.save(user);
        }
    }
}