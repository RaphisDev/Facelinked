package net.orion.facelinked.networks.service;

import lombok.AllArgsConstructor;
import net.orion.facelinked.networks.Network;
import net.orion.facelinked.networks.NetworkMember;
import net.orion.facelinked.networks.NetworkMessage;
import net.orion.facelinked.networks.repository.NetworkMessageRepository;
import net.orion.facelinked.networks.repository.NetworkRepository;
import net.orion.facelinked.networks.controller.NetworkUpdateRequest;
import net.orion.facelinked.profile.Profile;
import net.orion.facelinked.profile.service.ProfileService;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@AllArgsConstructor
public class NetworkService {

    private final ProfileService profileService;
    private NetworkRepository networkRepository;
    private NetworkMessageRepository networkMessageRepository;

    public String createNetwork(Network network) {
       return networkRepository.save(network).getId();
    }

    public void addUser(List<NetworkMember> members, Network network) {
        members.addAll(network.getMembers());
        network.setMembers(members);
        networkRepository.save(network);
    }

    public List<Network> searchForNetwork(String searchName) {
        return networkRepository.searchTop5BySearchNameContains(searchName);
    }

    public List<Network> getFavoriteNetworks(String username) {
        var list = new ArrayList<String>();
        list.add(username);
        return networkRepository.findByFavoriteMembersContains(list);
    }

    public Network getNetwork(String networkId) {
        return networkRepository.findById(networkId).orElseThrow(() -> new IllegalArgumentException("Network not found"));
    }

    public void removeUser(List<NetworkMember> members, Network networkResponseEntity) {
        var newMembers = new ArrayList<>(networkResponseEntity.getMembers());
        newMembers.removeIf(member -> members.stream().anyMatch(m -> m.getMemberId().equals(member.getMemberId())));
        networkResponseEntity.setMembers(newMembers);
        networkRepository.save(networkResponseEntity);
    }

    public void update(Network networkResponseEntity, NetworkUpdateRequest networkUpdateRequest) {
        networkResponseEntity.setName(networkUpdateRequest.getName());
        networkResponseEntity.setDescription(networkUpdateRequest.getDescription());
        networkRepository.save(networkResponseEntity);
    }

    public Long sendMessage(NetworkMessage build) {
        var result = networkMessageRepository.save(build);
        return result.getMillis();
    }

    public List<NetworkMessage> getMessages(String networkId) {
        //dont know a way rn to get latest 20 messages cause orderby isnt supported by dynamodb
        return getAdditionalMessages(networkId);
    }

    public List<NetworkMessage> getAdditionalMessages(String networkId) {
        return networkMessageRepository.findByNetworkId(networkId).reversed();
    }

    public void favorite(String network, String username) {
        var networkResponseEntity = networkRepository.findById(network).orElseThrow();

        var newFavorites = new ArrayList<>(networkResponseEntity.getFavoriteMembers());
        if (networkResponseEntity.getFavoriteMembers().contains(username)) {
            newFavorites.remove(username);
        } else {
            newFavorites.add(username);
        }
        networkResponseEntity.setFavoriteMembers(newFavorites);
        networkRepository.save(networkResponseEntity);
    }

    public List<NetworkMessage> getMessagesAfterId(String networkId, Long id) {
        return networkMessageRepository.findByMillisGreaterThanAndNetworkId(id, networkId);
    }

    public void deleteNetworkMessages(Profile username) {
        var networkMember = new NetworkMember();
        networkMember.setMemberId(username.getUsername());
        networkMember.setMemberName(username.getName());
        networkMember.setMemberProfilePicturePath(username.getProfilePicturePath());

        networkMessageRepository.deleteAllBySenderId(networkMember);
    }

    public List<Profile> getMeetNewPeople(String sender) {
        var profile = profileService.findByUsername(sender);
        var friends = new ArrayList<>(profile.getFriends());
        Collections.shuffle(friends);
        var friendsArray = new ArrayList<Profile>();

        for (var friend : friends) {
            if (friendsArray.size() >= 5) {
                break;
            }
            var friendsOfFriends = new ArrayList<>(profileService.findByUsername(friend.getMemberId()).getFriends());
            Collections.shuffle(friendsOfFriends);
            for (var friendOfFriend : friendsOfFriends) {
                if (friendsArray.size() >= 5) {
                    break;
                }
                if (friendOfFriend.getMemberId().equals(sender))
                    continue;
                if (friends.stream().anyMatch(f -> f.getMemberId().equals(friendOfFriend.getMemberId())))
                    continue;
                friendsArray.add(profileService.findByUsername(friendOfFriend.getMemberId()));
            }
        }
        return friendsArray;
    }

    public List<Network> getFriendsNetworks(Profile profile) {
        var networks = new ArrayList<Network>();
        var friends = new ArrayList<>(profile.getFriends());
        Collections.shuffle(friends);
        for (var friend : friends) {
            if (networks.size() >= 9) {
                break;
            }
            var friendNetworks = networkRepository.findTop3ByCreatorId(friend.getMemberId());
            for (Network friendNetwork : friendNetworks) {
                if (friendNetwork.isPrivate()) {
                    if (friendNetwork.getMembers().stream().noneMatch(u -> u.getMemberId().equals(profile.getUsername()))) {
                        continue;
                    }
                }
                var networkMember = new NetworkMember();
                networkMember.setMemberName(profile.getName());
                networkMember.setMemberProfilePicturePath(profile.getProfilePicturePath());
                networkMember.setMemberId(profile.getUsername());

                if (!networks.contains(friendNetwork) && !friendNetwork.getMembers().contains(networkMember)) {
                    networks.add(friendNetwork);
                }
            }
        }
        return networks;
    }
}
