package net.facelinked.user.repository;

import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;
import org.springframework.util.Assert;

import java.io.File;
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

    public void create(User user, File profilePicture)
    {
        //Upload profilPicture to AWS S3 and use path of that for the below saving in database

        var updated = jdbcClient.sql(
                "INSERT INTO Profile (username, name, profilePicturePath, age, schoolName, grade, classIdentifier, " +
                "inRelationship, " +
                "partner, location, status) " +
                "values (?," +
                " ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").params(List.of(user.username(), user.name(), "profilePicture.path" ,
                                                           user.age(),
                                                           user.schoolName(), user.schoolClass().grade(),
                                                           user.schoolClass().classIdentifier(),
                                                           user.inRelationship(), user.partner(),
                                                           user.location(), user.status().toString())).update();

        Assert.state(updated == 1, "Cannot insert user");
    }

    public void update(User user)
    {
       //Do with GraphQL
    }

    public void delete(String userName)
    {
        var deleted = jdbcClient.sql("DELETE FROM Profile WHERE username = :username").param("username",
                                                                                          userName).update();

        Assert.state(deleted == 1, "Cannot delete user");
    }

    public User findByUsername(String username)
    {
        var optionalUser = jdbcClient.sql("SELECT * FROM Profile WHERE username = :username").param("username",
                                                                                                 username).query(new ProfileRowMapper()).optional();
        if (optionalUser.isPresent()) return optionalUser.get();
        throw new RuntimeException("User not found");
    }

    public List<User> findBySchoolClass(Class schoolClass)
    {
        return jdbcClient.sql("SELECT * FROM Profile WHERE grade = :grade && classIdentifier = :classIdentifier").params(
                "grade", schoolClass.grade(), "classIdentifier", schoolClass.classIdentifier()).query(new ProfileRowMapper()).list();
    }

    public List<User> findByStatus(boolean online)
    {
        return jdbcClient.sql("SELECT * FROM Profile WHERE status = :status").params("status", online).query(new ProfileRowMapper()).list();
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
                    new Class(rs.getInt("grade"), rs.getString("classIdentifier").charAt(0)),
                    rs.getBoolean("inRelationship"),
                    rs.getString("partner"),
                    rs.getString("location"),
                    Status.valueOf(rs.getString("status").toUpperCase())
            );
        }
    }
}