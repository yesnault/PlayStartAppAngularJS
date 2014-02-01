package controllers;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.LoggerContext;
import models.monitoring.JsonLogger;
import org.slf4j.LoggerFactory;
import play.libs.Json;
import play.mvc.Controller;
import play.mvc.Result;

import java.util.ArrayList;
import java.util.List;

/**
 * User: yesnault
 * Date: 26/11/13
 */
public class Logs extends Controller {

    public static Result logs() {
        LoggerContext context = (LoggerContext) LoggerFactory.getILoggerFactory();

        List<JsonLogger> loggers = new ArrayList<JsonLogger>();
        for (Logger logger : context.getLoggerList()) {
            loggers.add(new JsonLogger(logger));
        }
        return ok(Json.toJson(loggers)).as("application/json");
    }

    //RequestMapping(value = "/logs/change/{loggerName}/{newLevel}", method = RequestMethod.GET)
    public static Result changeLevel(String loggerName, String newLevel) {
        LoggerContext context = (LoggerContext) LoggerFactory.getILoggerFactory();
        context.getLogger(loggerName).setLevel(Level.valueOf(newLevel));
        return ok("changelevel ok");
    }


}
