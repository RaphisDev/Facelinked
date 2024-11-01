package net.facelinked.user.repository;

import net.facelinked.user.chatting.ChatMessage;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ChatMessageRepository extends MongoRepository<ChatMessage, String>
{
    List<ChatMessage> findByChatId(String chatId);
}
