package controllers;

import com.fasterxml.jackson.databind.node.ObjectNode;
import models.User;
import play.data.Form;
import play.data.validation.Constraints;
import play.libs.F;
import play.libs.Json;
import play.mvc.*;

import static play.mvc.Controller.response;

public class SecurityController extends Action.Simple {

    public final static String AUTH_TOKEN_HEADER = "X-XSRF-TOKEN";
    public static final String AUTH_TOKEN_COOKIE_KEY = "XSRF-TOKEN";

    public F.Promise<SimpleResult> call(Http.Context ctx) throws Throwable {
        String[] authTokenHeaderValues = ctx.request().headers().get(AUTH_TOKEN_HEADER);
        if ((authTokenHeaderValues != null) && (authTokenHeaderValues.length == 1) && (authTokenHeaderValues[0] != null)) {
            User user = models.User.findByAuthToken(authTokenHeaderValues[0]);
            if (user != null) {
                ctx.args.put("user", user);
                return delegate.call(ctx);
            }
        }
        return F.Promise.pure((SimpleResult) unauthorized("unauthorized"));
    }

    @With(SecurityController.class)
    public static Result ping() {
        return ok(Json.toJson(getUser()));
    }

    public static User getUser() {
        return (User) Http.Context.current().args.get("user");
    }

    // returns an authToken
    public static Result login() {
        Form<Login> loginForm = Form.form(Login.class).bindFromRequest();

        if (loginForm.hasErrors()) {
            return badRequest(loginForm.errorsAsJson());
        }

        Login login = loginForm.get();

        User user = User.connect(login.username, login.password);

        if (user == null) {
            return unauthorized();
        } else {
            ObjectNode authTokenJson = Json.newObject();
            authTokenJson.put(AUTH_TOKEN_COOKIE_KEY, user.authToken);
            response().setCookie(AUTH_TOKEN_COOKIE_KEY, user.authToken);
            return ok(Json.toJson(user));
        }
    }

    @With(SecurityController.class)
    public static Result logout() {
        response().discardCookie(AUTH_TOKEN_COOKIE_KEY);
        getUser().deleteAuthToken();
        return redirect("/");
    }

    /**
     * Form Login
     */
    public static class Login {
        @Constraints.Required
        public String username;

        @Constraints.Required
        public String password;
    }

}
