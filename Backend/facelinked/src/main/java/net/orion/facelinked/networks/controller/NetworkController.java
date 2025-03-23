package net.orion.facelinked.networks.controller;

import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBAttribute;
import lombok.AllArgsConstructor;
import net.orion.facelinked.auth.services.UserService;
import net.orion.facelinked.chats.ChatMessage;
import net.orion.facelinked.chats.controller.MessageRequest;
import net.orion.facelinked.config.AutoPrimaryKey;
import net.orion.facelinked.networks.Network;
import net.orion.facelinked.networks.NetworkMember;
import net.orion.facelinked.networks.NetworkMessage;
import net.orion.facelinked.networks.service.NetworkService;
import net.orion.facelinked.profile.Profile;
import net.orion.facelinked.profile.service.ProfileService;
import net.orion.facelinked.profile.service.StorageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/networks")
public class NetworkController {

    private ProfileService profileService;
    private NetworkService networkService;
    private UserService userService;
    private SimpMessagingTemplate messagingTemplate;
    private StorageService storageService;

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping("/create")
    public ResponseEntity<NetworkResponse> createNetwork(@RequestBody NetworkRequest network, @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
        var sender = userService.findByEmail(userDetails.getUsername()).getUserName();

        if (network.getMembers() != null) {
            var members = network.getMembers();
            members.forEach(member -> {
                if (network.getMembers().stream().anyMatch(existingMember -> existingMember.getMemberId().equals(member.getMemberId()))) {
                    throw new IllegalArgumentException("User already in network");
                }
                var user = profileService.findByUsername(member.getMemberId());
                member.setMemberProfilePicturePath(user.getProfilePicturePath());
                member.setMemberName(user.getName());
            });
            network.setMembers(members);
        }

        var id = networkService.createNetwork(Network.builder().
                name(network.getName()).
                description(network.getDescription()).
                creatorId(sender).
                isPrivate(network.isPrivate()).
                members(network.getMembers() == null ? Collections.emptyList() : network.getMembers()).
                networkPicturePath(network.getNetworkPicturePath()).
                memberCount(1).
                searchName(network.getName().toLowerCase()).
                build());

        return ResponseEntity.ok(NetworkResponse.builder().id(id).members(network.getMembers()).creatorId(sender).build());
    }

    @MessageMapping("/networks/send")
    public void sendMessage(MessageRequest message, Principal senderDetails) {
        if (senderDetails == null) {
            throw new IllegalArgumentException("User not authenticated");
        }
        var sender = senderDetails.getName();
        var network = networkService.getNetwork(message.getReceiver());

        if (network.isPrivate()) {
            if (network.getMembers().stream().noneMatch(member -> member.getMemberId().equals(sender))) {
                throw new IllegalArgumentException("User not authorized to send message");
            }
        }

        var senderProfile = new NetworkMember();
        var user = profileService.findByUsername(sender);
        senderProfile.setMemberProfilePicturePath(user.getProfilePicturePath());
        senderProfile.setMemberName(user.getName());
        senderProfile.setMemberId(sender);

        var millis = networkService.sendMessage(
                new NetworkMessage(senderProfile, message.getReceiver(), message.getContent(), new AutoPrimaryKey(null, System.currentTimeMillis()), message.getImages() == null ? new ArrayList<>() : message.getImages()));

        messagingTemplate.convertAndSend("/networks/" + message.getReceiver(), new NetworkMessage(senderProfile, message.getReceiver(), message.getContent(), new AutoPrimaryKey(null, millis), message.getImages() == null ? new ArrayList<>() : message.getImages()));
    }
    @GetMapping("/{networkId}/messages")
    public ResponseEntity<List<NetworkMessage>> getMessages(@PathVariable String networkId, @AuthenticationPrincipal UserDetails userDetails, @RequestParam(required = false) boolean additional) {
        var sender = userService.findByEmail(userDetails.getUsername()).getUserName();

        var network = networkService.getNetwork(networkId);
        if (network.isPrivate()) {
            if (network.getMembers().stream().noneMatch(member -> member.getMemberId().equals(sender))) {
                throw new IllegalArgumentException("User not authorized to view messages");
            }
        }
        
        List<NetworkMessage> messages;
        if (additional) {
            messages = new ArrayList<>(networkService.getAdditionalMessages(networkId));
        } else {
            messages = new ArrayList<>(networkService.getMessages(networkId));
        }
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/{networkId}/afterId")
    public ResponseEntity<List<NetworkMessage>> getMessages(@PathVariable String networkId, @RequestParam Long id, @AuthenticationPrincipal UserDetails userDetails) {
        var sender = userService.findByEmail(userDetails.getUsername()).getUserName();

        var network = networkService.getNetwork(networkId);
        if (network.isPrivate()) {
            if (network.getMembers().stream().noneMatch(member -> member.getMemberId().equals(sender))) {
                throw new IllegalArgumentException("User not authorized to view messages");
            }
        }

        return ResponseEntity.ok(new ArrayList<>(networkService.getMessagesAfterId(networkId, id)));
    }

    @GetMapping(value="/{networkId}", produces = "application/json")
    public ResponseEntity<Network> getNetwork(@PathVariable String networkId, @AuthenticationPrincipal UserDetails userDetails) {

        var sender = userService.findByEmail(userDetails.getUsername()).getUserName();

        var networkResponseEntity = networkService.getNetwork(networkId);
        if (networkResponseEntity.isPrivate()) {
            if(networkResponseEntity.getMembers().stream().noneMatch(member -> member.getMemberId().equals(sender))) {
                throw new IllegalArgumentException("User not authorized to view network");
            }
        }
        return ResponseEntity.ok(networkResponseEntity);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Network>> searchNetwork(@RequestParam String searchName, @AuthenticationPrincipal UserDetails userDetails) {
        var networks = new ArrayList<>(networkService.searchForNetwork(searchName.toLowerCase()));
        if (networks.stream().anyMatch(network -> network.isPrivate())) {
            var user = profileService.findByUsername(userDetails.getUsername());
            networks.removeIf(network -> {
                if (network.isPrivate()) {
                    return network.getMembers().stream().noneMatch(member -> member.getMemberId().equals(user.getUsername()));
                }
                return false;
            });
        }
        return ResponseEntity.ok(networks);
    }

    @PostMapping("{network}/update")
    public void Update(@PathVariable String network, @RequestBody NetworkUpdateRequest networkUpdateRequest, @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            throw new IllegalArgumentException("User not authenticated");
        }
        var sender = userService.findByEmail(userDetails.getUsername()).getUserName();

        var networkResponseEntity = networkService.getNetwork(network);

        if (!networkResponseEntity.getCreatorId().equals(sender)) {
            throw new IllegalArgumentException("User not authorized to update network");
        }

        networkService.update(networkResponseEntity, networkUpdateRequest);
    }

    @PostMapping("{network}/add")
    public void AddUser(@PathVariable String network, @RequestBody List<NetworkMember> members, @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            throw new IllegalArgumentException("User not authenticated");
        }
        var sender = userService.findByEmail(userDetails.getUsername()).getUserName();

        var networkResponseEntity = networkService.getNetwork(network);

        if (!networkResponseEntity.getCreatorId().equals(sender)) {
            throw new IllegalArgumentException("User not authorized to add user");
        }
        if (!networkResponseEntity.isPrivate()) {
            throw new IllegalArgumentException("Network is not private");
        }

        if (members != null) {
            members.forEach(member -> {
                if (networkResponseEntity.getMembers().stream().anyMatch(existingMember -> existingMember.getMemberId().equals(member.getMemberId()))) {
                    throw new IllegalArgumentException("User already in network");
                }
                var user = profileService.findByUsername(member.getMemberId());
                member.setMemberProfilePicturePath(user.getProfilePicturePath());
                member.setMemberName(user.getName());
            });
        }
        else {
            throw new IllegalArgumentException("No members to add");
        }
        networkService.addUser(members, networkResponseEntity);
    }

    @PostMapping(value = "{network}/remove", consumes = "application/json")
    public void RemoveUser(@PathVariable String network, @RequestBody List<NetworkMember> members, @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            throw new IllegalArgumentException("User not authenticated");
        }
        var sender = userService.findByEmail(userDetails.getUsername()).getUserName();

        var networkResponseEntity = networkService.getNetwork(network);

        if (!networkResponseEntity.getCreatorId().equals(sender)) {
            throw new IllegalArgumentException("User not authorized to remove user");
        }
        if (!networkResponseEntity.isPrivate()) {
            throw new IllegalArgumentException("Network is not private");
        }

        networkService.removeUser(members, networkResponseEntity);
    }

    @PostMapping("{network}/favorite")
    public void favorite(@PathVariable String network, @RequestParam boolean b) {

        networkService.favorite(network, b);
    }

    @ResponseStatus(HttpStatus.ACCEPTED)
    @GetMapping("/upload")
    private ResponseEntity<String> BucketUrl()
    {
        return ResponseEntity.ok(storageService.generatePresignedUrl());
    }
}
