package net.orion.facelinked.networks;

import jakarta.persistence.Convert;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Builder
public class NetworkMessage {
    @Convert(converter = MemberAttributeConverter.class)
    private NetworkMember senderId;
    private String networkId;
    private String content;
    private String timestamp;
}
