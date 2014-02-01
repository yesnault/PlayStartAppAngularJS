package models.monitoring

/**
 * User: yesnault
 * Date: 15/11/13
 */
import play.api.mvc._
import play.api.http.Status
import com.codahale.metrics._
import com.codahale.metrics.MetricRegistry._
import play.api.libs.concurrent.Execution.Implicits._


class MetricsFilter extends EssentialFilter {

  val registry: MetricRegistry = MetricsConfiguration.getInstance().getRegistry()

  val knownStatuses = Seq(Status.OK, Status.BAD_REQUEST, Status.FORBIDDEN, Status.NOT_FOUND,
    Status.CREATED, Status.TEMPORARY_REDIRECT, Status.INTERNAL_SERVER_ERROR, Status.NOT_MODIFIED)

  lazy val requestsTimer: Timer = registry.timer(name(classOf[MetricsFilter], "requestTimer"))
  lazy val activeRequests: Counter = registry.counter(name(classOf[MetricsFilter], "activeRequests"))
  lazy val statusCodes: Map[Int, Meter] = knownStatuses.map (s => s -> registry.meter(name(classOf[MetricsFilter], s.toString))).toMap
  lazy val otherStatuses: Meter = registry.meter(name(classOf[MetricsFilter], "other"))

  def apply(next: EssentialAction) = new EssentialAction {
    def apply(rh: RequestHeader) = {
      val context = requestsTimer.time()

      def logCompleted(result: SimpleResult): SimpleResult = {
        activeRequests.dec()
        context.stop()
        statusCodes.getOrElse(result.header.status, otherStatuses).mark()
        result
      }

      activeRequests.inc()
      next(rh).map(logCompleted)
    }
  }
}

