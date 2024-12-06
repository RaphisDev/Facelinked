package net.orion.facelinked.networks.controller;

import lombok.AllArgsConstructor;
import net.orion.facelinked.auth.repository.UserRepository;
import net.orion.facelinked.chats.ChatMessage;
import net.orion.facelinked.chats.controller.ChatController;
import net.orion.facelinked.chats.controller.MessageRequest;
import net.orion.facelinked.networks.Network;
import net.orion.facelinked.networks.repository.NetworkRequest;
import net.orion.facelinked.networks.service.NetworkService;
import net.orion.facelinked.profile.repository.ProfileRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@AllArgsConstructor
@RequestMapping("/networks")
public class NetworkController {

    private ProfileRepository profileRepository;
    private NetworkService networkService;
    private UserRepository userRepository;
    private SimpMessagingTemplate messagingTemplate;

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping("/create")
    public ResponseEntity<NetworkResponse> createNetwork(@RequestBody NetworkRequest network, @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
        var sender = userRepository.findByEmail(userDetails.getUsername()).orElseThrow().getUserName();

        if (network.getMembers() != null) {
            network.getMembers().forEach(member -> {
                var user = profileRepository.findByUsername(member.getMemberId()).orElseThrow();
                member.setMemberProfilePicturePath(user.getProfilePicturePath());
                member.setMemberName(user.getName());
            });
        }

        var id = networkService.createNetwork(Network.builder().
                name(network.getName()).
                description(network.getDescription()).
                creatorId(sender).
                isPrivate(network.isPrivate()).
                members(network.getMembers()).
                build());

        return ResponseEntity.ok(NetworkResponse.builder().id(id).members(network.getMembers()).creatorId(sender).build());
    }

    @MessageMapping("/networks/{networkId}")
    public void sendMessage(@DestinationVariable String networkId, MessageRequest message, Principal senderDetails) {
        if (senderDetails == null) {
            throw new IllegalArgumentException("User not authenticated");
        }
        var sender = senderDetails.getName();
        if (networkService.isPrivate(networkId)) {
            if (!networkService.isMemberOfNetwork(networkId, sender)) {
                throw new IllegalArgumentException("User not authorized to send message");
            }
        }

        //test if user needs to be authorized to send message
        //also secure getting messages from websocket and database

        messagingTemplate.convertAndSend(networkId, ChatMessage.builder().
                senderId(sender).
                content(message.getContent()).
                receiverId(networkId).
                timestamp(message.getTimestamp()).
                build());

        //save to database
    }
}
