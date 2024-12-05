package net.orion.facelinked.networks.repository;

import net.orion.facelinked.networks.Network;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NetworkRepository extends JpaRepository<Network, String> {

}
