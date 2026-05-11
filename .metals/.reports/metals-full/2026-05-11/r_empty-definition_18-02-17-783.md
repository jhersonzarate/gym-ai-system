error id: file:///C:/Users/Jherson%20Silva/gym-ai-system/backend/scala/main.scala:isEmpty.
file:///C:/Users/Jherson%20Silva/gym-ai-system/backend/scala/main.scala
empty definition using pc, found symbol in pc: isEmpty.
empty definition using semanticdb
empty definition using fallback
non-local guesses:
	 -play/api/libs/json/input/trim/isEmpty.
	 -play/api/libs/json/input/trim/isEmpty#
	 -play/api/libs/json/input/trim/isEmpty().
	 -RutinaGenerator.input.trim.isEmpty.
	 -RutinaGenerator.input.trim.isEmpty#
	 -RutinaGenerator.input.trim.isEmpty().
	 -input/trim/isEmpty.
	 -input/trim/isEmpty#
	 -input/trim/isEmpty().
	 -scala/Predef.input.trim.isEmpty.
	 -scala/Predef.input.trim.isEmpty#
	 -scala/Predef.input.trim.isEmpty().
offset: 379
uri: file:///C:/Users/Jherson%20Silva/gym-ai-system/backend/scala/main.scala
text:
```scala
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

  if (input.trim.i@@sEmpty) {
    System.err.println("[ERROR] No se recibió input JSON por stdin.")
    System.exit(1)
  }

  val json   = Json.parse(input)
  val rutina = RutinaGenerator.generar(json)

  import RutinaGenerator._
  println(Json.toJson(rutina).toString())
}
```


#### Short summary: 

empty definition using pc, found symbol in pc: isEmpty.