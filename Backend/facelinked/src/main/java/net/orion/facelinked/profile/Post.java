package net.orion.facelinked.profile;

import com.amazonaws.services.dynamodbv2.datamodeling.*;
import jakarta.persistence.Convert;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import lombok.*;
import net.orion.facelinked.config.PrimaryKey;
import net.orion.facelinked.networks.MemberAttributeConverter;
import org.springframework.data.annotation.Id;

import java.util.List;

@Builder
@Getter
@Setter
@DynamoDBTable(tableName = "posts")
public class Post {
    @Id
    private PrimaryKey id;

    @DynamoDBHashKey(attributeName = "userId")
    public String getUserId() {
        return id != null ? id.getUserId() : null;
    }

    public void setUserId(String userId) {
        if (id == null) {
            id = new PrimaryKey();
        }
        id.setUserId(userId);
    }

    @DynamoDBRangeKey(attributeName = "millis")
    public Long getMillis() {
        return id != null ? id.getMillis() : null;
    }

    public void setMillis(Long millis) {
        if (id == null) {
            id = new PrimaryKey();
        }
        id.setMillis(millis);
    }

    @DynamoDBAttribute(attributeName = "title")
    private String title;
    @DynamoDBAttribute(attributeName = "content")
    private List<String> content;
    @DynamoDBAttribute(attributeName = "likes")
    private int likes;

    public Post(PrimaryKey id, String title, List<String> content, int likes) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.likes = likes;
    }
    public Post() {
    }
}
