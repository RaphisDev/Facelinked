package net.orion.facelinked.auth.services;

import lombok.AllArgsConstructor;
import net.orion.facelinked.auth.User;
import net.orion.facelinked.auth.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User findByEmail(String email) {
        return userRepository.findByEmail(email.toLowerCase()).orElseThrow();
    }

    public User findByUsername(String id) {
        return userRepository.findByUserName(id).orElseThrow();
    }

    public void save(User user) {
        userRepository.save(user);
    }

    public void deleteUser(String username) {
        userRepository.deleteById(username);
    }
}
