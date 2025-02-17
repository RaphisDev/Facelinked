package net.orion.facelinked.profile.repository;

import net.orion.facelinked.profile.Profile;
import org.socialsignin.spring.data.dynamodb.repository.EnableScan;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@EnableScan
public interface ProfileRepository extends CrudRepository<Profile, String>
{
    boolean existsByUsername(String username);

    Optional<List<Profile>> searchTop5BySearchNameContains(String name);
}