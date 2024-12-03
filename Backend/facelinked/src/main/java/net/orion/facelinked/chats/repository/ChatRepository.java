package net.orion.facelinked.chats.repository;

import net.orion.facelinked.chats.ChatMessage;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatRepository extends MongoRepository<ChatMessage, String> {

    public List<ChatMessage> findByTimestampAfterAndReceiverId(String timestamp, String receiverId);
    public List<ChatMessage> findByReceiverIdOrSenderId(String receiverId, String senderId);
}
