package controllers;

import com.fasterxml.jackson.databind.ObjectWriter;
import models.monitoring.MetricsConfiguration;
import play.mvc.Controller;
import play.mvc.Result;

import java.io.IOException;
import java.io.StringWriter;

/**
 * User: yesnault
 * Date: 15/11/13
 */
public class Metrics extends Controller {

    public static Result metrics() throws IOException {
        ObjectWriter writer = MetricsConfiguration.getInstance().getMapper().writerWithDefaultPrettyPrinter();
        StringWriter stringWriter = new StringWriter();
        writer.writeValue(stringWriter, MetricsConfiguration.getInstance().getRegistry());
        return ok(stringWriter.toString()).as("application/json");// withHeaders("Cache-Control" -> "must-revalidate,no-cache,no-store");
    }

    public static Result gc() {
        Runtime.getRuntime().gc();
        return ok("Done");
    }
}
