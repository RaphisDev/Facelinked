package net.orion.facelinked.networks.service;

import lombok.AllArgsConstructor;
import net.orion.facelinked.networks.Network;
import net.orion.facelinked.networks.NetworkMember;
import net.orion.facelinked.networks.repository.NetworkRepository;
import net.orion.facelinked.profile.Profile;
import net.orion.facelinked.profile.service.ProfileService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class NetworkService {

    private NetworkRepository networkRepository;

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
}
