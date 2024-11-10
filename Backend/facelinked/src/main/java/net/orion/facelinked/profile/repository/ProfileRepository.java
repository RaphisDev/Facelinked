package net.orion.facelinked.profile.repository;

import net.orion.facelinked.auth.User;
import net.orion.facelinked.profile.controller.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProfileRepository extends JpaRepository<Profile, String>
{
    Optional<Profile> findByUsername(String username);
}
