package net.orion.facelinked.profile.repository;

import net.orion.facelinked.profile.FaceSmash;
import org.socialsignin.spring.data.dynamodb.repository.EnableScan;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
@EnableScan
public interface FaceSmashRepository extends CrudRepository<FaceSmash, String> {
    void deleteAllByWeekLessThan(int weekIsLessThan);
}
