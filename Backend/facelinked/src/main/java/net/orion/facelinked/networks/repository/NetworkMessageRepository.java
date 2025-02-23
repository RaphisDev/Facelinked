package net.orion.facelinked.networks.repository;

import net.orion.facelinked.config.AutoPrimaryKey;
import net.orion.facelinked.networks.NetworkMessage;
import org.socialsignin.spring.data.dynamodb.repository.EnableScan;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Comparator;
import java.util.List;

@Repository
@EnableScan
public interface NetworkMessageRepository extends CrudRepository<NetworkMessage, AutoPrimaryKey> {

    List<NetworkMessage> findByMillisGreaterThanAndNetworkId(Long idIsGreaterThan, String networkId);

    List<NetworkMessage> findByNetworkId(String networkId);
}
