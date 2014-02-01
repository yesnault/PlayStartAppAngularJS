import models.monitoring.MetricsConfiguration;
import models.monitoring.MetricsFilter;
import play.Application;
import play.GlobalSettings;
import play.Logger;
import play.api.mvc.EssentialFilter;

public class Global extends GlobalSettings {

    public void onStart(Application app) {
        Logger.info("Application has started");
        MetricsConfiguration.getInstance().init();
    }

    public void onStop(Application app) {
        Logger.info("Application shutdown...");
        MetricsConfiguration.getInstance().stop();
    }

    @SuppressWarnings({"rawtypes", "unchecked"})
    @Override
    public <T extends EssentialFilter> Class<T>[] filters() {
        Class[] filters = {MetricsFilter.class};
        return filters;
    }
}