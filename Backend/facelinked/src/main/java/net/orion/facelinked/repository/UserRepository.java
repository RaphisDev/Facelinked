package net.orion.facelinked.repository;

import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;
import org.springframework.util.Assert;

import java.io.File;
import java.lang.Class;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

@Repository
public class UserRepository
{
    private final JdbcClient jdbcClient;

    public UserRepository(JdbcClient jdbcClient)
    {
        this.jdbcClient = jdbcClient;
    }

    public void create(User user)
    {
        //Upload profilPicture to AWS S3 and use path of that for the below saving in database

        var updatedUser = jdbcClient.sql(
                "INSERT INTO UserSchema (username, name, profilePicturePath) " +
                "values (?,?,?)").params(List.of(user.username(), user.name(), "profilePicture.path")).update();

        var updatedProfile = jdbcClient.sql(
                "INSERT INTO ProfileSchema (age, schoolName, inRelationship, partner, location) values (?,?,?,?,?,?)").params(List.of(user.age(),
                user.schoolName(),
                user.inRelationship(), user.partner(),
                user.location())).update();

        Assert.state(updatedUser == 1, "Cannot insert user");
        Assert.state(updatedProfile == 1, "Cannot insert profile");
    }

    public void update(User user)
    {
       //Do with GraphQL
    }

    public void delete(String userName)
    {
        var deletedUser = jdbcClient.sql("DELETE FROM UserSchema WHERE username = :username").param("username",
                                                                                          userName).update();
        var deletedProfile = jdbcClient.sql("DELETE FROM ProfileSchema WHERE username = :username").param("username", userName).update();

        //have to delete Profile as well??

        Assert.state(deletedUser == 1, "Cannot delete user");
        Assert.state(deletedProfile == 1, "Cannot delete profile");
    }

    public User findByUsername(String username)
    {
        var optionalUser = jdbcClient.sql("SELECT * FROM UserSchema, ProfileSchema WHERE username = :username AND UserSchema.username=ProfileSchema.username").param("username",
                                                                                                 username).query(new ProfileRowMapper()).optional();
        if (optionalUser.isPresent()) return optionalUser.get();
        throw new RuntimeException("User not found");
    }

    private static class ProfileRowMapper implements RowMapper<User> {
        @Override
        public User mapRow(ResultSet rs, int rowNum) throws SQLException
        {
            return new User(
                    rs.getString("username"),
                    rs.getString("name"),
                    rs.getString("profilePicturePath"),
                    rs.getInt("age"),
                    rs.getString("schoolName"),
                    rs.getBoolean("inRelationship"),
                    rs.getString("partner"),
                    rs.getString("location")
            );
        }
    }
}