package models.monitoring;

import com.codahale.metrics.MetricRegistry;
import com.codahale.metrics.SharedMetricRegistries;
import com.codahale.metrics.json.MetricsModule;
import com.codahale.metrics.jvm.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.lang.management.ManagementFactory;
import java.util.concurrent.TimeUnit;

/**
 * User: yesnault
 * Date: 15/11/13
 */
public class MetricsConfiguration   {
    private static final Logger LOGGER = LoggerFactory.getLogger(MetricsConfiguration.class);

    private ObjectMapper mapper = new ObjectMapper();

    private String registryName = "default";

    /** Constructor private */
    private MetricsConfiguration()
    {}

    private static MetricsConfiguration INSTANCE = null;

    public static MetricsConfiguration getInstance()
    {
        if (INSTANCE == null)
        { 	INSTANCE = new MetricsConfiguration();
        }
        return INSTANCE;
    }

    public void init() {
        LOGGER.debug("Registring JVM gauges");

        getRegistry().register("jvm.memory", new MemoryUsageGaugeSet());
        getRegistry().register("jvm.garbage", new GarbageCollectorMetricSet());
        getRegistry().register("jvm.threads", new ThreadStatesGaugeSet());
        getRegistry().register("jvm.files", new FileDescriptorRatioGauge());
        getRegistry().register("jvm.buffers", new BufferPoolMetricSet(ManagementFactory.getPlatformMBeanServer()));

       MetricsModule module = new MetricsModule(TimeUnit.SECONDS, TimeUnit.SECONDS, false);
       mapper.registerModule(module);
    }

    public void stop() {
        SharedMetricRegistries.remove(registryName);
    }

    public ObjectMapper getMapper() {
        return mapper;
    }

    public MetricRegistry getRegistry() {
        return SharedMetricRegistries.getOrCreate(registryName);
    }
}
