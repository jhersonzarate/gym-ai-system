% ============================================================
% backend/prolog/reglas.pl
% Reglas del motor experto
% ============================================================

:- use_module(library(lists)).

% ─── CLASIFICACIÓN DE EDAD ─────────────────────────────────

clasificar_edad(Edad, joven)  :- Edad >= 15, Edad =< 29.
clasificar_edad(Edad, adulto) :- Edad >= 30, Edad =< 49.
clasificar_edad(Edad, mayor)  :- Edad >= 50.

% ─── REGLAS DE FRECUENCIA (5 reglas) ───────────────────────

frecuencia_recomendada(principiante, Dias, F) :-
    F is min(Dias, 3).

frecuencia_recomendada(intermedio, Dias, F) :-
    F is min(Dias, 5).

frecuencia_recomendada(avanzado, Dias, F) :-
    F is min(Dias, 6).

% Ajuste por obesidad: limitar frecuencia
frecuencia_ajustada(F0, obesidad, F) :-
    F is min(F0, 3).
frecuencia_ajustada(F, _, F).

% ─── REGLAS DE TIPO DE RUTINA (8 reglas) ───────────────────

% Principiante siempre fullbody sin importar días
tipo_rutina_regla(principiante, _, _, fullbody) :- !.

% Intermedio con pocos días: fullbody
tipo_rutina_regla(intermedio, Dias, _, fullbody) :-
    Dias =< 3, !.

% Intermedio con 4 días: upper/lower
tipo_rutina_regla(intermedio, Dias, _, upper_lower) :-
    Dias >= 4, Dias =< 5, !.

% Intermedio con más días: torso_pierna
tipo_rutina_regla(intermedio, Dias, _, torso_pierna) :-
    Dias >= 6, !.

% Avanzado con pocos días: upper_lower
tipo_rutina_regla(avanzado, Dias, _, upper_lower) :-
    Dias =< 4, !.

% Avanzado con 5 días: PPL
tipo_rutina_regla(avanzado, Dias, _, ppl) :-
    Dias >= 5, Dias =< 6, !.

% Avanzado con máximos días y músculo: especializado
tipo_rutina_regla(avanzado, Dias, ganar_musculo, especializado) :-
    Dias >= 6, !.

% Caso general avanzado
tipo_rutina_regla(avanzado, _, _, ppl).

% ─── REGLAS DE INTENSIDAD (6 reglas) ───────────────────────

intensidad_regla(principiante, _, _, baja).

intensidad_regla(intermedio, perder_grasa, _, moderada).

intensidad_regla(intermedio, ganar_musculo, normal, alta).
intensidad_regla(intermedio, ganar_musculo, bajo_peso, alta).

intensidad_regla(intermedio, _, sobrepeso, moderada).
intensidad_regla(intermedio, _, obesidad, baja).

intensidad_regla(avanzado, _, obesidad, moderada).
intensidad_regla(avanzado, ganar_musculo, _, muy_alta).
intensidad_regla(avanzado, perder_grasa, _, alta).
intensidad_regla(avanzado, mantener, _, moderada).

% Fallback
intensidad_regla(_, _, _, moderada).

% ─── REGLAS DE CARDIO (6 reglas) ───────────────────────────

cardio_regla(_, perder_grasa, _, si) :- !.

cardio_regla(_, _, obesidad, si) :- !.

cardio_regla(_, _, sobrepeso, si) :- !.

cardio_regla(principiante, mantener, _, si) :- !.

cardio_regla(_, ganar_musculo, normal, no) :- !.
cardio_regla(_, ganar_musculo, bajo_peso, no) :- !.

cardio_regla(avanzado, mantener, _, no) :- !.

cardio_regla(_, _, _, no).

% ─── AJUSTE POR EDAD ───────────────────────────────────────

ajuste_edad_intensidad(muy_alta, mayor, alta)  :- !.
ajuste_edad_intensidad(alta,     mayor, moderada) :- !.
ajuste_edad_intensidad(I, _, I).

% ─── AJUSTE POR SOMATOTIPO ─────────────────────────────────

ajuste_somatotipo_cardio(no, endomorfo, si) :- !.
ajuste_somatotipo_cardio(C, _, C).