// backend/scala/src/main/scala/Main.scala
package gymexpert

import play.api.libs.json._
import scala.io.StdIn

object Main extends App {
  val input = Iterator.continually(StdIn.readLine())
    .takeWhile(_ != null)
    .mkString("\n")

  val json = Json.parse(input)
  val rutina = RutinaGenerator.generar(json)

  import RutinaGenerator._
  println(Json.toJson(rutina).toString())
}