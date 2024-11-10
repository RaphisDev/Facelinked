package net.orion.facelinked.chats.controller;

import net.orion.facelinked.chats.service.ChatMessageService;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController
{
    /*@MessageMapping("/chat")
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
    }*/
}
