package net.orion.facelinked.service;

import net.orion.facelinked.repository.User;
import net.orion.facelinked.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserService
{
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository)
    {
        this.userRepository = userRepository;
    }

    public void disconnect(User user)
    {
        //userRepository.update(); Set status to OFFLINE
    }

    public void addUser(User user)
    {
        //userRepository.update(); Set status to ONLINE
    }
}
