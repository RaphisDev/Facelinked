package net.orion.facelinked.chats;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
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
        return chatRepository.findByTimestampAfterAndSenderId(timestamp, senderId);
    }

    public List<ChatMessage> findBySenderId(String senderId) {
        return chatRepository.findBySenderId(senderId);
    }
}
