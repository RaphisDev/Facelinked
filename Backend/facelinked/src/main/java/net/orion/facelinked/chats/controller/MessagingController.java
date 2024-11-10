package net.orion.facelinked.chats.controller;

import net.orion.facelinked.auth.User;
import net.orion.facelinked.auth.services.AuthService;
import org.springframework.stereotype.Controller;

@Controller
public class MessagingController
{
    /*private final AuthService userService;

    public MessagingController(AuthService authService)
    {
        this.userService = authService;
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
    }*/
}
