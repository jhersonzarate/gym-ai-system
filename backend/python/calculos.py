# backend/python/calculos.py

def calcular_imc(peso_kg: float, altura_m: float) -> float:
    return round(peso_kg / (altura_m ** 2), 2)

def clasificar_imc(imc: float) -> str:
    if imc < 18.5:
        return "bajo_peso"
    elif imc < 25.0:
        return "normal"
    elif imc < 30.0:
        return "sobrepeso"
    else:
        return "obesidad"

def calcular_bmr(peso: float, altura_cm: float, edad: int, sexo: str) -> float:
    """Fórmula Mifflin-St Jeor"""
    if sexo == "masculino":
        return round((10 * peso) + (6.25 * altura_cm) - (5 * edad) + 5, 2)
    else:
        return round((10 * peso) + (6.25 * altura_cm) - (5 * edad) - 161, 2)

def calcular_tdee(bmr: float, dias_activos: int) -> float:
    """Factor de actividad basado en días disponibles"""
    if dias_activos <= 2:
        factor = 1.375
    elif dias_activos <= 4:
        factor = 1.55
    elif dias_activos <= 6:
        factor = 1.725
    else:
        factor = 1.9
    return round(bmr * factor, 2)

def calcular_macros(tdee: float, objetivo: str) -> dict:
    """
    Distribución de macros según objetivo
    """
    if objetivo == "perder_grasa":
        calorias_objetivo = round(tdee - 400)
        proteina_g = round(calorias_objetivo * 0.35 / 4)
        carbohidrato_g = round(calorias_objetivo * 0.30 / 4)
        grasa_g = round(calorias_objetivo * 0.35 / 9)
    elif objetivo == "ganar_musculo":
        calorias_objetivo = round(tdee + 300)
        proteina_g = round(calorias_objetivo * 0.30 / 4)
        carbohidrato_g = round(calorias_objetivo * 0.45 / 4)
        grasa_g = round(calorias_objetivo * 0.25 / 9)
    else:  # mantener
        calorias_objetivo = round(tdee)
        proteina_g = round(calorias_objetivo * 0.30 / 4)
        carbohidrato_g = round(calorias_objetivo * 0.40 / 4)
        grasa_g = round(calorias_objetivo * 0.30 / 9)

    return {
        "calorias_objetivo": calorias_objetivo,
        "proteinas_g": proteina_g,
        "carbohidratos_g": carbohidrato_g,
        "grasas_g": grasa_g
    }

def determinar_somatotipo(imc: float, objetivo: str) -> str:
    if imc < 20:
        return "ectomorfo"
    elif imc < 26:
        return "mesomorfo"
    else:
        return "endomorfo"

def simular_progreso(objetivo: str, semanas: int = 8) -> list:
    """Simula progreso esperado durante 8 semanas"""
    progreso = []
    for semana in range(1, semanas + 1):
        if objetivo == "perder_grasa":
            cambio = round(-0.4 * semana, 1)
        elif objetivo == "ganar_musculo":
            cambio = round(0.25 * semana, 1)
        else:
            cambio = 0.0
        progreso.append({"semana": semana, "cambio_kg": cambio})
    return progreso