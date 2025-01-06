package net.orion.facelinked.networks.controller;

import lombok.Builder;
import lombok.Data;
import net.orion.facelinked.networks.NetworkMember;

import java.util.List;

@Data
@Builder
public class NetworkResponse {
    private String id;
    private List<NetworkMember> members;
    private String creatorId;
}
