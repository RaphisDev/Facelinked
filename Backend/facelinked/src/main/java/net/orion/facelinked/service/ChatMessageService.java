package net.orion.facelinked.service;

import net.facelinked.user.chatting.ChatMessage;
import net.facelinked.user.repository.ChatMessageRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ChatMessageService
{
    private final ChatMessageRepository repository;
    private final ChatRoomService chatRoomService;

    public ChatMessageService(ChatMessageRepository chatMessageRepository, ChatRoomService chatRoomService)
    {
        this.repository = chatMessageRepository;
        this.chatRoomService = chatRoomService;
    }

    public ChatMessage save(ChatMessage chatMessage)
    {
        var chatId = chatRoomService.getChatRoomId(chatMessage.getSenderId(), chatMessage.getReceiverId(), true).orElseThrow();
        chatMessage.setChatId(chatId);
        repository.save(chatMessage);
        return chatMessage;
    }

    public List<ChatMessage> findChatMessage(String senderId, String receiverId)
    {
        var chatRoomId = chatRoomService.getChatRoomId(senderId, receiverId, false);
        return chatRoomId.map(repository::findByChatId).orElse(new ArrayList<>());
    }
}
