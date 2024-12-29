package net.orion.facelinked.chats;

import lombok.AllArgsConstructor;
import net.orion.facelinked.chats.repository.ChatRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class ChatService {

    private ChatRepository chatRepository;

    public String saveToDatabase(ChatMessage message) {
        var result = chatRepository.save(message);
        return result.getId();
    }

    public List<ChatMessage> findByIdAfter(String id, String senderId) {
        return chatRepository.findByIdGreaterThanAndReceiverId(id, senderId);
    }

    public List<ChatMessage> findBySenderOrReceiverId(String senderId) {
        return chatRepository.findByReceiverIdOrSenderId(senderId, senderId);
    }
}
