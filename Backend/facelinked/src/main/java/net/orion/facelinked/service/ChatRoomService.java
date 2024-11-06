package net.orion.facelinked.service;

import net.facelinked.user.chatting.ChatRoom;
import net.facelinked.user.repository.ChatRoomRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ChatRoomService
{
    private final ChatRoomRepository chatRoomRepository;

    public ChatRoomService(ChatRoomRepository chatRoomRepository)
    {
        this.chatRoomRepository = chatRoomRepository;
    }

    public Optional<String> getChatRoomId(String senderId, String receiverId, boolean createNewRoomIfNonExists)
    {
        return chatRoomRepository.findBySenderIdAndReceiverId(senderId, receiverId).map(ChatRoom::chatId).or(() -> {
            if(createNewRoomIfNonExists)
            {
                var chatId = createChat(senderId, receiverId);
                return Optional.of(chatId);
            }
            return Optional.empty();
        });
    }

    private String createChat(String senderId, String receiverId)
    {
        var chatId = String.format("%s_%s", senderId, receiverId);

        var senderRecipient = ChatRoom.builder().chatId(chatId).senderId(senderId).receiverId(receiverId).build();
        var recipientSender = ChatRoom.builder().chatId(chatId).senderId(senderId).receiverId(receiverId).build();

        chatRoomRepository.save(senderRecipient);
        chatRoomRepository.save(recipientSender);
        return chatId;
    }
}
