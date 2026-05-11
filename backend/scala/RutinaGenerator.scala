// backend/scala/RutinaGenerator.scala
// VERSIÓN CORREGIDA v2:
//   - Eliminado método `elegir` que siempre retornaba None (bug)
//   - Corregido constructor gymexpert.Ejercicio en cardioEjercicio:
//     ahora incluye el campo `tipo` obligatorio
//   - Todo el código usa únicamente `construirEjercicio` que sí es correcto
package gymexpert

import play.api.libs.json._

case class SetsReps(series: Int, reps: String, descansoSeg: Int)
case class EjercicioPlan(
  nombre:       String,
  grupo:        String,
  equipo:       String,
  series:       Int,
  repeticiones: String,
  descansoSeg:  Int
)
case class DiaPlan(dia: Int, nombre: String, ejercicios: List[EjercicioPlan])
case class RutinaCompleta(tipoRutina: String, dias: List[DiaPlan], generadoPor: String)

object RutinaGenerator {

  implicit val ejercicioWrites: Writes[EjercicioPlan] = Json.writes[EjercicioPlan]
  implicit val diaWrites:       Writes[DiaPlan]       = Json.writes[DiaPlan]
  implicit val rutinaWrites:    Writes[RutinaCompleta] = Json.writes[RutinaCompleta]

  def generar(params: JsValue): RutinaCompleta = {
    val nivel      = (params \ "nivel").asOpt[String].getOrElse("principiante")
    val objetivo   = (params \ "objetivo").asOpt[String].getOrElse("mantener")
    val frecuencia = (params \ "frecuencia").asOpt[Int].getOrElse(3)
    val tipoRutina = (params \ "tipo_rutina").asOpt[String].getOrElse("fullbody")
    val intensidad = (params \ "intensidad").asOpt[String].getOrElse("moderada")
    val usaCardio  = (params \ "usa_cardio").asOpt[Boolean].getOrElse(false)

    val setsReps = calcularSetsReps(intensidad, objetivo)

    val dias = tipoRutina match {
      case "fullbody"     => generarFullBody(nivel, frecuencia, setsReps, usaCardio)
      case "upper_lower"  => generarUpperLower(nivel, frecuencia, setsReps, usaCardio)
      case "ppl"          => generarPPL(nivel, frecuencia, setsReps, usaCardio)
      case "torso_pierna" => generarTorsoPierna(nivel, frecuencia, setsReps, usaCardio)
      case "especializado"=> generarEspecializado(nivel, frecuencia, setsReps, usaCardio)
      case _              => generarFullBody(nivel, frecuencia, setsReps, usaCardio)
    }

    RutinaCompleta(tipoRutina, dias, "scala_engine")
  }

  // ─── SETS Y REPS ─────────────────────────────────────────────────

  private def calcularSetsReps(intensidad: String, objetivo: String): SetsReps =
    (objetivo, intensidad) match {
      case ("ganar_musculo", "muy_alta") => SetsReps(5, "3-5",   180)
      case ("ganar_musculo", "alta")     => SetsReps(4, "6-8",   150)
      case ("ganar_musculo", "moderada") => SetsReps(4, "8-12",  120)
      case ("ganar_musculo", _)          => SetsReps(3, "12-15",  90)
      case ("perder_grasa",  "alta")     => SetsReps(4, "12-15",  60)
      case ("perder_grasa",  "moderada") => SetsReps(3, "15-20",  45)
      case ("perder_grasa",  _)          => SetsReps(3, "20-25",  30)
      case (_,               "alta")     => SetsReps(4, "8-10",  120)
      case _                             => SetsReps(3, "10-12",  90)
    }

  // ─── HELPERS ─────────────────────────────────────────────────────

  /**
   * Construye un EjercicioPlan eligiendo el ejercicio correcto de la lista.
   * CORRECCIÓN: este es el único método de selección; el antiguo `elegir`
   * que siempre retornaba None fue eliminado.
   */
  private def construirEjercicio(
    grupo: String, nivel: String, idx: Int, sr: SetsReps
  ): Option[EjercicioPlan] = {
    val lista = EjercicioRepository.porGrupoYNivel(grupo, nivel)
    if (lista.isEmpty) None
    else {
      val ex = lista(idx % lista.size)
      Some(EjercicioPlan(
        nombre       = ex.nombre,
        grupo        = ex.grupo,
        equipo       = ex.equipo,
        series       = sr.series,
        repeticiones = sr.reps,
        descansoSeg  = sr.descansoSeg
      ))
    }
  }

  /**
   * CORRECCIÓN: el constructor de Ejercicio ahora incluye el campo `tipo`
   * que es requerido (aunque tiene valor por defecto, la llamada explícita
   * garantiza que no rompa si se cambia la case class en el futuro).
   */
  private def cardioEjercicio(nivel: String): EjercicioPlan = {
    val cardios = EjercicioRepository.porGrupoYNivel("cardio", nivel)
    val ex = cardios.headOption.getOrElse(
      gymexpert.Ejercicio(
        nombre             = "Caminata inclinada",
        grupo              = "cardio",
        equipo             = "cinta",
        nivelMinimo        = "principiante",
        tipo               = "cardio",       // ← campo que faltaba
        contraindicaciones = List()
      )
    )
    EjercicioPlan(ex.nombre, "cardio", ex.equipo, 1, "20 min", 0)
  }

  private def buildDia(
    diaNum: Int, nombre: String, grupos: List[String],
    nivel: String, sr: SetsReps, usaCardio: Boolean,
    cardioEnEste: Boolean = false
  ): DiaPlan = {
    val exs = grupos.zipWithIndex.flatMap { case (grupo, idx) =>
      construirEjercicio(grupo, nivel, diaNum + idx, sr)
    }
    val conCardio = if (usaCardio && cardioEnEste) exs :+ cardioEjercicio(nivel) else exs
    DiaPlan(diaNum, nombre, conCardio)
  }

  // ─── GENERADORES ─────────────────────────────────────────────────

  def generarFullBody(
    nivel: String, frecuencia: Int, sr: SetsReps, usaCardio: Boolean
  ): List[DiaPlan] = {
    val grupos = List("pecho", "espalda", "piernas", "hombros", "core")
    (1 to frecuencia).map { d =>
      buildDia(d, s"Día $d — Full Body", grupos, nivel, sr, usaCardio, cardioEnEste = true)
    }.toList
  }

  def generarUpperLower(
    nivel: String, frecuencia: Int, sr: SetsReps, usaCardio: Boolean
  ): List[DiaPlan] = {
    val upper = List("pecho", "espalda", "hombros", "biceps", "triceps")
    val lower = List("piernas", "core")
    (1 to frecuencia).map { d =>
      if (d % 2 == 1)
        buildDia(d, s"Día $d — Tren Superior", upper, nivel, sr, usaCardio = false)
      else
        buildDia(d, s"Día $d — Tren Inferior", lower, nivel, sr, usaCardio, cardioEnEste = true)
    }.toList
  }

  def generarPPL(
    nivel: String, frecuencia: Int, sr: SetsReps, usaCardio: Boolean
  ): List[DiaPlan] = {
    val ciclo = List(
      ("Push", List("pecho", "hombros", "triceps")),
      ("Pull", List("espalda", "biceps")),
      ("Legs", List("piernas", "core"))
    )
    (1 to frecuencia).map { d =>
      val (nombre, grupos) = ciclo((d - 1) % 3)
      val esCardio = nombre == "Legs"
      buildDia(d, s"Día $d — $nombre", grupos, nivel, sr, usaCardio, cardioEnEste = esCardio)
    }.toList
  }

  def generarTorsoPierna(
    nivel: String, frecuencia: Int, sr: SetsReps, usaCardio: Boolean
  ): List[DiaPlan] = {
    val torso  = List("pecho", "espalda", "hombros", "biceps", "triceps")
    val pierna = List("piernas", "core")
    (1 to frecuencia).map { d =>
      if (d % 2 == 1)
        buildDia(d, s"Día $d — Torso", torso, nivel, sr, usaCardio = false)
      else
        buildDia(d, s"Día $d — Pierna", pierna, nivel, sr, usaCardio, cardioEnEste = true)
    }.toList
  }

  def generarEspecializado(
    nivel: String, frecuencia: Int, sr: SetsReps, usaCardio: Boolean
  ): List[DiaPlan] = {
    val ciclo = List(
      ("Pecho + Tríceps",     List("pecho", "triceps")),
      ("Espalda + Bíceps",    List("espalda", "biceps")),
      ("Piernas",             List("piernas")),
      ("Hombros + Core",      List("hombros", "core")),
      ("Piernas (posterior)", List("piernas", "core")),
      ("Full Body ligero",    List("pecho", "espalda", "piernas"))
    )
    (1 to frecuencia).map { d =>
      val (nombre, grupos) = ciclo((d - 1) % ciclo.size)
      val esCardio = nombre.contains("Pierna") || nombre.contains("ligero")
      buildDia(d, s"Día $d — $nombre", grupos, nivel, sr, usaCardio, cardioEnEste = esCardio)
    }.toList
  }
}