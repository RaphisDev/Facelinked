package net.orion.facelinked.chats;

import lombok.AllArgsConstructor;
import net.orion.facelinked.chats.repository.ChatRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class ChatService {

    private ChatRepository chatRepository;

    public void saveToDatabase(ChatMessage message) {
        chatRepository.save(message);
    }

    public List<ChatMessage> findByTimestampAfter(String timestamp, String senderId) {
        return chatRepository.findByTimestampAfterAndReceiverId(timestamp, senderId);
    }

    public List<ChatMessage> findBySenderOrReceiverId(String senderId) {
        return chatRepository.findByReceiverIdOrSenderId(senderId, senderId);
    }
}
