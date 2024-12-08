package net.orion.facelinked.networks.service;

import lombok.AllArgsConstructor;
import net.orion.facelinked.networks.Network;
import net.orion.facelinked.networks.repository.NetworkRepository;
import org.springframework.stereotype.Service;

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
}
