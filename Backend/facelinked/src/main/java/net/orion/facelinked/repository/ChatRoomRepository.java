package net.orion.facelinked.repository;

import net.orion.facelinked.chatting.ChatRoom;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface ChatRoomRepository extends MongoRepository<ChatRoom, String>
{
    Optional<ChatRoom> findBySenderIdAndReceiverId(String senderId, String receiverId);
}
