package net.orion.facelinked.profile;

import jakarta.persistence.Convert;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.*;
import net.orion.facelinked.networks.MemberAttributeConverter;

import java.util.List;

@Builder
@Data
@Getter
@Setter
public class Post {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private String id;
    private String title;
    @Convert(converter = MemberAttributeConverter.class)
    private List<String> content;
    private String username;
    private int likes;
}
