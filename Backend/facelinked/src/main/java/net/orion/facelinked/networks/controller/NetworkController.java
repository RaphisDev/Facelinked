package net.orion.facelinked.networks.controller;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import net.orion.facelinked.auth.repository.UserRepository;
import net.orion.facelinked.networks.Network;
import net.orion.facelinked.networks.NetworkMember;
import net.orion.facelinked.networks.repository.NetworkRequest;
import net.orion.facelinked.networks.service.NetworkService;
import net.orion.facelinked.profile.repository.ProfileRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
@RequestMapping("/networks")
public class NetworkController {

    private ProfileRepository profileRepository;
    private NetworkService networkService;
    private UserRepository userRepository;

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping("/create")
    public void createNetwork(@RequestBody NetworkRequest network, @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return;
        }
        var sender = userRepository.findByEmail(userDetails.getUsername()).orElseThrow().getUserName();

        if (network.getMembers() != null) {
            network.getMembers().forEach(member -> {
                var user = profileRepository.findByUsername(member.getMemberId()).orElseThrow();
                member.setMemberProfilePicturePath(user.getProfilePicturePath());
                member.setMemberName(user.getName());
            });
        }

        networkService.createNetwork(Network.builder().
                name(network.getName()).
                description(network.getDescription()).
                creatorId(sender).
                isPrivate(network.isPrivate()).
                members(network.getMembers()).
                build());
    }

}
