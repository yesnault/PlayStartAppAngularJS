package models;

import play.data.validation.Constraints;
import play.db.ebean.Model;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import java.util.List;

@Entity
@Table
public class User extends Model {

    @Id
    public Long id;

    @Constraints.Required
    public String username;


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

    public static User update(Long id, String username) {
        User user = find.byId(id);
        user.username = username;
        user.save();
        return user;
    }

    public static User create(String username) {
        User user = new User(username);
        user.save();
        return user;
    }
}