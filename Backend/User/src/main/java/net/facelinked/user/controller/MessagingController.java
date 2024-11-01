package net.facelinked.user.controller;

import net.facelinked.user.repository.User;
import net.facelinked.user.service.UserService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class MessagingController
{
    private final UserService userService;

    public MessagingController(UserService userService)
    {
        this.userService = userService;
    }

    @MessageMapping("/user.addUser")
    @SendTo("/user/topic")
    public User addUser(@Payload User user)
    {
        userService.addUser(user);
        return user;
    }

    @MessageMapping("/user.disconnectUser")
    @SendTo("/user/topic")
    public User disconnect(@Payload User user)
    {
        userService.disconnect(user);
        return user;
    }
}
