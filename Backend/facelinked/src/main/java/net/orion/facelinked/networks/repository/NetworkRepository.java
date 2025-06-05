package net.orion.facelinked.networks.repository;

import net.orion.facelinked.networks.Network;
import org.socialsignin.spring.data.dynamodb.repository.EnableScan;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@EnableScan
public interface NetworkRepository extends CrudRepository<Network, String> {
    public List<Network> searchTop5BySearchNameContains(String name);
    @Query(filterExpression = "contains(favoriteNetworks, :val)")
    List<Network> findByFavoriteNetworksContaining(@Param("val") String val);
    public List<Network> findTop3ByCreatorId(String creatorId);
}
