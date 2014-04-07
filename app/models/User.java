package models;

import com.avaje.ebean.Ebean;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import play.Logger;
import play.data.validation.Constraints;
import play.db.ebean.Model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Entity
@Table
public class User extends Model {

    @Id
    public Long id;

    @Constraints.Required
    public String username;

    public String authToken;

    @Column(length = 256, nullable = true)
    public String role;

    public void setRole(Role role) {
        this.role = role.value();
    }

    private static Model.Finder<Long, User> find = new Model.Finder<Long, User>(
            Long.class, User.class
    );

    public User(String username) {
        this.username = username;
    }

    public static List<User> findAll() {
        return find.all();
    }

    public static User findById(Long id) {
        return find.byId(id);
    }

    public static void delete(Long id) {
        find.ref(id).delete();
    }

    public static User update(Long id, String username, String role) {
        User user = find.byId(id);
        user.username = username;
        user.setRole(Role.valueOf(role));
        user.save();
        return user;
    }

    public static User create(String username) {
        User user = new User(username);
        user.save();
        return user;
    }

    public void deleteAuthToken() {
        authToken = null;
        save();
    }

    public static int countAll() {
        return Ebean.createSqlQuery("select count(*) as count from user").findUnique().getInteger("count");
    }

    public static User connect(String login, String password) {
        User u = find.where().eq("username", login).findUnique();

        if (u == null) {
            Logger.info("User {} does not exist in database, create him", login);
            u = new User(login);
            if (countAll() == 0) {
                u.setRole(Role.ADMIN);
            } else {
                u.setRole(Role.CREATED);
            }
            Logger.info("This is the first user in DB => admin");

        } else {
            Logger.info("User {} already exist in database", login);
        }

        u.authToken = UUID.randomUUID().toString();

        u.save();

        return u;
    }

    public static User findByAuthToken(String authToken) {
        if (authToken == null) {
            return null;
        }

        try {
            return find.where().eq("authToken", authToken).findUnique();
        } catch (Exception e) {
            Logger.warn("Exception while search user with authToken {}", authToken);
            return null;
        }
    }
}