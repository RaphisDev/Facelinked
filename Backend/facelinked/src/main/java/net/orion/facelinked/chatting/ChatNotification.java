package net.orion.facelinked.chatting;

import lombok.Builder;

@Builder
public record ChatNotification(String Id, String senderId, String reveiverId, String content)
{

}
