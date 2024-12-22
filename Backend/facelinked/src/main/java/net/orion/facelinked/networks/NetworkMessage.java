package net.orion.facelinked.networks;

import jakarta.persistence.Convert;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Builder;
import lombok.Generated;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Builder
public class NetworkMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private String id;
    @Convert(converter = MemberAttributeConverter.class)
    private NetworkMember senderId;
    private String networkId;
    private String content;
    private String timestamp;
}
