package net.orion.facelinked.networks.service;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import net.orion.facelinked.chats.ChatMessage;
import net.orion.facelinked.networks.Network;
import net.orion.facelinked.networks.NetworkMember;
import net.orion.facelinked.networks.NetworkMessage;
import net.orion.facelinked.networks.repository.NetworkMessageRepository;
import net.orion.facelinked.networks.repository.NetworkRepository;
import net.orion.facelinked.networks.controller.NetworkUpdateRequest;
import net.orion.facelinked.profile.Profile;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@AllArgsConstructor
public class NetworkService {

    private NetworkRepository networkRepository;
    private NetworkMessageRepository networkMessageRepository;

    public String createNetwork(Network network) {
       return networkRepository.save(network).getId();
    }

    public void addUser(List<NetworkMember> members, Network network) {
        members.addAll(network.getMembers());
        network.setMembers(members);
        networkRepository.save(network);
    }

    public List<Network> searchForNetwork(String searchName) {
        return networkRepository.searchTop5BySearchNameContains(searchName);
    }

    public List<Network> getFavoriteNetworks(String username) {
        return networkRepository.findByFavoriteMembersContaining(username);
    }

    public Network getNetwork(String networkId) {
        return networkRepository.findById(networkId).orElseThrow(() -> new IllegalArgumentException("Network not found"));
    }

    public void removeUser(List<NetworkMember> members, Network networkResponseEntity) {
        var userToRemove = networkResponseEntity.getMembers();
        userToRemove.removeIf(member -> members.stream().anyMatch(m -> m.getMemberId().equals(member.getMemberId())));
        networkResponseEntity.setMembers(userToRemove);
        networkRepository.save(networkResponseEntity);
    }

    public void update(Network networkResponseEntity, NetworkUpdateRequest networkUpdateRequest) {
        networkResponseEntity.setName(networkUpdateRequest.getName());
        networkResponseEntity.setDescription(networkUpdateRequest.getDescription());
        networkRepository.save(networkResponseEntity);
    }

    public Long sendMessage(NetworkMessage build) {
        var result = networkMessageRepository.save(build);
        return result.getMillis();
    }

    public List<NetworkMessage> getMessages(String networkId) {
        //dont know a way rn to get latest 20 messages cause orderby isnt supported by dynamodb
        return getAdditionalMessages(networkId);
    }

    public List<NetworkMessage> getAdditionalMessages(String networkId) {
        return networkMessageRepository.findByNetworkId(networkId).reversed();
    }

    public void favorite(String network, String username) {
        var networkResponseEntity = networkRepository.findById(network).orElseThrow();

        var newFavorites = new ArrayList<>(networkResponseEntity.getFavoriteMembers());
        if (networkResponseEntity.getFavoriteMembers().contains(username)) {
            newFavorites.remove(username);
        } else {
            newFavorites.add(username);
        }
        networkResponseEntity.setFavoriteMembers(newFavorites);
        networkRepository.save(networkResponseEntity);
    }

    public List<NetworkMessage> getMessagesAfterId(String networkId, Long id) {
        return networkMessageRepository.findByMillisGreaterThanAndNetworkId(id, networkId);
    }

    public void deleteNetworkMessages(Profile username) {
        var networkMember = new NetworkMember();
        networkMember.setMemberId(username.getUsername());
        networkMember.setMemberName(username.getName());
        networkMember.setMemberProfilePicturePath(username.getProfilePicturePath());

        networkMessageRepository.deleteAllBySenderId(networkMember);
    }
}
