package net.orion.facelinked.repository;

import net.orion.facelinked.chatting.ChatMessage;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ChatMessageRepository extends MongoRepository<ChatMessage, String>
{
    List<ChatMessage> findByChatId(String chatId);
}
