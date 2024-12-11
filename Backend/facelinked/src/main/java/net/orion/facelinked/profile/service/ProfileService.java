package net.orion.facelinked.profile.service;

import lombok.AllArgsConstructor;
import net.orion.facelinked.profile.Profile;
import net.orion.facelinked.profile.repository.ProfileRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class ProfileService {
    private final ProfileRepository profileRepository;

    public Profile findByUsername(String memberId) {
        return profileRepository.findByUsername(memberId).orElseThrow();
    }

    public boolean existsByUsername(String username) {
        return profileRepository.existsByUsername(username);
    }

    public void save(Profile build) {
        profileRepository.save(build);
    }
}
