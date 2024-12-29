package net.orion.facelinked.networks.service;

import lombok.AllArgsConstructor;
import net.orion.facelinked.chats.ChatMessage;
import net.orion.facelinked.networks.Network;
import net.orion.facelinked.networks.NetworkMember;
import net.orion.facelinked.networks.NetworkMessage;
import net.orion.facelinked.networks.repository.NetworkMessageRepository;
import net.orion.facelinked.networks.repository.NetworkRepository;
import net.orion.facelinked.networks.controller.NetworkUpdateRequest;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class NetworkService {

    private NetworkRepository networkRepository;
    private NetworkMessageRepository networkMessageRepository;

    public Long createNetwork(Network network) {
       return networkRepository.save(network).getId();
    }

    public void addUser(List<NetworkMember> members, Network network) {
        members.addAll(network.getMembers());
        network.setMembers(members);
        networkRepository.save(network);
    }

    public Network getNetwork(String networkId) {
        return networkRepository.findById(Long.parseLong(networkId));
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

    public NetworkMessage sendMessage(NetworkMessage build) {
        return networkMessageRepository.save(build);
    }

    public List<NetworkMessage> getMessages(String networkId) {
        return networkMessageRepository.findFirst20ByNetworkIdOrderByIdDesc(networkId).reversed();
    }

    public void favorite(String network, boolean b) {
        var networkResponseEntity = networkRepository.findById(Long.parseLong(network));
        if (networkResponseEntity == null) {
            throw new IllegalArgumentException("Network not found");
        }
    
        if (networkResponseEntity.getMemberCount() <= 0 && !b) {
            return;
        }
        if (b) {
            networkResponseEntity.setMemberCount(networkResponseEntity.getMemberCount() + 1);
        } else {
            networkResponseEntity.setMemberCount(networkResponseEntity.getMemberCount() - 1);
        }
        networkRepository.save(networkResponseEntity);
    }

    public List<NetworkMessage> getMessagesAfterId(String networkId, String id) {

        return networkMessageRepository.findByIdGreaterThanAndNetworkId(id, networkId);
    }
}
