# backend/python/integracion_scala.py
import subprocess
import json
import os

SCALA_JAR = os.path.join(
    os.path.dirname(__file__),
    "../scala/target/scala-2.13/gym-rutina-generator.jar"
)


def generar_rutina_scala(params: dict) -> dict:
    """
    Llama al JAR de Scala con los parámetros del perfil + decisiones Prolog.
    Si el JAR no existe o falla, usa el generador Python embebido.
    """
    if not os.path.exists(SCALA_JAR):
        return _generar_rutina_python(params)

    try:
        payload = json.dumps(params)
        result = subprocess.run(
            ["java", "-jar", SCALA_JAR],
            input=payload,
            capture_output=True,
            text=True,
            timeout=15
        )
        if result.returncode == 0 and result.stdout.strip():
            return json.loads(result.stdout)
        else:
            return _generar_rutina_python(params)
    except Exception:
        return _generar_rutina_python(params)


def _generar_rutina_python(params: dict) -> dict:
    """
    Generador de rutina dinámico en Python (replica lógica Scala).
    CORRECCIÓN: lógica alineada con reglas Prolog — avanzado 4-5 días → ppl,
    avanzado 6 días ganar_musculo → especializado.
    """
    tipo       = params.get("tipo_rutina", "fullbody")
    intensidad = params.get("intensidad", "moderada")
    frecuencia = params.get("frecuencia", 3)
    objetivo   = params.get("objetivo", "mantener")
    usa_cardio = params.get("usa_cardio", False)
    nivel      = params.get("nivel", "principiante")

    EJERCICIOS = {
        "pecho": [
            {"nombre": "Press de banca plano",       "grupo": "pecho",    "equipo": "barra"},
            {"nombre": "Press de banca inclinado",   "grupo": "pecho",    "equipo": "mancuernas"},
            {"nombre": "Aperturas en polea cruzada", "grupo": "pecho",    "equipo": "polea"},
            {"nombre": "Flexiones de brazos",        "grupo": "pecho",    "equipo": "peso_corporal"},
        ],
        "espalda": [
            {"nombre": "Jalón al pecho agarre ancho",      "grupo": "espalda", "equipo": "polea"},
            {"nombre": "Remo en máquina polea baja",       "grupo": "espalda", "equipo": "polea"},
            {"nombre": "Remo con mancuerna a una mano",    "grupo": "espalda", "equipo": "mancuernas"},
            {"nombre": "Face pull en polea alta",          "grupo": "espalda", "equipo": "polea"},
        ],
        "hombros": [
            {"nombre": "Press con mancuernas sentado",          "grupo": "hombros", "equipo": "mancuernas"},
            {"nombre": "Elevaciones laterales con mancuernas",  "grupo": "hombros", "equipo": "mancuernas"},
            {"nombre": "Pájaros con mancuernas",                "grupo": "hombros", "equipo": "mancuernas"},
        ],
        "biceps": [
            {"nombre": "Curl con mancuernas alterno", "grupo": "biceps", "equipo": "mancuernas"},
            {"nombre": "Curl martillo con mancuernas","grupo": "biceps", "equipo": "mancuernas"},
        ],
        "triceps": [
            {"nombre": "Extensión en polea alta con cuerda", "grupo": "triceps", "equipo": "polea"},
            {"nombre": "Extensión en polea alta con barra",  "grupo": "triceps", "equipo": "polea"},
        ],
        "piernas": [
            {"nombre": "Sentadilla con barra espalda",     "grupo": "piernas", "equipo": "barra"},
            {"nombre": "Prensa de piernas 45°",            "grupo": "piernas", "equipo": "maquina"},
            {"nombre": "Extensión de cuádriceps en máquina","grupo": "piernas", "equipo": "maquina"},
            {"nombre": "Curl femoral tumbado en máquina",  "grupo": "piernas", "equipo": "maquina"},
            {"nombre": "Peso muerto rumano con mancuernas","grupo": "piernas", "equipo": "mancuernas"},
            {"nombre": "Elevación de talones de pie",      "grupo": "piernas", "equipo": "maquina"},
        ],
        "core": [
            {"nombre": "Plancha abdominal isométrica",   "grupo": "core", "equipo": "peso_corporal"},
            {"nombre": "Crunch en polea alta",           "grupo": "core", "equipo": "polea"},
            {"nombre": "Elevación de piernas tumbado",   "grupo": "core", "equipo": "peso_corporal"},
        ],
    }

    sets_reps = _calcular_sets_reps(intensidad, objetivo)
    dias_rutina = []

    if tipo == "fullbody":
        grupos_dia = ["pecho", "espalda", "piernas", "hombros", "core"]
        for dia_num in range(1, frecuencia + 1):
            ejercicios = _construir_ejercicios(grupos_dia, EJERCICIOS, dia_num, sets_reps)
            if usa_cardio:
                ejercicios.append(_cardio_ejercicio())
            dias_rutina.append({
                "dia": dia_num,
                "nombre": f"Día {dia_num} — Full Body",
                "ejercicios": ejercicios
            })

    elif tipo == "upper_lower":
        upper = ["pecho", "espalda", "hombros", "biceps", "triceps"]
        lower = ["piernas", "core"]
        for dia_num in range(1, frecuencia + 1):
            if dia_num % 2 == 1:
                grupos = upper
                nombre_dia = f"Día {dia_num} — Tren Superior"
                cardio_hoy = False
            else:
                grupos = lower
                nombre_dia = f"Día {dia_num} — Tren Inferior"
                cardio_hoy = True
            ejercicios = _construir_ejercicios(grupos, EJERCICIOS, dia_num, sets_reps)
            if usa_cardio and cardio_hoy:
                ejercicios.append(_cardio_ejercicio())
            dias_rutina.append({
                "dia": dia_num,
                "nombre": nombre_dia,
                "ejercicios": ejercicios
            })

    elif tipo == "ppl":
        ciclo = [
            ("Push", ["pecho", "hombros", "triceps"]),
            ("Pull", ["espalda", "biceps"]),
            ("Legs", ["piernas", "core"]),
        ]
        for dia_num in range(1, frecuencia + 1):
            bloque_nombre, grupos = ciclo[(dia_num - 1) % 3]
            ejercicios = _construir_ejercicios_multi(grupos, EJERCICIOS, dia_num, sets_reps, max_por_grupo=2)
            if usa_cardio and bloque_nombre == "Legs":
                ejercicios.append(_cardio_ejercicio())
            dias_rutina.append({
                "dia": dia_num,
                "nombre": f"Día {dia_num} — {bloque_nombre}",
                "ejercicios": ejercicios
            })

    elif tipo == "torso_pierna":
        torso  = ["pecho", "espalda", "hombros", "biceps", "triceps"]
        pierna = ["piernas", "core"]
        for dia_num in range(1, frecuencia + 1):
            if dia_num % 2 == 1:
                grupos = torso
                nombre_dia = f"Día {dia_num} — Torso"
                cardio_hoy = False
            else:
                grupos = pierna
                nombre_dia = f"Día {dia_num} — Pierna"
                cardio_hoy = True
            ejercicios = _construir_ejercicios(grupos, EJERCICIOS, dia_num, sets_reps)
            if usa_cardio and cardio_hoy:
                ejercicios.append(_cardio_ejercicio())
            dias_rutina.append({
                "dia": dia_num,
                "nombre": nombre_dia,
                "ejercicios": ejercicios
            })

    elif tipo == "especializado":
        ciclo = [
            ("Pecho + Tríceps",     ["pecho", "triceps"]),
            ("Espalda + Bíceps",    ["espalda", "biceps"]),
            ("Piernas",             ["piernas"]),
            ("Hombros + Core",      ["hombros", "core"]),
            ("Piernas (posterior)", ["piernas", "core"]),
            ("Full Body ligero",    ["pecho", "espalda", "piernas"]),
        ]
        for dia_num in range(1, frecuencia + 1):
            nombre_bloque, grupos = ciclo[(dia_num - 1) % len(ciclo)]
            es_cardio = "pierna" in nombre_bloque.lower() or "ligero" in nombre_bloque.lower()
            ejercicios = _construir_ejercicios_multi(grupos, EJERCICIOS, dia_num, sets_reps, max_por_grupo=2)
            if usa_cardio and es_cardio:
                ejercicios.append(_cardio_ejercicio())
            dias_rutina.append({
                "dia": dia_num,
                "nombre": f"Día {dia_num} — {nombre_bloque}",
                "ejercicios": ejercicios
            })

    else:
        # Fallback seguro: fullbody
        grupos_dia = ["pecho", "espalda", "piernas", "hombros", "core"]
        for dia_num in range(1, frecuencia + 1):
            ejercicios = _construir_ejercicios(grupos_dia, EJERCICIOS, dia_num, sets_reps)
            if usa_cardio:
                ejercicios.append(_cardio_ejercicio())
            dias_rutina.append({
                "dia": dia_num,
                "nombre": f"Día {dia_num} — Full Body",
                "ejercicios": ejercicios
            })

    return {
        "tipo_rutina":  tipo,
        "dias":         dias_rutina,
        "generado_por": "python_fallback"
    }


def _construir_ejercicios(grupos, ejercicios_db, dia_num, sets_reps):
    """Un ejercicio por grupo muscular, rotando con el número de día."""
    resultado = []
    for idx, grupo in enumerate(grupos):
        lista = ejercicios_db.get(grupo, [])
        if lista:
            ex = lista[(dia_num + idx) % len(lista)]
            resultado.append({
                **ex,
                "series":       sets_reps["series"],
                "repeticiones": sets_reps["reps"],
                "descanso_seg": sets_reps["descanso"]
            })
    return resultado


def _construir_ejercicios_multi(grupos, ejercicios_db, dia_num, sets_reps, max_por_grupo=2):
    """Hasta max_por_grupo ejercicios por grupo (para PPL y especializado)."""
    resultado = []
    for grupo in grupos:
        lista = ejercicios_db.get(grupo, [])
        for j in range(min(max_por_grupo, len(lista))):
            ex = lista[(dia_num + j) % len(lista)]
            resultado.append({
                **ex,
                "series":       sets_reps["series"],
                "repeticiones": sets_reps["reps"],
                "descanso_seg": sets_reps["descanso"]
            })
    return resultado


def _cardio_ejercicio():
    return {
        "nombre":       "Cardio (cinta/bicicleta)",
        "grupo":        "cardio",
        "equipo":       "cardio",
        "series":       1,
        "repeticiones": "20 min",
        "descanso_seg": 0
    }


def _calcular_sets_reps(intensidad: str, objetivo: str) -> dict:
    if objetivo == "ganar_musculo":
        if intensidad == "muy_alta":
            return {"series": 5, "reps": "3-5",   "descanso": 180}
        elif intensidad == "alta":
            return {"series": 4, "reps": "6-8",   "descanso": 150}
        elif intensidad == "moderada":
            return {"series": 4, "reps": "8-12",  "descanso": 120}
        else:
            return {"series": 3, "reps": "12-15", "descanso": 90}
    elif objetivo == "perder_grasa":
        if intensidad == "alta":
            return {"series": 4, "reps": "12-15", "descanso": 60}
        elif intensidad == "moderada":
            return {"series": 3, "reps": "15-20", "descanso": 45}
        else:
            return {"series": 3, "reps": "20-25", "descanso": 30}
    else:  # mantener
        if intensidad == "alta":
            return {"series": 4, "reps": "8-10",  "descanso": 120}
        else:
            return {"series": 3, "reps": "10-12", "descanso": 90}