// backend/scala/EjercicioRepository.scala
// VERSIÓN CORREGIDA:
//   - Niveles mínimos reales según estándares NSCA/ACE
//   - Campo 'tipo' para ordenar compuestos antes que accesorios
//   - Campo 'contraindicaciones' para filtrar por IMC/condición
//   - Peso muerto convencional → nivel intermedio (NO principiante)
//   - Dominadas → nivel intermedio con opción asistida para principiantes
//   - Skull crusher, Arnold press → nivel avanzado
//   - Rueda abdominal → nivel avanzado
//   - HIIT → nivel intermedio (no para principiantes)
package gymexpert

case class Ejercicio(
  nombre:           String,
  grupo:            String,
  equipo:           String,
  nivelMinimo:      String,   // principiante | intermedio | avanzado
  tipo:             String,   // compuesto | accesorio | aislamiento | cardio | core
  contraindicaciones: List[String] = List()  // obesidad | rodilla | lumbar | hombro
)

object EjercicioRepository {

  val todos: List[Ejercicio] = List(

    // ═══════════════════════════════════════════
    // PECHO
    // ═══════════════════════════════════════════

    // Compuestos — van PRIMERO en la sesión
    Ejercicio("Press de banca plano",
      "pecho", "barra", "principiante", "compuesto"),

    Ejercicio("Press de banca inclinado",
      "pecho", "mancuernas", "principiante", "compuesto"),

    Ejercicio("Press de banca declinado",
      "pecho", "barra", "intermedio", "compuesto",
      List("hombro")),

    Ejercicio("Press de banca con agarre cerrado",
      "pecho", "barra", "intermedio", "compuesto"),

    // Accesorios
    Ejercicio("Aperturas con mancuernas en banco plano",
      "pecho", "mancuernas", "principiante", "accesorio"),

    Ejercicio("Aperturas en polea cruzada alta",
      "pecho", "polea", "intermedio", "accesorio"),

    Ejercicio("Aperturas en polea cruzada baja",
      "pecho", "polea", "intermedio", "accesorio"),

    // CORRECCIÓN: Fondos en paralelas → intermedio (requiere control escapular)
    Ejercicio("Fondos en paralelas",
      "pecho", "peso_corporal", "intermedio", "compuesto",
      List("hombro", "codo")),

    Ejercicio("Flexiones de brazos",
      "pecho", "peso_corporal", "principiante", "compuesto"),

    // ═══════════════════════════════════════════
    // ESPALDA
    // ═══════════════════════════════════════════

    // Compuestos
    // CORRECCIÓN CRÍTICA: peso muerto convencional → intermedio
    // Requiere movilidad de cadera, control de columna y técnica consolidada
    Ejercicio("Peso muerto convencional",
      "espalda", "barra", "intermedio", "compuesto",
      List("lumbar", "rodilla")),

    Ejercicio("Peso muerto sumo",
      "espalda", "barra", "intermedio", "compuesto",
      List("lumbar", "rodilla")),

    // CORRECCIÓN: Dominadas completas → intermedio
    // Para principiantes: jalón al pecho como alternativa
    Ejercicio("Dominadas agarre prono",
      "espalda", "peso_corporal", "intermedio", "compuesto"),

    Ejercicio("Dominadas agarre supino (chin-up)",
      "espalda", "peso_corporal", "intermedio", "compuesto"),

    // Estas SÍ son para principiantes (máquina asiste el movimiento)
    Ejercicio("Jalón al pecho agarre ancho",
      "espalda", "polea", "principiante", "compuesto"),

    Ejercicio("Jalón al pecho agarre estrecho",
      "espalda", "polea", "principiante", "compuesto"),

    // Accesorios
    Ejercicio("Remo con mancuerna a una mano",
      "espalda", "mancuernas", "principiante", "accesorio"),

    Ejercicio("Remo con barra pronado",
      "espalda", "barra", "intermedio", "accesorio",
      List("lumbar")),

    Ejercicio("Remo en máquina polea baja",
      "espalda", "polea", "principiante", "accesorio"),

    Ejercicio("Remo en máquina Hammer Strength",
      "espalda", "maquina", "principiante", "accesorio"),

    Ejercicio("Face pull en polea alta",
      "espalda", "polea", "principiante", "accesorio"),

    // ═══════════════════════════════════════════
    // HOMBROS
    // ═══════════════════════════════════════════

    // Compuestos
    Ejercicio("Press militar con barra de pie",
      "hombros", "barra", "intermedio", "compuesto",
      List("lumbar")),

    Ejercicio("Press con mancuernas sentado",
      "hombros", "mancuernas", "principiante", "compuesto"),

    // CORRECCIÓN: Arnold press → avanzado (movimiento complejo de rotación)
    Ejercicio("Arnold press",
      "hombros", "mancuernas", "avanzado", "compuesto",
      List("hombro")),

    // Aislamiento
    Ejercicio("Elevaciones laterales con mancuernas",
      "hombros", "mancuernas", "principiante", "aislamiento"),

    Ejercicio("Elevaciones frontales con mancuernas",
      "hombros", "mancuernas", "principiante", "aislamiento"),

    Ejercicio("Elevaciones laterales en polea baja",
      "hombros", "polea", "intermedio", "aislamiento"),

    Ejercicio("Pájaros con mancuernas (deltoides posterior)",
      "hombros", "mancuernas", "principiante", "aislamiento"),

    // ═══════════════════════════════════════════
    // BÍCEPS
    // ═══════════════════════════════════════════

    Ejercicio("Curl con mancuernas alterno",
      "biceps", "mancuernas", "principiante", "aislamiento"),

    Ejercicio("Curl martillo con mancuernas",
      "biceps", "mancuernas", "principiante", "aislamiento"),

    Ejercicio("Curl con barra recta",
      "biceps", "barra", "principiante", "aislamiento"),

    Ejercicio("Curl en polea baja con barra",
      "biceps", "polea", "principiante", "aislamiento"),

    Ejercicio("Curl concentrado en banco",
      "biceps", "mancuernas", "intermedio", "aislamiento"),

    Ejercicio("Curl en banco Scott (predicador)",
      "biceps", "barra", "intermedio", "aislamiento"),

    // ═══════════════════════════════════════════
    // TRÍCEPS
    // ═══════════════════════════════════════════

    // CORRECCIÓN: Skull crusher → avanzado (alta carga articular en codo)
    Ejercicio("Skull crusher con barra EZ",
      "triceps", "barra", "avanzado", "accesorio",
      List("codo")),

    Ejercicio("Extensión en polea alta con cuerda",
      "triceps", "polea", "principiante", "aislamiento"),

    Ejercicio("Extensión en polea alta con barra",
      "triceps", "polea", "principiante", "aislamiento"),

    Ejercicio("Fondos en banco (bench dips)",
      "triceps", "peso_corporal", "principiante", "accesorio",
      List("hombro")),

    Ejercicio("Press cerrado en banco plano",
      "triceps", "barra", "intermedio", "compuesto"),

    Ejercicio("Extensión sobre la cabeza con mancuerna",
      "triceps", "mancuernas", "intermedio", "aislamiento",
      List("codo")),

    // ═══════════════════════════════════════════
    // PIERNAS
    // ═══════════════════════════════════════════

    // Compuestos — prioridad máxima en la sesión de piernas
    Ejercicio("Sentadilla con barra espalda",
      "piernas", "barra", "principiante", "compuesto",
      List("rodilla", "lumbar")),

    Ejercicio("Prensa de piernas 45°",
      "piernas", "maquina", "principiante", "compuesto",
      List("rodilla")),

    Ejercicio("Peso muerto rumano con barra",
      "piernas", "barra", "intermedio", "compuesto",
      List("lumbar")),

    Ejercicio("Peso muerto rumano con mancuernas",
      "piernas", "mancuernas", "principiante", "compuesto",
      List("lumbar")),

    Ejercicio("Hip thrust con barra",
      "piernas", "barra", "intermedio", "compuesto"),

    Ejercicio("Hip thrust con mancuerna",
      "piernas", "mancuernas", "principiante", "compuesto"),

    // CORRECCIÓN: Sentadilla búlgara → avanzado (requiere equilibrio y movilidad)
    Ejercicio("Sentadilla búlgara con mancuernas",
      "piernas", "mancuernas", "avanzado", "compuesto",
      List("rodilla")),

    Ejercicio("Zancadas con mancuernas",
      "piernas", "mancuernas", "principiante", "accesorio",
      List("rodilla")),

    Ejercicio("Zancadas con barra",
      "piernas", "barra", "intermedio", "accesorio",
      List("rodilla", "lumbar")),

    // Aislamiento piernas
    Ejercicio("Extensión de cuádriceps en máquina",
      "piernas", "maquina", "principiante", "aislamiento",
      List("rodilla")),

    Ejercicio("Curl femoral tumbado en máquina",
      "piernas", "maquina", "principiante", "aislamiento"),

    Ejercicio("Curl femoral sentado en máquina",
      "piernas", "maquina", "principiante", "aislamiento"),

    Ejercicio("Elevación de talones de pie",
      "piernas", "maquina", "principiante", "aislamiento"),

    Ejercicio("Elevación de talones sentado",
      "piernas", "maquina", "principiante", "aislamiento"),

    Ejercicio("Abducción de cadera en máquina",
      "piernas", "maquina", "principiante", "aislamiento"),

    // ═══════════════════════════════════════════
    // CORE
    // ═══════════════════════════════════════════

    // CORRECCIÓN: plancha → isométrico con segundos, no reps numéricas
    Ejercicio("Plancha abdominal isométrica",
      "core", "peso_corporal", "principiante", "core"),

    Ejercicio("Plancha lateral isométrica",
      "core", "peso_corporal", "principiante", "core"),

    Ejercicio("Crunch abdominal en banco",
      "core", "peso_corporal", "principiante", "core"),

    Ejercicio("Crunch en polea alta",
      "core", "polea", "principiante", "core"),

    Ejercicio("Elevación de piernas tumbado",
      "core", "peso_corporal", "principiante", "core"),

    Ejercicio("Elevación de piernas colgado en barra",
      "core", "barra", "intermedio", "core"),

    Ejercicio("Rotación con cable en polea",
      "core", "polea", "intermedio", "core"),

    Ejercicio("Ab wheel (rueda abdominal)",
      "core", "rueda", "avanzado", "core",
      List("lumbar")),

    Ejercicio("Dead bug",
      "core", "peso_corporal", "principiante", "core"),

    Ejercicio("Bird dog",
      "core", "peso_corporal", "principiante", "core"),

    // ═══════════════════════════════════════════
    // CARDIO
    // ═══════════════════════════════════════════

    // LISS — bajo impacto, para todos los niveles y IMC
    Ejercicio("Caminata en cinta inclinada (LISS)",
      "cardio", "cinta", "principiante", "cardio"),

    Ejercicio("Bicicleta estática ritmo moderado",
      "cardio", "bicicleta", "principiante", "cardio"),

    Ejercicio("Elíptica ritmo moderado",
      "cardio", "eliptica", "principiante", "cardio"),

    // HIIT — CORRECCIÓN: solo intermedio+, no para principiantes ni obesidad
    Ejercicio("HIIT en cinta (intervalos 30/30)",
      "cardio", "cinta", "intermedio", "cardio",
      List("obesidad", "rodilla")),

    Ejercicio("HIIT en bicicleta (intervalos)",
      "cardio", "bicicleta", "intermedio", "cardio",
      List("obesidad")),

    // CORRECCIÓN: Salto a la cuerda → intermedio, contraindicado en obesidad
    Ejercicio("Salto a la cuerda",
      "cardio", "cuerda", "intermedio", "cardio",
      List("obesidad", "rodilla"))
  )

  // ─── QUERIES BÁSICAS ─────────────────────────────────────

  def porGrupo(grupo: String): List[Ejercicio] =
    todos.filter(_.grupo == grupo)

  def porNivel(nivel: String): List[Ejercicio] = {
    val nivelesPermitidos = nivel match {
      case "principiante" => Set("principiante")
      case "intermedio"   => Set("principiante", "intermedio")
      case "avanzado"     => Set("principiante", "intermedio", "avanzado")
      case _              => Set("principiante")
    }
    todos.filter(e => nivelesPermitidos.contains(e.nivelMinimo))
  }

  def porGrupoYNivel(grupo: String, nivel: String): List[Ejercicio] =
    porGrupo(grupo).filter(e => porNivel(nivel).contains(e))

  // NUEVO: filtrar también por contraindicaciones
  def porGrupoNivelSinContraind(
    grupo: String,
    nivel: String,
    contraindicaciones: List[String]
  ): List[Ejercicio] =
    porGrupoYNivel(grupo, nivel)
      .filter(e => e.contraindicaciones.intersect(contraindicaciones).isEmpty)

  // NUEVO: obtener solo los compuestos de un grupo (para priorizar al inicio)
  def compuestosPorGrupoYNivel(grupo: String, nivel: String): List[Ejercicio] =
    porGrupoYNivel(grupo, nivel).filter(_.tipo == "compuesto")

  // NUEVO: obtener accesorios/aislamiento (para el final de la sesión)
  def accesoriosPorGrupoYNivel(grupo: String, nivel: String): List[Ejercicio] =
    porGrupoYNivel(grupo, nivel).filter(e => e.tipo == "accesorio" || e.tipo == "aislamiento")

  // NUEVO: cardio apropiado según nivel e IMC
  def cardioApropiado(nivel: String, imcCat: String): List[Ejercicio] = {
    val contrainds = if (imcCat == "obesidad") List("obesidad") else List()
    porGrupoNivelSinContraind("cardio", nivel, contrainds)
  }
}