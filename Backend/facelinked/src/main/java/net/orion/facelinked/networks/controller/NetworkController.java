package net.orion.facelinked.networks.controller;

import lombok.AllArgsConstructor;
import net.orion.facelinked.auth.services.UserService;
import net.orion.facelinked.chats.ChatMessage;
import net.orion.facelinked.chats.controller.MessageRequest;
import net.orion.facelinked.networks.Network;
import net.orion.facelinked.networks.NetworkMember;
import net.orion.facelinked.networks.repository.NetworkRequest;
import net.orion.facelinked.networks.service.NetworkService;
import net.orion.facelinked.profile.Profile;
import net.orion.facelinked.profile.service.ProfileService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/networks")
public class NetworkController {

    private ProfileService profileService;
    private NetworkService networkService;
    private UserService userService;
    private SimpMessagingTemplate messagingTemplate;

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping("/create")
    public ResponseEntity<NetworkResponse> createNetwork(@RequestBody NetworkRequest network, @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
        var sender = userService.findByEmail(userDetails.getUsername()).getUserName();

        if (network.getMembers() != null) {
            network.getMembers().forEach(member -> {
                var user = profileService.findByUsername(member.getMemberId());
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

    @MessageMapping("/networks/send")
    public void sendMessage(MessageRequest message, Principal senderDetails) {
        if (senderDetails == null) {
            throw new IllegalArgumentException("User not authenticated");
        }
        var sender = senderDetails.getName();
        if (networkService.isPrivate(message.getReceiver())) {
            if (!networkService.isMemberOfNetwork(message.getReceiver(), sender)) {
                throw new IllegalArgumentException("User not authorized to send message");
            }
        }

        //also secure getting messages from database
        messagingTemplate.convertAndSend("/networks/" + message.getReceiver(), ChatMessage.builder().
                senderId(sender).
                content(message.getContent()).
                timestamp(message.getTimestamp()).
                build());

        //save to database
    }

    @GetMapping("/{networkId}/member")
    public ResponseEntity<List<NetworkMember>> getMembers(@PathVariable String networkId, @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
        var sender = userService.findByEmail(userDetails.getUsername()).getUserName();

        if (networkService.isPrivate(networkId)) {
            if (!networkService.isMemberOfNetwork(networkId, sender)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
            }
        }

        return ResponseEntity.ok(networkService.getMembers(networkId));
    }

    @PostMapping(value = "{network}/add", consumes = "application/json")
    public void AddUser(@PathVariable String network, @RequestBody List<NetworkMember> members, @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            throw new IllegalArgumentException("User not authenticated");
        }
        var sender = userService.findByEmail(userDetails.getUsername()).getUserName();

        if (!networkService.isCreatorOfNetwork(network, sender)) {
            throw new IllegalArgumentException("User not authorized to add user");
        }

        if (members != null) {
            members.forEach(member -> {
                var user = profileService.findByUsername(member.getMemberId());
                member.setMemberProfilePicturePath(user.getProfilePicturePath());
                member.setMemberName(user.getName());
            });
        }
        else {
            throw new IllegalArgumentException("No members to add");
        }
        networkService.addUser(members, network);
    }
}
