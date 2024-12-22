package net.orion.facelinked.networks.repository;

import net.orion.facelinked.networks.NetworkMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NetworkMessageRepository extends MongoRepository<NetworkMessage, String> {

    List<NetworkMessage> findTopByNetworkIdOrderByIdDesc(String networkId, Pageable pageable);
}
