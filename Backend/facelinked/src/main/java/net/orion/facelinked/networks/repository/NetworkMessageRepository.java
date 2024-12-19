package net.orion.facelinked.networks.repository;

import net.orion.facelinked.networks.NetworkMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NetworkMessageRepository extends MongoRepository<NetworkMessage, String> {
    public List<NetworkMessage> findByTimestampAfterAndNetworkId(String timestamp, String networkId);

    //get last n messages from network, when scrolling up get more n messages
    public List<NetworkMessage> findTopByNetworkIdOrderByTimestampDesc(String networkId, Pageable pageable);
}
