package net.orion.facelinked.chatting;

import lombok.Builder;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Builder
@Document
public record ChatRoom(@Id String id, String chatId, String senderId, String receiverId)
{
    
}
