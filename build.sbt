name := "PlayStartAppAngularJS"

version := "1.0-SNAPSHOT"

libraryDependencies ++= Seq(
  jdbc,
  javaEbean,
  cache,
  "com.codahale.metrics" % "metrics-core" % "3.0.1",
  "com.codahale.metrics" % "metrics-jvm" % "3.0.1",
  "com.codahale.metrics" % "metrics-json" % "3.0.1",
  filters
)

play.Project.playJavaSettings
