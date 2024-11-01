package net.facelinked.user.chatting;

import lombok.Builder;

@Builder
public record ChatNotification(String Id, String senderId, String reveiverId, String content)
{

}
