# backend/python/integracion_prolog.py
import subprocess
import os
import tempfile

PROLOG_DIR = os.path.join(os.path.dirname(__file__), "../prolog")
PROLOG_DIR = os.path.normpath(PROLOG_DIR)


def consultar_prolog(perfil: dict) -> dict:
    """
    Genera una consulta Prolog a partir del perfil del usuario
    y ejecuta el motor de inferencia.
    CORRECCIÓN: usa frecuencia_ajustada/4 (ahora recibe CatEdad).
    """
    edad       = perfil["edad"]
    nivel      = perfil["nivel"]
    objetivo   = perfil["objetivo"]
    dias       = perfil["dias_disponibles"]
    imc_cat    = perfil["imc_categoria"]
    somatotipo = perfil["somatotipo"]

    prolog_dir_norm = PROLOG_DIR.replace("\\", "/")

    query = f"""
:- consult('{prolog_dir_norm}/hechos.pl').
:- consult('{prolog_dir_norm}/reglas.pl').
:- consult('{prolog_dir_norm}/inferencia.pl').

:-
    recomendar(
        {edad}, '{nivel}', '{objetivo}', {dias},
        '{imc_cat}', '{somatotipo}',
        Frecuencia, TipoRutina, Intensidad,
        UsaCardio, Explicacion
    ),
    format('FRECUENCIA:~w~n', [Frecuencia]),
    format('TIPO:~w~n', [TipoRutina]),
    format('INTENSIDAD:~w~n', [Intensidad]),
    format('CARDIO:~w~n', [UsaCardio]),
    format('EXPLICACION:~w~n', [Explicacion]),
    halt.
"""

    try:
        with tempfile.NamedTemporaryFile(
            mode='w', suffix='.pl', delete=False, encoding='utf-8'
        ) as f:
            f.write(query)
            query_file = f.name
    except Exception:
        return _resultado_fallback(perfil)

    try:
        query_file_norm = query_file.replace("\\", "/")

        result = subprocess.run(
            ["swipl", "-g", "halt", "-t", f"consult('{query_file_norm}')"],
            capture_output=True,
            text=True,
            timeout=10
        )
        output = result.stdout + result.stderr

        try:
            os.unlink(query_file)
        except Exception:
            pass

        if result.returncode != 0 or not output.strip():
            return _resultado_fallback(perfil)

        parsed = _parsear_salida_prolog(output)

        if not parsed.get("explicacion") or len(parsed["explicacion"]) == 0:
            return _resultado_fallback(perfil)

        return parsed

    except subprocess.TimeoutExpired:
        _limpiar(query_file)
        return _resultado_fallback(perfil)
    except FileNotFoundError:
        # SWI-Prolog no instalado
        _limpiar(query_file)
        return _resultado_fallback(perfil)
    except Exception:
        _limpiar(query_file)
        return _resultado_fallback(perfil)


def _limpiar(path: str):
    try:
        os.unlink(path)
    except Exception:
        pass


def _parsear_salida_prolog(output: str) -> dict:
    resultado = {
        "frecuencia": 3,
        "tipo_rutina": "fullbody",
        "intensidad": "moderada",
        "usa_cardio": True,
        "explicacion": []
    }

    explicaciones_found = False

    for linea in output.split("\n"):
        linea = linea.strip()
        if not linea:
            continue

        if linea.startswith("FRECUENCIA:"):
            try:
                resultado["frecuencia"] = int(linea.split(":")[1].strip())
            except Exception:
                pass
        elif linea.startswith("TIPO:"):
            tipo = linea.split(":", 1)[1].strip()
            if tipo:
                resultado["tipo_rutina"] = tipo
        elif linea.startswith("INTENSIDAD:"):
            intensidad = linea.split(":", 1)[1].strip()
            if intensidad:
                resultado["intensidad"] = intensidad
        elif linea.startswith("CARDIO:"):
            val = linea.split(":", 1)[1].strip()
            resultado["usa_cardio"] = val.lower() in ("si", "true", "yes", "1")
        elif linea.startswith("EXPLICACION:"):
            texto = linea.split(":", 1)[1].strip()
            if texto:
                explicaciones_found = True
                exps = [e.strip() for e in texto.split("|") if e.strip()]
                resultado["explicacion"] = exps

    if not explicaciones_found:
        resultado["explicacion"] = []

    return resultado


def _resultado_fallback(perfil: dict) -> dict:
    """
    Lógica fallback en Python si Prolog no está disponible.
    CORRECCIÓN: alineada con las reglas de Prolog (incluyendo
    ajuste de frecuencia por edad mayor).
    """
    nivel      = perfil.get("nivel", "principiante")
    objetivo   = perfil.get("objetivo", "mantener")
    dias       = perfil.get("dias_disponibles", 3)
    imc_cat    = perfil.get("imc_categoria", "normal")
    somatotipo = perfil.get("somatotipo", "mesomorfo")
    edad       = perfil.get("edad", 25)

    # Clasificar edad
    cat_edad = "joven" if edad < 30 else ("adulto" if edad < 50 else "mayor")

    # Determinar tipo y frecuencia base
    if nivel == "principiante":
        tipo = "fullbody"
        frecuencia = min(dias, 3)
        intensidad = "baja"
    elif nivel == "intermedio":
        if dias <= 3:
            tipo = "fullbody"
        elif dias <= 5:
            tipo = "upper_lower"
        else:
            tipo = "torso_pierna"
        frecuencia = min(dias, 5)
        intensidad = "moderada"
    else:  # avanzado
        if dias <= 3:
            tipo = "upper_lower"
        elif dias <= 5:
            tipo = "ppl"
        elif objetivo == "ganar_musculo":
            tipo = "especializado"
        else:
            tipo = "torso_pierna"
        frecuencia = min(dias, 6)
        intensidad = "alta"

    # CORRECCIÓN: ajuste de frecuencia por IMC + edad (replicando Prolog)
    if imc_cat == "obesidad" and cat_edad == "mayor":
        frecuencia = min(frecuencia, 2)
    elif imc_cat == "obesidad":
        frecuencia = min(frecuencia, 3)
    elif cat_edad == "mayor":
        frecuencia = min(frecuencia, 4)

    # Ajuste de intensidad por IMC
    usa_cardio = False
    if imc_cat == "obesidad":
        intensidad = "baja"
        usa_cardio = True
    elif imc_cat == "sobrepeso":
        usa_cardio = True

    if objetivo == "perder_grasa":
        usa_cardio = True
    elif objetivo == "ganar_musculo" and imc_cat in ("normal", "bajo_peso"):
        usa_cardio = False

    # Ajuste de intensidad por edad (replicando Prolog)
    if cat_edad == "mayor":
        if intensidad == "muy_alta":
            intensidad = "alta"
        elif intensidad == "alta":
            intensidad = "moderada"

    # Ajuste por somatotipo
    if somatotipo == "endomorfo" and not usa_cardio:
        usa_cardio = True

    # Generar explicaciones coherentes
    explicaciones = []

    nivel_map = {
        "principiante": "Nivel principiante: se prioriza adaptación neuromuscular y técnica de movimiento",
        "intermedio":   "Nivel intermedio: el cuerpo puede manejar mayor volumen e intensidad de entrenamiento",
        "avanzado":     "Nivel avanzado: se aplica especialización y periodización para romper mesetas",
    }
    explicaciones.append(nivel_map.get(nivel, ""))

    obj_map = {
        "perder_grasa":  "Objetivo perder grasa: se genera déficit calórico combinando ejercicio y nutrición",
        "ganar_musculo": "Objetivo ganar músculo: superávit calórico moderado con énfasis en sobrecarga progresiva",
        "mantener":      "Objetivo mantenimiento: equilibrio entre ingesta y gasto energético",
    }
    explicaciones.append(obj_map.get(objetivo, ""))
    explicaciones.append(
        f"Disponibilidad de {dias} días — se asignan {frecuencia} sesiones semanales"
    )

    imc_map = {
        "bajo_peso": "IMC bajo: se prioriza ganancia de masa muscular y densidad calórica",
        "normal":    "IMC normal: condición física óptima para cualquier objetivo",
        "sobrepeso": "IMC sobrepeso: se incluye cardio moderado y control calórico",
        "obesidad":  "IMC obesidad: intensidad reducida para proteger articulaciones y corazón",
    }
    explicaciones.append(imc_map.get(imc_cat, ""))

    tipo_map = {
        "fullbody":      "Rutina Full Body: todos los grupos musculares en cada sesión, ideal para baja frecuencia",
        "upper_lower":   "Rutina Upper/Lower: división por tren superior e inferior, mayor volumen por grupo",
        "ppl":           "Rutina Push/Pull/Legs: máxima especialización por patrón de movimiento",
        "torso_pierna":  "Rutina Torso/Pierna: híbrido eficiente para frecuencia media-alta",
        "especializado": "Rutina Especializada: días dedicados por grupo muscular, máximo volumen",
    }
    explicaciones.append(tipo_map.get(tipo, ""))

    int_map = {
        "baja":     "Intensidad baja: cargas moderadas, técnica perfecta, recuperación prioritaria",
        "moderada": "Intensidad moderada: rango hipertrofia 8-12 reps, esfuerzo controlado",
        "alta":     "Intensidad alta: cargas pesadas 5-8 reps, fuerza-hipertrofia combinada",
        "muy_alta": "Intensidad muy alta: trabajo de fuerza máxima y potencia muscular",
    }
    explicaciones.append(int_map.get(intensidad, ""))

    if usa_cardio:
        if objetivo == "perder_grasa":
            explicaciones.append(
                "Cardio incluido: esencial para ampliar déficit calórico en objetivo de pérdida de grasa"
            )
        else:
            explicaciones.append(
                "Cardio incluido: beneficioso para salud metabólica y recuperación"
            )
    else:
        if objetivo == "ganar_musculo":
            explicaciones.append(
                "Cardio omitido: se maximiza superávit calórico para síntesis proteica muscular"
            )
        else:
            explicaciones.append(
                "Cardio no prioritario: el enfoque está en fuerza y composición corporal"
            )

    soma_map = {
        "ectomorfo": "Somatotipo ectomorfo: metabolismo rápido — alta ingesta calórica y volumen moderado",
        "mesomorfo": "Somatotipo mesomorfo: respuesta muscular óptima — programa estándar efectivo",
        "endomorfo": "Somatotipo endomorfo: tendencia a acumular grasa — cardio extra y déficit controlado",
    }
    explicaciones.append(soma_map.get(somatotipo, ""))

    edad_map = {
        "joven":  "Rango etario joven: capacidad de recuperación alta, puede tolerar mayor frecuencia",
        "adulto": "Rango etario adulto: equilibrio entre carga y recuperación, descanso prioritario",
        "mayor":  "Rango etario mayor: se reduce intensidad máxima y frecuencia para proteger sistema osteoarticular",
    }
    explicaciones.append(edad_map.get(cat_edad, ""))

    explicaciones = [e for e in explicaciones if e]

    return {
        "frecuencia":  frecuencia,
        "tipo_rutina": tipo,
        "intensidad":  intensidad,
        "usa_cardio":  usa_cardio,
        "explicacion": explicaciones
    }