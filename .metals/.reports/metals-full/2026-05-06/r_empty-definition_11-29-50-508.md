error id: file:///C:/Users/Jherson%20Silva/gym-ai-system/backend/scala/main.scala:Json.
file:///C:/Users/Jherson%20Silva/gym-ai-system/backend/scala/main.scala
empty definition using pc, found symbol in pc: 
empty definition using semanticdb
empty definition using fallback
non-local guesses:
	 -play/api/libs/json/Json.
	 -RutinaGenerator.Json.
	 -Json.
	 -scala/Predef.Json.
offset: 263
uri: file:///C:/Users/Jherson%20Silva/gym-ai-system/backend/scala/main.scala
text:
```scala
// backend/scala/src/main/scala/Main.scala
package gymexpert

import play.api.libs.json._
import scala.io.StdIn

object Main extends App {
  val input = Iterator.continually(StdIn.readLine())
    .takeWhile(_ != null)
    .mkString("\n")

  val json = @@Json.parse(input)
  val rutina = RutinaGenerator.generar(json)

  import RutinaGenerator._
  println(Json.toJson(rutina).toString())
}
```


#### Short summary: 

empty definition using pc, found symbol in pc: 