package net.orion.facelinked.controller;

import net.facelinked.user.chatting.ChatMessage;
import net.facelinked.user.chatting.ChatNotification;
import net.facelinked.user.chatting.ChatRoom;
import net.facelinked.user.service.ChatMessageService;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@Controller
public class ChatController
{
    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageService chatMessageService;

    public ChatController(SimpMessagingTemplate messagingTemplate, ChatMessageService chatMessageService)
    {
        this.messagingTemplate = messagingTemplate;
        this.chatMessageService = chatMessageService;
    }

    @MessageMapping("/chat")
    public void processMessage(@Payload ChatMessage chatMessage)
    {
        var savedMsg = chatMessageService.save(chatMessage);
        messagingTemplate.convertAndSendToUser(chatMessage.getReceiverId(), "/queue/messages", ChatNotification.builder()
                        .Id(savedMsg.getId())
                        .senderId(savedMsg.getSenderId())
                        .reveiverId(savedMsg.getReceiverId())
                        .content(savedMsg.getContent())
                .build());
    }

    @GetMapping("/messages/{senderId}/{receiverId}")
    public ResponseEntity<List<ChatMessage>> getChatMessages(@PathVariable("senderId") String senderId,
            @PathVariable("receiverId") String receiverId)
    {
        return ResponseEntity.ok(chatMessageService.findChatMessage(senderId, receiverId));
    }
}
