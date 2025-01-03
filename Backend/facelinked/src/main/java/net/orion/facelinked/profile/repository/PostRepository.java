package net.orion.facelinked.profile.repository;

import net.orion.facelinked.profile.Post;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends MongoRepository<Post, String> {
    List<Post> findByUsernameOrderByIdDesc(String username);
    List<Post> findTop5ByUsernameOrderByIdDesc(String username);
}
