package net.orion.facelinked.profile.repository;

import net.orion.facelinked.networks.NetworkMember;
import net.orion.facelinked.profile.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProfileRepository extends JpaRepository<Profile, String>
{
    Optional<Profile> findByUsername(String username);

    boolean existsByUsername(String username);

    Optional<List<Profile>> searchTop5ByNameContainsIgnoreCase(String name);
}
