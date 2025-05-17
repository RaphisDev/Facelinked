package net.orion.facelinked.chats;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import net.orion.facelinked.chats.repository.ChatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@AllArgsConstructor
public class ChatService {

    private ChatRepository chatRepository;

    public Long saveToDatabase(ChatMessage message) {
        var result = chatRepository.save(message);
        return result.getMillis();
    }

    public List<ChatMessage> findByIdAfter(Long id, String senderId) {
        return chatRepository.findByMillisGreaterThanAndReceiverId(id, senderId);
    }

    public List<ChatMessage> findBySenderOrReceiverId(String senderId) {
        var byReceiverId = chatRepository.findByReceiverId(senderId);
        var modifiableList = new ArrayList<>(byReceiverId);
        modifiableList.addAll(chatRepository.findBySenderId(senderId));
        modifiableList.sort(Comparator.comparing(ChatMessage::getMillis));
        return modifiableList;
    }

    public void deleteChatMessages(String username) {
        chatRepository.deleteAllBySenderId(username);
        chatRepository.deleteAllByReceiverId(username);
    }
}
