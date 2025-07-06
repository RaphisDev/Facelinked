package net.orion.facelinked.profile.controller;

import lombok.RequiredArgsConstructor;
import net.orion.facelinked.auth.services.UserService;
import net.orion.facelinked.chats.ChatService;
import net.orion.facelinked.config.PrimaryKey;
import net.orion.facelinked.networks.NetworkMember;
import net.orion.facelinked.networks.NetworkMessage;
import net.orion.facelinked.networks.service.NetworkService;
import net.orion.facelinked.profile.FaceSmash;
import net.orion.facelinked.profile.Post;
import net.orion.facelinked.profile.Profile;
import net.orion.facelinked.profile.ProfileRequest;
import net.orion.facelinked.profile.service.FaceSmashService;
import net.orion.facelinked.profile.service.ProfileService;
import net.orion.facelinked.profile.service.StorageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import software.amazon.awssdk.core.endpointdiscovery.providers.ProfileEndpointDiscoveryProvider;

import java.util.*;

@Controller
@RequestMapping("/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;
    private final UserService userService;
    private final StorageService storageService;
    private final FaceSmashService faceSmashService;
    private final ChatService chatService;
    private final NetworkService networkService;

    @ResponseStatus(HttpStatus.FOUND)
    @GetMapping(value = "/{username}", produces = "application/json")
    private ResponseEntity<Profile> GetProfile(@PathVariable String username) {
        var profile = profileService.findByUsername(username);
        return ResponseEntity.ok(profile);
    }

    @ResponseStatus(HttpStatus.FOUND)
    @GetMapping("/facesmash/{username}")
    private ResponseEntity<FaceSmash> GetFaceSmashProfile(@PathVariable String username) {
        var profile = faceSmashService.findSmashById(username);
        return ResponseEntity.ok(profile);
    }

    @ResponseStatus(HttpStatus.OK)
    @GetMapping("/homefeed")
    public ResponseEntity<List<Post>> getHomeFeed(@AuthenticationPrincipal UserDetails userDetails) {
        var username = userService.findByEmail(userDetails.getUsername()).getUserName();
        var profile = profileService.findByUsername(username);

        var homeFeedPosts = new ArrayList<Post>();
        var friends = new ArrayList<>(profile.getFriends());
        Collections.shuffle(friends);

        for (var friend : friends) {
            if (homeFeedPosts.size() >= 8) {
                break;
            }
            homeFeedPosts.addAll(profileService.getLast3Posts(friend.getMemberId()));
        }
        homeFeedPosts.sort(Comparator.comparing(Post::getMillis).reversed());

        return ResponseEntity.ok(homeFeedPosts);
    }

    @ResponseStatus(HttpStatus.FOUND)
    @GetMapping("/search/{name}")
    private ResponseEntity<List<Profile>> SearchProfile(@PathVariable String name) {
        var profile = profileService.searchByName(name);
        if(profile.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        return ResponseEntity.ok(profile);
    }

    @ResponseStatus(HttpStatus.ACCEPTED)
    @PutMapping("/update")
    public void Update(@AuthenticationPrincipal UserDetails userDetails, @RequestBody UpdateProfile body) {
        var username = userService.findByEmail(userDetails.getUsername()).getUserName();

        profileService.updateProfile(username, body);
    }

    @ResponseStatus(HttpStatus.ACCEPTED)
    @DeleteMapping("/delete")
    private void Delete(@AuthenticationPrincipal UserDetails userDetails, @RequestParam(value = "onlyUser", required = false) Boolean onlyUser)
    {
        var username = userService.findByEmail(userDetails.getUsername()).getUserName();
        var profile = profileService.findByUsername(username);

        userService.deleteUser(username);
        if (onlyUser == null || !onlyUser) {
            profileService.deleteProfile(username);
            profileService.deletePosts(username);
            chatService.deleteChatMessages(username);
            networkService.deleteNetworkMessages(profile);
        }
    }
    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping("/register")
    private void CompleteProfile(@RequestBody ProfileRequest profile, @AuthenticationPrincipal UserDetails userDetails)
    {
        if (userDetails != null) {
            if(!userService.findByEmail(userDetails.getUsername()).getUserName().equals(profile.getUsername())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not allowed to complete this profile");
            }
        }
        else {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }

        profileService.save(Profile.builder().profilePicturePath(profile.getProfilePicturePath())
                .username(profile.getUsername()).name(profile.getName()).dateOfBirth(profile.getDateOfBirth())
                .hobbies(profile.getHobbies()).inRelationship(profile.isInRelationship())
                .friends(Collections.emptyList()).location(profile.getLocation()).searchName(profile.getName().toLowerCase()).faceSmashId(null).friendRequests(Collections.emptyList()).build());
    }

    @ResponseStatus(HttpStatus.ACCEPTED)
    @PostMapping("/post")
    public void Post(@RequestBody Post profile, @AuthenticationPrincipal UserDetails userDetails)
    {
        var sender = userService.findByEmail(userDetails.getUsername()).getUserName();

        profileService.savePost(Post.builder().
                title(profile.getTitle()).
                id(new PrimaryKey(sender, System.currentTimeMillis())).
                content(profile.getContent()).
                likes(Collections.emptyList()).
                comments(Collections.emptyList()).
                images(profile.getImages()).
                build());
    }

    @ResponseStatus(HttpStatus.ACCEPTED)
    @PostMapping("/posts/like/{username}/{id}")
    public void LikePost(@PathVariable String username, @PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        var liker = userService.findByEmail(userDetails.getUsername()).getUserName();

        profileService.LikePost(username, id, liker);
    }

    @ResponseStatus(HttpStatus.ACCEPTED)
    @PutMapping("/update/profilePicture")
    public void UpdateProfilePicture(@AuthenticationPrincipal UserDetails userDetails, @RequestBody List<String> profilePicturePath) {
        var username = userService.findByEmail(userDetails.getUsername()).getUserName();
        StringBuilder oneStringProfilePicture = new StringBuilder();
        for(String path : profilePicturePath) {
            if(path.isEmpty()) {
                continue;
            }
            if(oneStringProfilePicture.isEmpty()) {
                oneStringProfilePicture = new StringBuilder(path);
            }
            else {
                oneStringProfilePicture.append(",").append(path);
            }
        }

        profileService.updateProfilePicture(username, oneStringProfilePicture.toString());
    }

    @ResponseStatus(HttpStatus.FOUND)
    @GetMapping("/posts/all/{username}")
    public ResponseEntity<List<Post>> GetPosts(@PathVariable String username, @AuthenticationPrincipal UserDetails userDetails)
    {
        var user = userService.findByEmail(userDetails.getUsername()).getUserName();
        return ResponseEntity.ok(profileService.getPosts(username, user));
    }

    @ResponseStatus(HttpStatus.OK)
    @DeleteMapping("/posts/{id}")
    public void DeletePost(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        var sender = userService.findByEmail(userDetails.getUsername()).getUserName();
        profileService.deletePost(sender, id);
    }

    @ResponseStatus(HttpStatus.FOUND)
    @GetMapping("/posts/last5/{username}")
    public ResponseEntity<List<Post>> GetLast5Posts(@PathVariable String username, @AuthenticationPrincipal UserDetails userDetails)
    {
        var user = userService.findByEmail(userDetails.getUsername()).getUserName();
        return ResponseEntity.ok(profileService.getLast5Posts(username, user));
    }

    @ResponseStatus(HttpStatus.ACCEPTED)
    @PostMapping("/friend/{username}")
    public void AddFriend(@PathVariable String username, @AuthenticationPrincipal UserDetails userDetails)
    {
        var sender = userService.findByEmail(userDetails.getUsername());
        var senderProfile = profileService.findByUsername(sender.getUserName());

        var toAdd = profileService.findByUsername(username);
        var member = new NetworkMember();
        member.setMemberId(toAdd.getUsername());
        member.setMemberName(toAdd.getName());
        member.setMemberProfilePicturePath(toAdd.getProfilePicturePath());

        profileService.addFriend(senderProfile, toAdd, member, faceSmashService);
    }

    @ResponseStatus(HttpStatus.OK)
    @DeleteMapping("/friend/request/{username}")
    public void RemoveFriendRequest(@PathVariable String username, @AuthenticationPrincipal UserDetails userDetails) {
        var sender = userService.findByEmail(userDetails.getUsername()).getUserName();
        var senderProfile = profileService.findByUsername(sender);

        profileService.removeFriendRequest(senderProfile, username);
    }

    @ResponseStatus(HttpStatus.ACCEPTED)
    @DeleteMapping("/friend/{username}")
    public void RemoveFriend(@PathVariable String username, @AuthenticationPrincipal UserDetails userDetails)
    {
        var sender = userService.findByEmail(userDetails.getUsername()).getUserName();
        var senderProfile = profileService.findByUsername(sender);

        profileService.removeFriend(senderProfile, username);
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping("/posts/{profile}/{id}")
    public void AddComment(@PathVariable String profile, @PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails, @RequestBody String comment) {
        var sender = userService.findByEmail(userDetails.getUsername()).getUserName();
        var senderProfile = profileService.findByUsername(sender);

        var userProfile = profileService.findByUsername(profile);

        profileService.addComment(id, senderProfile, comment, userProfile);
    }

    @ResponseStatus(HttpStatus.ACCEPTED)
    @GetMapping("/upload")
    private ResponseEntity<String> BucketUrl()
    {
        return ResponseEntity.ok(storageService.generatePresignedUrl());
    }

    @ResponseStatus(HttpStatus.ACCEPTED)
    @PutMapping("/update/picture")
    public ResponseEntity<String> UpdateProfilePicture(@AuthenticationPrincipal UserDetails userDetails, @RequestBody String picturePath) {
        var username = userService.findByEmail(userDetails.getUsername()).getUserName();
        var profile = profileService.findByUsername(username);
        if (Arrays.stream(profile.getProfilePicturePath().split(",")).noneMatch(path -> path.equals(picturePath))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return ResponseEntity.ok(storageService.updatePicture(picturePath.substring(picturePath.lastIndexOf("/") + 1)));
    }
}