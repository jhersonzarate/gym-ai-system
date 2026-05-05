// backend/scala/src/main/scala/EjercicioRepository.scala
package gymexpert

case class Ejercicio(
  nombre: String,
  grupo: String,
  equipo: String,
  nivelMinimo: String   // principiante | intermedio | avanzado
)

object EjercicioRepository {

  val todos: List[Ejercicio] = List(
    // ─── PECHO ───
    Ejercicio("Press de banca plano",         "pecho",    "barra",         "principiante"),
    Ejercicio("Press de banca inclinado",     "pecho",    "mancuernas",    "principiante"),
    Ejercicio("Aperturas con mancuernas",     "pecho",    "mancuernas",    "principiante"),
    Ejercicio("Fondos en paralelas",          "pecho",    "peso_corporal", "intermedio"),
    Ejercicio("Aperturas en polea cruzada",   "pecho",    "polea",         "intermedio"),
    Ejercicio("Press de banca declinado",     "pecho",    "barra",         "avanzado"),

    // ─── ESPALDA ───
    Ejercicio("Jalón al pecho agarre ancho",  "espalda",  "polea",         "principiante"),
    Ejercicio("Remo con mancuerna",           "espalda",  "mancuernas",    "principiante"),
    Ejercicio("Remo con barra",               "espalda",  "barra",         "intermedio"),
    Ejercicio("Dominadas",                    "espalda",  "peso_corporal", "intermedio"),
    Ejercicio("Peso muerto convencional",     "espalda",  "barra",         "avanzado"),
    Ejercicio("Remo en máquina Hammer",       "espalda",  "maquina",       "principiante"),

    // ─── HOMBROS ───
    Ejercicio("Press con mancuernas sentado", "hombros",  "mancuernas",    "principiante"),
    Ejercicio("Elevaciones laterales",        "hombros",  "mancuernas",    "principiante"),
    Ejercicio("Press militar con barra",      "hombros",  "barra",         "intermedio"),
    Ejercicio("Face pull en polea",           "hombros",  "polea",         "intermedio"),
    Ejercicio("Arnold press",                 "hombros",  "mancuernas",    "avanzado"),

    // ─── BÍCEPS ───
    Ejercicio("Curl con mancuernas",          "biceps",   "mancuernas",    "principiante"),
    Ejercicio("Curl en polea baja",           "biceps",   "polea",         "principiante"),
    Ejercicio("Curl con barra recta",         "biceps",   "barra",         "intermedio"),
    Ejercicio("Curl martillo",                "biceps",   "mancuernas",    "principiante"),
    Ejercicio("Curl concentrado",             "biceps",   "mancuernas",    "intermedio"),

    // ─── TRÍCEPS ───
    Ejercicio("Extensión en polea alta",      "triceps",  "polea",         "principiante"),
    Ejercicio("Press francés",                "triceps",  "barra",         "intermedio"),
    Ejercicio("Fondos en banco",              "triceps",  "peso_corporal", "principiante"),
    Ejercicio("Skull crusher",                "triceps",  "barra",         "avanzado"),
    Ejercicio("Press cerrado",                "triceps",  "barra",         "intermedio"),

    // ─── PIERNAS ───
    Ejercicio("Sentadilla con barra",         "piernas",  "barra",         "principiante"),
    Ejercicio("Prensa de piernas",            "piernas",  "maquina",       "principiante"),
    Ejercicio("Extensión de cuádriceps",      "piernas",  "maquina",       "principiante"),
    Ejercicio("Curl femoral tumbado",         "piernas",  "maquina",       "principiante"),
    Ejercicio("Peso muerto rumano",           "piernas",  "barra",         "intermedio"),
    Ejercicio("Sentadilla búlgara",           "piernas",  "mancuernas",    "avanzado"),
    Ejercicio("Hip thrust con barra",         "piernas",  "barra",         "intermedio"),
    Ejercicio("Elevación de talones",         "piernas",  "maquina",       "principiante"),
    Ejercicio("Zancadas con mancuernas",      "piernas",  "mancuernas",    "principiante"),

    // ─── CORE ───
    Ejercicio("Plancha abdominal",            "core",     "peso_corporal", "principiante"),
    Ejercicio("Crunch en polea",              "core",     "polea",         "principiante"),
    Ejercicio("Elevación de piernas colgado", "core",     "barra",         "intermedio"),
    Ejercicio("Rueda abdominal",              "core",     "rueda",         "avanzado"),
    Ejercicio("Rotación con cable",           "core",     "polea",         "intermedio"),

    // ─── CARDIO ───
    Ejercicio("Caminata inclinada",           "cardio",   "cinta",         "principiante"),
    Ejercicio("Bicicleta estática",           "cardio",   "bicicleta",     "principiante"),
    Ejercicio("Elíptica",                     "cardio",   "eliptica",      "principiante"),
    Ejercicio("HIIT en cinta",                "cardio",   "cinta",         "intermedio"),
    Ejercicio("Salto a la cuerda",            "cardio",   "cuerda",        "intermedio")
  )

  def porGrupo(grupo: String): List[Ejercicio] =
    todos.filter(_.grupo == grupo)

  def porNivel(nivel: String): List[Ejercicio] = {
    val niveles = nivel match {
      case "principiante" => Set("principiante")
      case "intermedio"   => Set("principiante", "intermedio")
      case "avanzado"     => Set("principiante", "intermedio", "avanzado")
      case _              => Set("principiante")
    }
    todos.filter(e => niveles.contains(e.nivelMinimo))
  }

  def porGrupoYNivel(grupo: String, nivel: String): List[Ejercicio] =
    porGrupo(grupo).intersect(porNivel(nivel))
}