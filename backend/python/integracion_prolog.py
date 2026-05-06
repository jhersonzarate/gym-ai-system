# backend/python/integracion_prolog.py
import subprocess
import os
import json
import re

PROLOG_DIR = os.path.join(os.path.dirname(__file__), "../prolog")

def consultar_prolog(perfil: dict) -> dict:
    """
    Genera una consulta Prolog a partir del perfil del usuario
    y ejecuta el motor de inferencia.
    """
    edad = perfil["edad"]
    nivel = perfil["nivel"]
    objetivo = perfil["objetivo"]
    dias = perfil["dias_disponibles"]
    imc_cat = perfil["imc_categoria"]
    somatotipo = perfil["somatotipo"]

    # Construir consulta dinámica
    query = f"""
:- consult('{PROLOG_DIR}/hechos.pl').
:- consult('{PROLOG_DIR}/reglas.pl').
:- consult('{PROLOG_DIR}/inferencia.pl').

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

    # Guardar query temporal
    query_file = "/tmp/gym_query.pl"
    try:
        with open(query_file, "w") as f:
            f.write(query)
    except:
        return _resultado_fallback(perfil)

    try:
        result = subprocess.run(
            ["swipl", "-g", "halt", "-t", f"consult('{query_file}')"],
            capture_output=True,
            text=True,
            timeout=10
        )
        output = result.stdout + result.stderr
        
        # Si hay error o no hay salida, usar fallback
        if result.returncode != 0 or not output.strip():
            return _resultado_fallback(perfil)
        
        parsed = _parsear_salida_prolog(output)
        
        # Si no se parsearon explicaciones, usar fallback
        if not parsed.get("explicacion") or (isinstance(parsed.get("explicacion"), list) and len(parsed["explicacion"]) == 0):
            return _resultado_fallback(perfil)
        
        return parsed
    except subprocess.TimeoutExpired:
        return _resultado_fallback(perfil)
    except FileNotFoundError:
        # SWI-Prolog no instalado, usar fallback
        return _resultado_fallback(perfil)
    except Exception:
        return _resultado_fallback(perfil)

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
            except:
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
                # Filtrar explicaciones vacías
                explicaciones_found = True
                exps = [e.strip() for e in texto.split("|") if e.strip()]
                resultado["explicacion"] = exps
    
    # Si no se encontraron explicaciones, devolver resultado incompleto 
    # para que el caller sepa que debe usar fallback
    if not explicaciones_found:
        resultado["explicacion"] = []
    
    return resultado

def _resultado_fallback(perfil: dict) -> dict:
    """Lógica fallback en Python si Prolog no está disponible"""
    nivel = perfil.get("nivel", "principiante")
    objetivo = perfil.get("objetivo", "mantener")
    dias = perfil.get("dias_disponibles", 3)
    imc_cat = perfil.get("imc_categoria", "normal")

    tipo = "fullbody"
    frecuencia = min(dias, 4)
    intensidad = "moderada"
    usa_cardio = False
    explicaciones = []

    if nivel == "principiante":
        tipo = "fullbody"
        intensidad = "baja"
        explicaciones.append("Nivel principiante: se prioriza adaptación neuromuscular y técnica de movimiento")
        explicaciones.append("Disponibilidad de {0} días — se asignan {1} sesiones semanales".format(dias, frecuencia))
    elif nivel == "intermedio":
        tipo = "upper_lower" if dias >= 4 else "fullbody"
        intensidad = "moderada"
        explicaciones.append("Nivel intermedio: el cuerpo puede manejar mayor volumen e intensidad de entrenamiento")
        explicaciones.append("Disponibilidad de {0} días — se asignan {1} sesiones semanales".format(dias, frecuencia))
    else:
        tipo = "ppl" if dias >= 5 else "upper_lower"
        intensidad = "alta"
        explicaciones.append("Nivel avanzado: se aplica especialización y periodización para romper mesetas")
        explicaciones.append("Disponibilidad de {0} días — se asignan {1} sesiones semanales".format(dias, frecuencia))

    if objetivo == "perder_grasa":
        usa_cardio = True
        explicaciones.append("Objetivo perder grasa: se genera déficit calórico combinando ejercicio y nutrición")
    elif objetivo == "ganar_musculo":
        usa_cardio = False
        explicaciones.append("Objetivo ganar músculo: superávit calórico moderado con énfasis en sobrecarga progresiva")
    else:
        explicaciones.append("Objetivo mantenimiento: equilibrio entre ingesta y gasto energético")

    if imc_cat == "bajo_peso":
        explicaciones.append("IMC bajo: se prioriza ganancia de masa muscular y densidad calórica")
    elif imc_cat == "normal":
        explicaciones.append("IMC normal: condición física óptima para cualquier objetivo")
    elif imc_cat == "sobrepeso":
        explicaciones.append("IMC sobrepeso: se incluye cardio moderado y control calórico")
    elif imc_cat == "obesidad":
        intensidad = "baja"
        usa_cardio = True
        explicaciones.append("IMC obesidad: intensidad reducida para proteger articulaciones y corazón")

    if tipo == "fullbody":
        explicaciones.append("Rutina Full Body: todos los grupos musculares en cada sesión, ideal para baja frecuencia")
    elif tipo == "upper_lower":
        explicaciones.append("Rutina Upper/Lower: división por tren superior e inferior, mayor volumen por grupo")
    elif tipo == "ppl":
        explicaciones.append("Rutina Push/Pull/Legs: máxima especialización por patrón de movimiento")

    if intensidad == "baja":
        explicaciones.append("Intensidad baja: cargas moderadas, técnica perfecta, recuperación prioritaria")
    elif intensidad == "moderada":
        explicaciones.append("Intensidad moderada: rango hipertrofia 8-12 reps, esfuerzo controlado")
    elif intensidad == "alta":
        explicaciones.append("Intensidad alta: cargas pesadas 5-8 reps, fuerza-hipertrofia combinada")

    if usa_cardio:
        if objetivo == "perder_grasa":
            explicaciones.append("Cardio incluido: esencial para ampliar déficit calórico en objetivo de pérdida de grasa")
        else:
            explicaciones.append("Cardio incluido: beneficioso para salud metabólica y recuperación")
    else:
        if objetivo == "ganar_musculo":
            explicaciones.append("Cardio omitido: se maximiza superávit calórico para síntesis proteica muscular")
        else:
            explicaciones.append("Cardio no prioritario: el enfoque está en fuerza y composición corporal")
    return {
        "frecuencia": frecuencia,
        "tipo_rutina": tipo,
        "intensidad": intensidad,
        "usa_cardio": usa_cardio,
        "explicacion": explicaciones
    }