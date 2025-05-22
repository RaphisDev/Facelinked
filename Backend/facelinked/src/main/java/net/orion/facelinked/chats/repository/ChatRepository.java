package net.orion.facelinked.chats.repository;

import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBTable;
import net.orion.facelinked.chats.ChatMessage;
import net.orion.facelinked.config.AutoPrimaryKey;
import net.orion.facelinked.config.PrimaryKey;
import org.socialsignin.spring.data.dynamodb.repository.DynamoDBCrudRepository;
import org.socialsignin.spring.data.dynamodb.repository.EnableScan;
import org.socialsignin.spring.data.dynamodb.repository.config.EnableDynamoDBRepositories;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@EnableScan
@Repository
public interface ChatRepository extends CrudRepository<ChatMessage, AutoPrimaryKey> {

    public List<ChatMessage> findByReceiverId(String receiverId);
    public List<ChatMessage> findBySenderId(String senderId);

    public List<ChatMessage> findByMillisGreaterThanAndReceiverId(Long idIsGreaterThan, String receiverId);

    void deleteAllBySenderId(String senderId);

    void deleteAllByReceiverId(String receiverId);

    public List<ChatMessage> findByMillisGreaterThanAndSenderId(Long id, String senderId);
}