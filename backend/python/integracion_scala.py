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
    Si el JAR no existe, usa el generador Python embebido.
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
        if result.returncode == 0:
            return json.loads(result.stdout)
        else:
            return _generar_rutina_python(params)
    except Exception:
        return _generar_rutina_python(params)

def _generar_rutina_python(params: dict) -> dict:
    """
    Generador de rutina dinámico en Python (replica lógica Scala).
    """
    tipo = params.get("tipo_rutina", "fullbody")
    intensidad = params.get("intensidad", "moderada")
    frecuencia = params.get("frecuencia", 3)
    objetivo = params.get("objetivo", "mantener")
    usa_cardio = params.get("usa_cardio", False)

    EJERCICIOS = {
        "pecho": [
            {"nombre": "Press de banca plano", "grupo": "pecho", "equipo": "barra"},
            {"nombre": "Press de banca inclinado", "grupo": "pecho", "equipo": "mancuernas"},
            {"nombre": "Aperturas en polea", "grupo": "pecho", "equipo": "polea"},
            {"nombre": "Fondos en paralelas", "grupo": "pecho", "equipo": "peso_corporal"},
        ],
        "espalda": [
            {"nombre": "Peso muerto", "grupo": "espalda", "equipo": "barra"},
            {"nombre": "Jalón al pecho", "grupo": "espalda", "equipo": "polea"},
            {"nombre": "Remo con barra", "grupo": "espalda", "equipo": "barra"},
            {"nombre": "Dominadas", "grupo": "espalda", "equipo": "peso_corporal"},
        ],
        "hombros": [
            {"nombre": "Press militar", "grupo": "hombros", "equipo": "barra"},
            {"nombre": "Elevaciones laterales", "grupo": "hombros", "equipo": "mancuernas"},
            {"nombre": "Face pull", "grupo": "hombros", "equipo": "polea"},
        ],
        "biceps": [
            {"nombre": "Curl de bíceps con barra", "grupo": "biceps", "equipo": "barra"},
            {"nombre": "Curl martillo", "grupo": "biceps", "equipo": "mancuernas"},
        ],
        "triceps": [
            {"nombre": "Press francés", "grupo": "triceps", "equipo": "barra"},
            {"nombre": "Extensión en polea alta", "grupo": "triceps", "equipo": "polea"},
        ],
        "piernas": [
            {"nombre": "Sentadilla con barra", "grupo": "piernas", "equipo": "barra"},
            {"nombre": "Prensa de piernas", "grupo": "piernas", "equipo": "maquina"},
            {"nombre": "Extensión de cuádriceps", "grupo": "piernas", "equipo": "maquina"},
            {"nombre": "Curl femoral", "grupo": "piernas", "equipo": "maquina"},
            {"nombre": "Peso muerto rumano", "grupo": "piernas", "equipo": "barra"},
            {"nombre": "Elevación de talones", "grupo": "piernas", "equipo": "maquina"},
        ],
        "core": [
            {"nombre": "Plancha abdominal", "grupo": "core", "equipo": "peso_corporal"},
            {"nombre": "Crunch en polea", "grupo": "core", "equipo": "polea"},
            {"nombre": "Elevación de piernas colgado", "grupo": "core", "equipo": "barra"},
        ],
    }

    sets_reps = _calcular_sets_reps(intensidad, objetivo)

    dias_rutina = []

    if tipo == "fullbody":
        grupos_dia = ["pecho", "espalda", "piernas", "hombros", "core"]
        for dia_num in range(1, frecuencia + 1):
            ejercicios = []
            for grupo in grupos_dia:
                exs = EJERCICIOS.get(grupo, [])
                if exs:
                    ex = exs[dia_num % len(exs)]
                    ejercicios.append({
                        **ex,
                        "series": sets_reps["series"],
                        "repeticiones": sets_reps["reps"],
                        "descanso_seg": sets_reps["descanso"]
                    })
            if usa_cardio:
                ejercicios.append({
                    "nombre": "Cardio (cinta/bicicleta)",
                    "grupo": "cardio",
                    "equipo": "cardio",
                    "series": 1,
                    "repeticiones": "20 min",
                    "descanso_seg": 0
                })
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
            else:
                grupos = lower
                nombre_dia = f"Día {dia_num} — Tren Inferior"
            ejercicios = []
            for grupo in grupos:
                exs = EJERCICIOS.get(grupo, [])
                if exs:
                    ex = exs[dia_num % len(exs)]
                    ejercicios.append({
                        **ex,
                        "series": sets_reps["series"],
                        "repeticiones": sets_reps["reps"],
                        "descanso_seg": sets_reps["descanso"]
                    })
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
            ejercicios = []
            for grupo in grupos:
                exs = EJERCICIOS.get(grupo, [])
                for ex in exs[:2]:
                    ejercicios.append({
                        **ex,
                        "series": sets_reps["series"],
                        "repeticiones": sets_reps["reps"],
                        "descanso_seg": sets_reps["descanso"]
                    })
            if usa_cardio and bloque_nombre == "Pull":
                ejercicios.append({
                    "nombre": "HIIT (intervalos)",
                    "grupo": "cardio",
                    "equipo": "cardio",
                    "series": 1,
                    "repeticiones": "15 min",
                    "descanso_seg": 0
                })
            dias_rutina.append({
                "dia": dia_num,
                "nombre": f"Día {dia_num} — {bloque_nombre}",
                "ejercicios": ejercicios
            })

    return {
        "tipo_rutina": tipo,
        "dias": dias_rutina,
        "generado_por": "python_fallback"
    }

def _calcular_sets_reps(intensidad: str, objetivo: str) -> dict:
    if objetivo == "ganar_musculo":
        if intensidad == "alta":
            return {"series": 5, "reps": "5-6", "descanso": 180}
        elif intensidad == "moderada":
            return {"series": 4, "reps": "8-10", "descanso": 120}
        else:
            return {"series": 3, "reps": "12-15", "descanso": 90}
    elif objetivo == "perder_grasa":
        if intensidad == "alta":
            return {"series": 4, "reps": "12-15", "descanso": 60}
        elif intensidad == "moderada":
            return {"series": 3, "reps": "15-20", "descanso": 45}
        else:
            return {"series": 3, "reps": "20", "descanso": 30}
    else:
        return {"series": 3, "reps": "10-12", "descanso": 90}