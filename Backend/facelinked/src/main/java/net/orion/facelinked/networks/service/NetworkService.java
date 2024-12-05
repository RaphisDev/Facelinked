package net.orion.facelinked.networks.service;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import net.orion.facelinked.networks.Network;
import net.orion.facelinked.networks.repository.NetworkRepository;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class NetworkService {

    private NetworkRepository networkRepository;

    public void createNetwork(Network network) {
        networkRepository.save(network);
    }
}
