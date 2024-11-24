package net.orion.facelinked.chats.controller;

import net.orion.facelinked.chats.ChatMessage;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.socket.client.WebSocketClient;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

@Controller
public class ChatController {

    @MessageMapping("/chat")
    @SendTo("/topic/messages")
    public ChatMessage send(MessageRequest message) {
        //Verify the message with the token
        return ChatMessage.builder()
                .content(message.getContent())
                .timestamp((message.getTimestamp()))
                .build();
    }
}
