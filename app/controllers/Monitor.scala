package controllers

import
play.api.mvc._
import play.api.libs.json.Json
import play.api.libs.iteratee._
import java.util.Date
import ch.qos.logback.classic.spi.ILoggingEvent
import java.text.SimpleDateFormat

object Monitor extends Controller {

  private val logFile = play.api.Play.current.configuration.getString("app.log.file").get

  def downloadLogFile = Action {
    Ok.sendFile(new java.io.File(logFile))
  }

  def socket = WebSocket.using[String] {
    request =>
      val in = Iteratee.ignore[String]
      val out = Streams.liveEnumerator
      (in, out)
  }

  def logfile = Action {
    Ok(Json.toJson(logFile)).as(JSON)
  }

}

object Streams {

  private val dateFormat = new SimpleDateFormat("HH:mm:ss.SSSS")

  val (liveEnumerator, channelLogs) = Concurrent.broadcast[String]

  def pushLog(event: ILoggingEvent) {
    channelLogs.push(views.html.monitor.log.render(dateFormat.format(new Date(event.getTimeStamp)), event).toString)
  }
}

