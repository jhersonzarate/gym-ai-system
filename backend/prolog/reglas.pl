% ============================================================
% backend/prolog/reglas.pl
% Reglas del motor experto — VERSION CORREGIDA
% Correcciones:
%   - PPL solo para avanzado (nunca principiante ni intermedio)
%   - Intensidades ajustadas por tipo ejercicio
%   - Fallback más seguro
%   - Reglas combinadas edad+imc+nivel
% ============================================================

:- use_module(library(lists)).

% ─── CLASIFICACIÓN DE EDAD ─────────────────────────────────

clasificar_edad(Edad, joven)  :- Edad >= 15, Edad =< 29.
clasificar_edad(Edad, adulto) :- Edad >= 30, Edad =< 49.
clasificar_edad(Edad, mayor)  :- Edad >= 50.

% ─── REGLAS DE FRECUENCIA ──────────────────────────────────

frecuencia_recomendada(principiante, Dias, F) :-
    F is min(Dias, 3).

frecuencia_recomendada(intermedio, Dias, F) :-
    F is min(Dias, 5).

frecuencia_recomendada(avanzado, Dias, F) :-
    F is min(Dias, 6).

% Ajuste por obesidad: limitar frecuencia máxima a 3 días
frecuencia_ajustada(F0, obesidad, F) :-
    F is min(F0, 3).

% Ajuste por edad mayor: limitar a 4 días máximo
frecuencia_ajustada(F0, _, F) :-
    F = F0.

% ─── REGLAS DE TIPO DE RUTINA ──────────────────────────────
% CORRECCIÓN CRÍTICA:
%   - Principiante SIEMPRE fullbody (adaptación neuromuscular)
%   - Intermedio: fullbody (≤3d), upper_lower (4-5d), torso_pierna (6d)
%   - Avanzado: upper_lower (≤3d), ppl (4-5d), especializado (6d+musculo)
%   - PPL NUNCA para principiante ni intermedio

% Principiante: siempre fullbody independientemente de los días
tipo_rutina_regla(principiante, _, _, fullbody) :- !.

% Intermedio con 1-3 días disponibles: fullbody
tipo_rutina_regla(intermedio, Dias, _, fullbody) :-
    Dias =< 3, !.

% Intermedio con 4-5 días: upper/lower (no PPL — aún no tiene base)
tipo_rutina_regla(intermedio, Dias, _, upper_lower) :-
    Dias >= 4, Dias =< 5, !.

% Intermedio con 6 días: torso/pierna (mayor volumen por sesión)
tipo_rutina_regla(intermedio, Dias, _, torso_pierna) :-
    Dias >= 6, !.

% Avanzado con 1-3 días: upper/lower (máximo eficiencia con pocos días)
tipo_rutina_regla(avanzado, Dias, _, upper_lower) :-
    Dias =< 3, !.

% Avanzado con 4-5 días: PPL (puede manejar especialización)
tipo_rutina_regla(avanzado, Dias, _, ppl) :-
    Dias >= 4, Dias =< 5, !.

% Avanzado con 6 días y objetivo ganar músculo: especializado por grupos
tipo_rutina_regla(avanzado, Dias, ganar_musculo, especializado) :-
    Dias >= 6, !.

% Avanzado con 6 días cualquier otro objetivo: torso/pierna
tipo_rutina_regla(avanzado, _, _, torso_pierna).

% ─── REGLAS DE INTENSIDAD ──────────────────────────────────
% CORRECCIÓN: principiante nunca va a alta ni muy_alta
%             Obesidad reduce siempre la intensidad

% Principiante: siempre baja (aprender técnica, adaptación neural)
intensidad_regla(principiante, _, _, baja) :- !.

% Obesidad independiente del nivel: baja para proteger articulaciones
intensidad_regla(_, _, obesidad, baja) :- !.

% Intermedio + perder grasa: moderada con cardio
intensidad_regla(intermedio, perder_grasa, _, moderada) :- !.

% Intermedio + ganar músculo + IMC normal o bajo: alta
intensidad_regla(intermedio, ganar_musculo, normal, alta)    :- !.
intensidad_regla(intermedio, ganar_musculo, bajo_peso, alta) :- !.

% Intermedio + cualquier objetivo + sobrepeso: moderada
intensidad_regla(intermedio, _, sobrepeso, moderada) :- !.

% Intermedio + mantener: moderada
intensidad_regla(intermedio, mantener, _, moderada) :- !.

% Avanzado + ganar músculo: muy alta (máximo estímulo)
intensidad_regla(avanzado, ganar_musculo, _, muy_alta) :- !.

% Avanzado + perder grasa: alta (mantener músculo en déficit)
intensidad_regla(avanzado, perder_grasa, _, alta) :- !.

% Avanzado + mantener: moderada-alta
intensidad_regla(avanzado, mantener, _, alta) :- !.

% Fallback seguro
intensidad_regla(_, _, _, moderada).

% ─── REGLAS DE CARDIO ──────────────────────────────────────

% Perder grasa siempre incluye cardio (déficit calórico)
cardio_regla(_, perder_grasa, _, si) :- !.

% Obesidad siempre incluye cardio (salud cardiovascular)
cardio_regla(_, _, obesidad, si) :- !.

% Sobrepeso incluye cardio moderado
cardio_regla(_, _, sobrepeso, si) :- !.

% Principiante que quiere mantener: cardio ligero para hábito
cardio_regla(principiante, mantener, _, si) :- !.

% Ganar músculo con IMC normal o bajo: sin cardio (maximizar superávit)
cardio_regla(_, ganar_musculo, normal, no)    :- !.
cardio_regla(_, ganar_musculo, bajo_peso, no) :- !.

% Avanzado mantenimiento: sin cardio específico (volumen entrena suficiente)
cardio_regla(avanzado, mantener, _, no) :- !.

% Fallback: sin cardio
cardio_regla(_, _, _, no).

% ─── AJUSTE POR EDAD ───────────────────────────────────────
% CORRECCIÓN: mayores bajan UN nivel de intensidad, no saltan dos

ajuste_edad_intensidad(muy_alta, mayor, alta)    :- !.
ajuste_edad_intensidad(alta,     mayor, moderada) :- !.
ajuste_edad_intensidad(I, _, I).

% ─── AJUSTE POR SOMATOTIPO ─────────────────────────────────
% CORRECCIÓN: endomorfo añade cardio incluso si la regla base dijo no

ajuste_somatotipo_cardio(no, endomorfo, si) :- !.
ajuste_somatotipo_cardio(C, _, C).

% ─── VALIDACIONES DE SEGURIDAD ─────────────────────────────
% Reglas extra de protección combinada

% Principiante mayor con obesidad: forzar fullbody + baja intensidad
nivel_seguro(principiante, mayor, obesidad, fullbody, baja, 2).

% Adulto con obesidad: limitar días y tipo
nivel_seguro(_, adulto, obesidad, fullbody, baja, 3).