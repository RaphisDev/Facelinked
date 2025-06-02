package net.orion.facelinked.networks.repository;

import net.orion.facelinked.networks.Network;
import org.socialsignin.spring.data.dynamodb.repository.EnableScan;
import org.socialsignin.spring.data.dynamodb.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@EnableScan
public interface NetworkRepository extends CrudRepository<Network, String> {
    public List<Network> searchTop5BySearchNameContains(String name);
    @Query(fields = "SELECT n FROM Network n JOIN n.favoriteMembers fm WHERE fm = :username")
    public List<Network> findByFavoriteMembersContaining(@Param(value = "username") String username);
}
