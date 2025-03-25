package net.orion.facelinked.profile.service;

import lombok.AllArgsConstructor;
import net.orion.facelinked.networks.NetworkMember;
import net.orion.facelinked.profile.FaceSmash;
import net.orion.facelinked.profile.Profile;
import net.orion.facelinked.profile.repository.FaceSmashRepository;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.WeekFields;
import java.util.ArrayList;
import java.util.Locale;

@Service
@AllArgsConstructor
public class FaceSmashService {

    private final ProfileService profileService;
    private final FaceSmashRepository smashRepo;

    //call this from addFriend if friend >= 5 && facesmash is not already created || when anyone fetches the profile
    public FaceSmash smashPerson (Profile person) {
        var randomSmash = person.getFriends().get((int) (Math.random() * person.getFriends().size()));

        var person1Member = new NetworkMember();
        person1Member.setMemberId(person.getUsername());
        person1Member.setMemberName(person.getName());
        person1Member.setMemberProfilePicturePath(person.getProfilePicturePath());

        int currentWeek = LocalDate.now().get(WeekFields.of(Locale.getDefault()).weekOfWeekBasedYear());

        return smashRepo.save(new FaceSmash(person1Member, randomSmash, 0, 0 , new ArrayList<>(), new ArrayList<>(), currentWeek));
    }

    public FaceSmash findSmashById(String id) {
        var smash = smashRepo.findById(id);
        if (smash.isPresent()) {
            return smash.get();
        } else {
            var profile = profileService.findByUsername(id);
            if (profile.getFriends().size() >= 5) {
                return smashPerson(profile);
            } else {
                return null;
            }
        }
    }
}
