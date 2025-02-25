package net.orion.facelinked.auth;

import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBAttribute;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBHashKey;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBIgnore;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBTable;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@DynamoDBTable(tableName = "User")
public class User implements UserDetails
{
    @DynamoDBAttribute(attributeName = "email")
    String email;

    String userName;
    @DynamoDBAttribute(attributeName = "name")
    String name;
    @DynamoDBAttribute(attributeName = "password")
    String password;
    @DynamoDBAttribute(attributeName = "token")
    List<String> deviceTokens;

    @DynamoDBIgnore
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("User"));
    }

    @DynamoDBIgnore
    @Override
    public String getUsername() {
        return email;
    }

    @DynamoDBHashKey
    public String getUserName() {
        return userName;
    }

    @DynamoDBIgnore
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @DynamoDBIgnore
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @DynamoDBIgnore
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @DynamoDBIgnore
    @Override
    public boolean isEnabled() {
        return true;
    }
}
