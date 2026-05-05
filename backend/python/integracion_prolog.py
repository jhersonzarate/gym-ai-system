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
    with open(query_file, "w") as f:
        f.write(query)

    try:
        result = subprocess.run(
            ["swipl", "-g", "halt", "-t", f"consult('{query_file}')"],
            capture_output=True,
            text=True,
            timeout=10
        )
        output = result.stdout + result.stderr
        return _parsear_salida_prolog(output)
    except subprocess.TimeoutExpired:
        return _resultado_fallback(perfil)
    except FileNotFoundError:
        # SWI-Prolog no instalado, usar fallback
        return _resultado_fallback(perfil)

def _parsear_salida_prolog(output: str) -> dict:
    resultado = {
        "frecuencia": 3,
        "tipo_rutina": "fullbody",
        "intensidad": "moderada",
        "usa_cardio": True,
        "explicacion": []
    }
    
    for linea in output.split("\n"):
        linea = linea.strip()
        if linea.startswith("FRECUENCIA:"):
            try:
                resultado["frecuencia"] = int(linea.split(":")[1])
            except:
                pass
        elif linea.startswith("TIPO:"):
            resultado["tipo_rutina"] = linea.split(":")[1].strip()
        elif linea.startswith("INTENSIDAD:"):
            resultado["intensidad"] = linea.split(":")[1].strip()
        elif linea.startswith("CARDIO:"):
            val = linea.split(":")[1].strip()
            resultado["usa_cardio"] = val.lower() == "si"
        elif linea.startswith("EXPLICACION:"):
            texto = linea.split(":", 1)[1].strip()
            resultado["explicacion"] = texto.split("|")

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
        explicaciones.append("Principiante: rutina full body para adaptación neuromuscular")
    elif nivel == "intermedio":
        tipo = "upper_lower" if dias >= 4 else "fullbody"
        intensidad = "moderada"
        explicaciones.append("Intermedio: división upper/lower para mayor volumen")
    else:
        tipo = "ppl" if dias >= 5 else "upper_lower"
        intensidad = "alta"
        explicaciones.append("Avanzado: Push/Pull/Legs para máxima especialización")

    if objetivo == "perder_grasa":
        usa_cardio = True
        explicaciones.append("Objetivo grasa: cardio incluido para déficit calórico")
    elif objetivo == "ganar_musculo":
        usa_cardio = False
        explicaciones.append("Objetivo músculo: prioridad en entrenamiento de fuerza")

    if imc_cat == "obesidad":
        intensidad = "baja"
        usa_cardio = True
        explicaciones.append("IMC elevado: intensidad reducida y cardio adaptado")

    return {
        "frecuencia": frecuencia,
        "tipo_rutina": tipo,
        "intensidad": intensidad,
        "usa_cardio": usa_cardio,
        "explicacion": explicaciones
    }