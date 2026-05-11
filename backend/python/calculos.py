# backend/python/calculos.py

def calcular_imc(peso_kg: float, altura_m: float) -> float:
    """
    Calcula el IMC. Lanza ValueError si la altura es inválida (≤ 0).
    """
    if altura_m <= 0:
        raise ValueError(f"Altura inválida: {altura_m}. Debe ser mayor a 0.")
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
    Distribución de macros según objetivo.
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
    """
    Simula progreso esperado durante N semanas con curva fisiológica realista.
    Corregido: ya no lanza IndexError si semanas > 8.
    """
    # Factores base para 8 semanas
    factores_grasa   = [0.9, 0.8, 0.7, 0.6, 0.55, 0.5, 0.45, 0.4]
    factores_musculo = [0.15, 0.20, 0.25, 0.28, 0.28, 0.26, 0.25, 0.22]

    progreso = []
    acumulado = 0.0

    for i in range(semanas):
        if objetivo == "perder_grasa":
            # Si supera los 8, usar el último factor disponible (meseta)
            factor = factores_grasa[min(i, len(factores_grasa) - 1)]
            delta = -factor
        elif objetivo == "ganar_musculo":
            factor = factores_musculo[min(i, len(factores_musculo) - 1)]
            delta = factor
        else:
            delta = 0.0

        acumulado = round(acumulado + delta, 1)
        progreso.append({
            "semana": i + 1,
            "cambio_kg": acumulado
        })

    return progreso