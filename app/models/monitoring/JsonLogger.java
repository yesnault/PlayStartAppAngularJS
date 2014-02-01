package models.monitoring;

import ch.qos.logback.classic.Logger;

/**
 * User: yesnault
 * Date: 26/11/13
 */
public class JsonLogger {
    public String name, level;

    public JsonLogger(Logger logger) {
        this.name = logger.getName();
        this.level = logger.getEffectiveLevel().toString();
    }

}
