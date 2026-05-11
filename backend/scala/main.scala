// backend/scala/main.scala
// CORRECCIÓN: el mainClass en build.sbt apunta a "gymexpert.Main"
// así que el objeto debe vivir en el package gymexpert.
package gymexpert

import play.api.libs.json._
import scala.io.StdIn

object Main extends App {
  val input = Iterator.continually(StdIn.readLine())
    .takeWhile(_ != null)
    .mkString("\n")

  if (input.trim.isEmpty) {
    System.err.println("[ERROR] No se recibió input JSON por stdin.")
    System.exit(1)
  }

  val json   = Json.parse(input)
  val rutina = RutinaGenerator.generar(json)

  import RutinaGenerator._
  println(Json.toJson(rutina).toString())
}