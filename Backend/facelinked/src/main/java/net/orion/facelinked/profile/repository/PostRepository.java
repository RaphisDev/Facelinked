package net.orion.facelinked.profile.repository;

import net.orion.facelinked.config.PrimaryKey;
import net.orion.facelinked.profile.Post;
import org.socialsignin.spring.data.dynamodb.repository.EnableScan;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@EnableScan
public interface PostRepository extends CrudRepository<Post, PrimaryKey> {
    List<Post> findByUserIdOrderByMillisDesc(String username);

    List<Post> findTop5ByUserIdOrderByMillisDesc(String userId);

    void deleteAllByUserId(String userId);

    List<Post> findTop3ByUserIdOrderByMillisDesc(String memberId);
}
