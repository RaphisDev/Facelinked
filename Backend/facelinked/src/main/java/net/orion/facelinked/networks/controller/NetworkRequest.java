package net.orion.facelinked.networks.controller;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import net.orion.facelinked.networks.NetworkMember;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NetworkRequest {
    @NotEmpty
    private String name;
    private String description;
    private String creatorId;
    @NotEmpty
    private boolean isPrivate;
    private List<NetworkMember> members;
}
