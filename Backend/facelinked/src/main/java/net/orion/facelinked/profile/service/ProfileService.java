package net.orion.facelinked.profile.service;

import lombok.AllArgsConstructor;
import net.orion.facelinked.networks.NetworkMember;
import net.orion.facelinked.profile.Post;
import net.orion.facelinked.profile.Profile;
import net.orion.facelinked.profile.repository.PostRepository;
import net.orion.facelinked.profile.repository.ProfileRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class ProfileService {
    private ProfileRepository profileRepository;
    private PostRepository postRepository;

    public Profile findByUsername(String memberId) {
        return profileRepository.findById(memberId).orElseThrow();
    }

    public boolean existsByUsername(String username) {
        return profileRepository.existsByUsername(username);
    }

    public void save(Profile build) {
        profileRepository.save(build);
    }

    public Optional<List<Profile>> searchByUsername(String username) {
        return profileRepository.searchTop5BySearchNameContains(username.toLowerCase());
    }

    public void savePost(Post post) {
        postRepository.save(post);
    }

    public List<Post> getPosts(String username) {
        return postRepository.findByUserIdOrderByMillisDesc(username);
    }

    public List<Post> getLast5Posts(String username) {
        return postRepository.findTop5ByUserIdOrderByMillisDesc(username);
    }

    public void addFriend(Profile user, NetworkMember toAdd) {

        if(user.getFriends().stream().anyMatch(friend -> friend.getMemberId().equals(toAdd.getMemberId()))) {
            return;
        }
        var newFriends = user.getFriends();
        newFriends.add(toAdd);
        user.setFriends(newFriends);

        profileRepository.save(user);
    }

    public void removeFriend(Profile user, String username) {

        var newFriends = user.getFriends();
        newFriends.removeIf(friend -> friend.getMemberId().equals(username));
        user.setFriends(newFriends);

        profileRepository.save(user);
    }
}
