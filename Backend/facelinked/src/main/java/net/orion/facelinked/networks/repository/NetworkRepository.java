package net.orion.facelinked.networks.repository;

import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBQueryExpression;
import net.orion.facelinked.networks.Network;
import org.socialsignin.spring.data.dynamodb.repository.EnableScan;
import org.socialsignin.spring.data.dynamodb.repository.ExpressionAttribute;
import org.socialsignin.spring.data.dynamodb.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@EnableScan
public interface NetworkRepository extends CrudRepository<Network, String> {
    public List<Network> searchTop5BySearchNameContains(String name);
    public List<Network> findTop3ByCreatorId(String creatorId);
}
