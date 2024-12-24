package net.orion.facelinked.networks;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Network {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String description;
    private String creatorId;
    private boolean isPrivate;
    @Convert(converter = MemberAttributeConverter.class)
    private List<NetworkMember> members;
    private String networkPicturePath;
    private Integer memberCount;
}
