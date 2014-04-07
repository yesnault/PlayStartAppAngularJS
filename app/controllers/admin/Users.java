package controllers.admin;

import com.fasterxml.jackson.databind.node.ObjectNode;
import models.Role;
import models.User;
import play.libs.Json;
import play.mvc.BodyParser;
import play.mvc.Controller;
import play.mvc.Result;

import java.util.List;

import static play.data.Form.form;

public class Users extends Controller {


    public static Result findAll() {
        return ok(Json.toJson(User.findAll()));
    }

    public static Result listDatatable() {
        List<User> data = User.findAll();

        ObjectNode result = Json.newObject();
        result.put("iTotalRecords", Json.toJson(data.size()));
        result.put("iTotalDisplayRecords", Json.toJson(data.size()));
        result.put("data", Json.toJson(data));

        return ok(result);
    }

    @BodyParser.Of(BodyParser.Json.class)
    public static Result edit(Long id) {
        return ok(Json.toJson(User.findById(id)));
    }

    @BodyParser.Of(BodyParser.Json.class)
    public static Result save(Long id) {
        User user;

        try {
            if (id < 0) {
                user = User.create(
                        form().bindFromRequest().get("username")
                );
            } else {
                user = User.update(id,
                        form().bindFromRequest().get("username"),
                        form().bindFromRequest().get("role")
                );
            }

            return ok(Json.toJson(user));
        } catch (Exception e) {
            return badRequest("Detected error:" + e.getMessage());
        }

    }

    @BodyParser.Of(BodyParser.Json.class)
    public static Result delete(Long id) {
        User.delete(id);
        return ok("user with id " + id + " deleted");
    }

    public static Result listRoles() {
         return ok(Json.toJson(Role.findAll()));
    }
}

