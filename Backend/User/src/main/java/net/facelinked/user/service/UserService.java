package net.facelinked.user.service;

import net.facelinked.user.repository.User;
import net.facelinked.user.repository.UserRepository;
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
