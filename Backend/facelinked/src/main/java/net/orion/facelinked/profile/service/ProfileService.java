package net.orion.facelinked.profile.service;

import com.amazonaws.services.dynamodbv2.document.Item;
import com.eatthepath.pushy.apns.ApnsClient;
import com.eatthepath.pushy.apns.PushNotificationResponse;
import com.eatthepath.pushy.apns.util.SimpleApnsPushNotification;
import com.eatthepath.pushy.apns.util.concurrent.PushNotificationFuture;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import net.orion.facelinked.auth.User;
import net.orion.facelinked.auth.services.UserService;
import net.orion.facelinked.config.PrimaryKey;
import net.orion.facelinked.networks.NetworkMember;
import net.orion.facelinked.networks.NetworkMemberListConverter;
import net.orion.facelinked.profile.Post;
import net.orion.facelinked.profile.Profile;
import net.orion.facelinked.profile.controller.UpdateProfile;
import net.orion.facelinked.profile.repository.PostRepository;
import net.orion.facelinked.profile.repository.ProfileRepository;
import net.orion.facelinked.service.PushNotificationService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.parameters.P;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class ProfileService {
    private final UserService userService;
    private final ApnsClient apnsClient;
    private final PushNotificationService pushNotificationService;
    private ProfileRepository profileRepository;
    private PostRepository postRepository;

    public Profile findByUsername(String memberId) {
        return profileRepository.findById(memberId).orElse(null);
    }

    public boolean existsByUsername(String username) {
        return profileRepository.existsByUsername(username);
    }

    public void save(Profile build) {
        profileRepository.save(build);
    }

    public List<Profile> searchByName(String name) {
        List<Profile> profilesByName = new ArrayList<>(profileRepository.searchTop7BySearchNameContains(name.toLowerCase()).orElseThrow());
        if (profilesByName.size() < 5) {
            profilesByName.addAll(profileRepository.searchTop5ByUsernameContains(name.toLowerCase()).orElseThrow());
            return profilesByName.stream().distinct().collect(Collectors.toList());
        }
        return profilesByName;
    }

    public void savePost(Post post) {
        postRepository.save(post);
    }

    public List<Post> getPosts(String username, String user) {
        var profile = profileRepository.findById(username).orElseThrow();
        if (!profile.getUsername().equals(user) && profile.getFriends().stream().noneMatch(friend -> friend.getMemberId().equals(user))) {
            return Collections.emptyList();
        }
        return postRepository.findByUserIdOrderByMillisDesc(username);
    }

    public void deletePost(String username, Long millis) {
        postRepository.deleteById(new PrimaryKey(username, millis));
    }

    public List<Post> getLast5Posts(String username, String user) {
        var profile = profileRepository.findById(username).orElseThrow();
        if (!profile.getUsername().equals(user) && profile.getFriends().stream().noneMatch(friend -> friend.getMemberId().equals(user))) {
            return Collections.emptyList();
        }
        return postRepository.findTop5ByUserIdOrderByMillisDesc(username);
    }

    public void addFriend(Profile user, Profile toAdd, NetworkMember memberToAdd, FaceSmashService faceSmashService) {

        if(user.getFriends().stream().anyMatch(friend -> friend.getMemberId().equals(memberToAdd.getMemberId()))) {
            return;
        }
        if (user.getFriendRequests().contains(memberToAdd)) {
            var friendRequests = new ArrayList<>(user.getFriendRequests());
            friendRequests.remove(memberToAdd);
            user.setFriendRequests(friendRequests);
            var newFriends = new ArrayList<>(user.getFriends());
            newFriends.add(memberToAdd);
            user.setFriends(newFriends);
            profileRepository.save(user);

            var newFriendsOfToAdd = new ArrayList<>(toAdd.getFriends());
            var userMember = new NetworkMember();
            userMember.setMemberId(user.getUsername());
            userMember.setMemberName(user.getName());
            userMember.setMemberProfilePicturePath(user.getProfilePicturePath());
            newFriendsOfToAdd.add(userMember);
            toAdd.setFriends(newFriendsOfToAdd);
            profileRepository.save(toAdd);

            if (user.getFriends().size() >= 5 && user.getFaceSmashId() == null) {
                faceSmashService.smashPerson(user);
            }
            return;
        }

        if (toAdd.getFriendRequests().stream().anyMatch(friend -> friend.getMemberId().equals(user.getUsername()))) {
            return;
        }
        var newFriendRequests = new ArrayList<>(toAdd.getFriendRequests());

        var member = new NetworkMember();
        member.setMemberId(user.getUsername());
        member.setMemberName(user.getName());
        member.setMemberProfilePicturePath(user.getProfilePicturePath());

        newFriendRequests.add(member);
        toAdd.setFriendRequests(newFriendRequests);

        profileRepository.save(toAdd);

        sendPushNotification(toAdd.getUsername(), user.getName(), user.getProfilePicturePath());
    }

    public void sendPushNotification(String receiver, String sender, String profilePictureUrl) {
        var receiverAccount = userService.findByUsername(receiver);
        if (receiverAccount.getDeviceTokens() == null || receiverAccount.getDeviceTokens().isEmpty()) {
            return;
        }

        pushNotificationService.sendPushNotification(receiverAccount.getDeviceTokens(), sender, "New friend request!", profilePictureUrl, null, receiverAccount);
    }

    public void addComment(Long millis, Profile sender, String comment, Profile user) {

        comment = sender.getUsername() + "Ð" + sender.getProfilePicturePath() + "Ð" + comment;

        var post = postRepository.findById(new PrimaryKey(user.getUsername(), millis)).orElseThrow();
        var currentComment = new ArrayList<>(post.getComments());
        currentComment.add(comment);
        post.setComments(currentComment);
        postRepository.save(post);
    }

    public void removeFriend(Profile user, String username) {

        var newFriends = new ArrayList<>(user.getFriends());
        newFriends.removeIf(friend -> friend.getMemberId().equals(username));
        user.setFriends(newFriends);

        profileRepository.save(user);

        var toRemove = profileRepository.findById(username).orElseThrow();
        var newFriendsOfOther = new ArrayList<>(toRemove.getFriends());
        newFriendsOfOther.removeIf(friend -> friend.getMemberId().equals(user.getUsername()));
        toRemove.setFriends(newFriendsOfOther);

        profileRepository.save(toRemove);
    }

    public void LikePost(String user, Long millis, String liker) {
        var post = postRepository.findById(new PrimaryKey(user, millis)).orElseThrow();

        var newLikes = new ArrayList<>(post.getLikes());
        if (post.getLikes().contains(liker)) {
            newLikes.remove(liker);
        } else {
            newLikes.add(liker);
        }
        post.setLikes(newLikes);
        postRepository.save(post);
    }

    public void removeFriendRequest(Profile senderProfile, String toRemove) {
        var newFriendRequests = new ArrayList<>(senderProfile.getFriendRequests());
        newFriendRequests.removeIf(friend -> friend.getMemberId().equals(toRemove));
        senderProfile.setFriendRequests(newFriendRequests);

        profileRepository.save(senderProfile);
    }

    public void deleteProfile(String username) {
        profileRepository.deleteById(username);
    }

    public void updateProfile(String username, UpdateProfile body) {
        var profile = profileRepository.findById(username).orElseThrow();

        profile.setName(body.getName());
        profile.setLocation(body.getLocation());
        profile.setHobbies(body.getHobbies());
        profile.setInRelationship(body.isInRelationship());

        profileRepository.save(profile);
    }

    public void updateProfilePicture(String username, String profilePicturePath) {
        var profile = profileRepository.findById(username).orElseThrow();

        profile.setProfilePicturePath(profilePicturePath);
        profileRepository.save(profile);
    }

    public void deletePosts(String username) {
        postRepository.deleteAllByUserId(username);
    }

    public List<Post> getLast3Posts(String memberId) {
        return postRepository.findTop3ByUserIdOrderByMillisDesc(memberId);
    }
}
