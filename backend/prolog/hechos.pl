% ============================================================
% backend/prolog/hechos.pl
% Base de hechos del sistema experto
% ============================================================

% ─── NIVELES ───────────────────────────────────────────────
nivel_valido(principiante).
nivel_valido(intermedio).
nivel_valido(avanzado).

% ─── OBJETIVOS ─────────────────────────────────────────────
objetivo_valido(perder_grasa).
objetivo_valido(ganar_musculo).
objetivo_valido(mantener).

% ─── IMC CATEGORIAS ────────────────────────────────────────
imc_valido(bajo_peso).
imc_valido(normal).
imc_valido(sobrepeso).
imc_valido(obesidad).

% ─── SOMATOTIPOS ───────────────────────────────────────────
somatotipo_valido(ectomorfo).
somatotipo_valido(mesomorfo).
somatotipo_valido(endomorfo).

% ─── TIPOS DE RUTINA DISPONIBLES ───────────────────────────
tipo_rutina(fullbody).
tipo_rutina(upper_lower).
tipo_rutina(ppl).
tipo_rutina(torso_pierna).
tipo_rutina(especializado).

% ─── INTENSIDADES ──────────────────────────────────────────
intensidad_valida(baja).
intensidad_valida(moderada).
intensidad_valida(alta).
intensidad_valida(muy_alta).

% ─── RANGOS DE EDAD ────────────────────────────────────────
rango_edad(joven, 15, 29).
rango_edad(adulto, 30, 49).
rango_edad(mayor, 50, 99).

% ─── FRECUENCIA MÁXIMA POR NIVEL ───────────────────────────
frecuencia_max(principiante, 3).
frecuencia_max(intermedio, 5).
frecuencia_max(avanzado, 6).

% ─── UMBRAL DE DIAS PARA TIPO DE RUTINA ────────────────────
dias_minimos(fullbody, 2).
dias_minimos(upper_lower, 4).
dias_minimos(ppl, 5).
dias_minimos(torso_pierna, 4).
dias_minimos(especializado, 6).