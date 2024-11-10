package net.orion.facelinked.chats;

import lombok.Builder;

@Builder
public record ChatNotification(String Id, String senderId, String reveiverId, String content)
{

}
