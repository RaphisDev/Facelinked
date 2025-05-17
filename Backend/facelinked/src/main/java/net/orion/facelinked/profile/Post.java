package net.orion.facelinked.profile;

import com.amazonaws.services.dynamodbv2.datamodeling.*;
import lombok.*;
import net.orion.facelinked.config.PrimaryKey;
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
    private List<String> likes;
    @DynamoDBAttribute(attributeName = "comments")
    private List<String> comments;
    @DynamoDBAttribute(attributeName = "images")
    private List<String> images;

    public Post(PrimaryKey id, String title, List<String> content, List<String> likes, List<String> comments, List<String> images) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.likes = likes;
        this.comments = comments;
        this.images = images;
    }
    public Post() {
    }
}
