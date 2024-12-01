package net.orion.facelinked.chats;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
//import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Setter
@Getter
@Builder
public class ChatMessage
{
    private String senderId;
    private String receiverId;
    private String content;
    private String timestamp;
}
