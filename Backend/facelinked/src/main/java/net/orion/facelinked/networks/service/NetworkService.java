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

    public boolean isPrivate(String networkId) {
        return networkRepository.findById(Long.parseLong(networkId)).isPrivate();
    }

    public boolean isMemberOfNetwork(String networkId, String memberId) {
        return networkRepository.findById(Long.parseLong(networkId)).getMembers().stream().anyMatch(member -> member.getMemberId().equals(memberId));
    }
    public boolean isCreatorOfNetwork(String networkId, String creatorId) {
        return networkRepository.findById(Long.parseLong(networkId)).getCreatorId().equals(creatorId);
    }

    public void addUser(List<NetworkMember> members, String networkId) {
        Network network = networkRepository.findById(Long.parseLong(networkId));
        members.addAll(network.getMembers());
        network.setMembers(members);
        networkRepository.save(network);
    }

    public List<NetworkMember> getMembers(String networkId) {
        return networkRepository.findById(Long.parseLong(networkId)).getMembers();
    }
}
