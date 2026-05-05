// backend/scala/build.sbt
name := "gym-rutina-generator"
version := "1.0.0"
scalaVersion := "2.13.12"

libraryDependencies ++= Seq(
  "com.typesafe.play" %% "play-json" % "2.9.4"
)

assembly / assemblyJarName := "gym-rutina-generator.jar"
assembly / mainClass := Some("Main")

assemblyMergeStrategy in assembly := {
  case PathList("META-INF", _*) => MergeStrategy.discard
  case _                        => MergeStrategy.first
}