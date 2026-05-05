% ============================================================
% backend/prolog/inferencia.pl
% Motor de inferencia principal con explicabilidad
% ============================================================

:- use_module(library(lists)).

% ─── PREDICADO PRINCIPAL ───────────────────────────────────

recomendar(Edad, Nivel, Objetivo, Dias, ImcCat, Somatotipo,
           FrecuenciaFinal, TipoFinal, IntensidadFinal,
           CardioFinal, Explicacion) :-

    % 1. Clasificar edad
    clasificar_edad(Edad, CatEdad),

    % 2. Calcular frecuencia base
    frecuencia_recomendada(Nivel, Dias, FrecBase),
    frecuencia_ajustada(FrecBase, ImcCat, FrecuenciaFinal),

    % 3. Determinar tipo de rutina
    tipo_rutina_regla(Nivel, Dias, Objetivo, TipoBase),
    TipoFinal = TipoBase,

    % 4. Determinar intensidad
    intensidad_regla(Nivel, Objetivo, ImcCat, IntBase),
    ajuste_edad_intensidad(IntBase, CatEdad, IntensidadFinal),

    % 5. Determinar cardio
    cardio_regla(Nivel, Objetivo, ImcCat, CardioBase),
    ajuste_somatotipo_cardio(CardioBase, Somatotipo, CardioFinal),

    % 6. Generar explicación
    generar_explicacion(
        Nivel, Objetivo, Dias, ImcCat, CatEdad, Somatotipo,
        FrecuenciaFinal, TipoFinal, IntensidadFinal, CardioFinal,
        Explicacion
    ).

% ─── GENERADOR DE EXPLICACIÓN ──────────────────────────────

generar_explicacion(Nivel, Objetivo, Dias, ImcCat, CatEdad, Somatotipo,
                    Frecuencia, Tipo, Intensidad, Cardio, Explicacion) :-

    % Explicación nivel
    exp_nivel(Nivel, E1),

    % Explicación objetivo
    exp_objetivo(Objetivo, E2),

    % Explicación días
    exp_dias(Dias, Frecuencia, E3),

    % Explicación IMC
    exp_imc(ImcCat, E4),

    % Explicación tipo rutina
    exp_tipo(Tipo, E5),

    % Explicación intensidad
    exp_intensidad(Intensidad, E6),

    % Explicación cardio
    exp_cardio(Cardio, Objetivo, E7),

    % Explicación somatotipo
    exp_somatotipo(Somatotipo, E8),

    % Explicación edad
    exp_edad(CatEdad, E9),

    atomic_list_concat(
        [E1, E2, E3, E4, E5, E6, E7, E8, E9],
        '|',
        Explicacion
    ).

% ─── TEXTOS EXPLICATIVOS ───────────────────────────────────

exp_nivel(principiante,
    'Nivel principiante: se prioriza adaptación neuromuscular y técnica de movimiento').
exp_nivel(intermedio,
    'Nivel intermedio: el cuerpo puede manejar mayor volumen e intensidad de entrenamiento').
exp_nivel(avanzado,
    'Nivel avanzado: se aplica especialización y periodización para romper mesetas').

exp_objetivo(perder_grasa,
    'Objetivo perder grasa: se genera déficit calórico combinando ejercicio y nutrición').
exp_objetivo(ganar_musculo,
    'Objetivo ganar músculo: superávit calórico moderado con énfasis en sobrecarga progresiva').
exp_objetivo(mantener,
    'Objetivo mantenimiento: equilibrio entre ingesta y gasto energético').

exp_dias(Dias, Frecuencia, Texto) :-
    atomic_list_concat(
        ['Disponibilidad de ', Dias, ' días — se asignan ', Frecuencia, ' sesiones semanales'],
        Texto
    ).

exp_imc(bajo_peso,    'IMC bajo: se prioriza ganancia de masa muscular y densidad calórica').
exp_imc(normal,       'IMC normal: condición física óptima para cualquier objetivo').
exp_imc(sobrepeso,    'IMC sobrepeso: se incluye cardio moderado y control calórico').
exp_imc(obesidad,     'IMC obesidad: intensidad reducida para proteger articulaciones y corazón').

exp_tipo(fullbody,    'Rutina Full Body: todos los grupos musculares en cada sesión, ideal para baja frecuencia').
exp_tipo(upper_lower, 'Rutina Upper/Lower: división por tren superior e inferior, mayor volumen por grupo').
exp_tipo(ppl,         'Rutina Push/Pull/Legs: máxima especialización por patrón de movimiento').
exp_tipo(torso_pierna,'Rutina Torso/Pierna: híbrido eficiente para frecuencia media-alta').
exp_tipo(especializado,'Rutina Especializada: días dedicados por grupo muscular, máximo volumen').

exp_intensidad(baja,     'Intensidad baja: cargas moderadas, técnica perfecta, recuperación prioritaria').
exp_intensidad(moderada, 'Intensidad moderada: rango hipertrofia 8-12 reps, esfuerzo controlado').
exp_intensidad(alta,     'Intensidad alta: cargas pesadas 5-8 reps, fuerza-hipertrofia combinada').
exp_intensidad(muy_alta, 'Intensidad muy alta: trabajo de fuerza máxima y potencia muscular').

exp_cardio(si, perder_grasa, 'Cardio incluido: esencial para ampliar déficit calórico en objetivo de pérdida de grasa').
exp_cardio(si, mantener,     'Cardio incluido: mejora salud cardiovascular y control del peso corporal').
exp_cardio(si, _,            'Cardio incluido: beneficioso para salud metabólica y recuperación').
exp_cardio(no, ganar_musculo,'Cardio omitido: se maximiza superávit calórico para síntesis proteica muscular').
exp_cardio(no, _,            'Cardio no prioritario: el enfoque está en fuerza y composición corporal').

exp_somatotipo(ectomorfo,  'Somatotipo ectomorfo: metabolismo rápido — alta ingesta calórica y volumen moderado').
exp_somatotipo(mesomorfo,  'Somatotipo mesomorfo: respuesta muscular óptima — programa estándar efectivo').
exp_somatotipo(endomorfo,  'Somatotipo endomorfo: tendencia a acumular grasa — cardio extra y déficit controlado').

exp_edad(joven,  'Rango etario joven: capacidad de recuperación alta, puede tolerar mayor frecuencia').
exp_edad(adulto, 'Rango etario adulto: equilibrio entre carga y recuperación, descanso prioritario').
exp_edad(mayor,  'Rango etario mayor: se reduce intensidad máxima para proteger sistema osteoarticular').