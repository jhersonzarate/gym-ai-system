% ============================================================
% backend/prolog/inferencia.pl
% Motor de inferencia principal con explicabilidad — CORREGIDO
% Correcciones:
%   - Explicaciones más precisas para PPL/Especializado
%   - Nuevo texto para reglas de seguridad por edad+IMC
%   - exp_cardio maneja todos los casos correctamente
% ============================================================

:- use_module(library(lists)).

% ─── PREDICADO PRINCIPAL ───────────────────────────────────

recomendar(Edad, Nivel, Objetivo, Dias, ImcCat, Somatotipo,
           FrecuenciaFinal, TipoFinal, IntensidadFinal,
           CardioFinal, Explicacion) :-

    % 1. Clasificar edad
    clasificar_edad(Edad, CatEdad),

    % 2. Calcular frecuencia base y ajustarla
    frecuencia_recomendada(Nivel, Dias, FrecBase),
    frecuencia_ajustada(FrecBase, ImcCat, FrecuenciaFinal),

    % 3. Determinar tipo de rutina
    tipo_rutina_regla(Nivel, Dias, Objetivo, TipoFinal),

    % 4. Determinar intensidad base y ajustar por edad
    intensidad_regla(Nivel, Objetivo, ImcCat, IntBase),
    ajuste_edad_intensidad(IntBase, CatEdad, IntensidadFinal),

    % 5. Determinar cardio y ajustar por somatotipo
    cardio_regla(Nivel, Objetivo, ImcCat, CardioBase),
    ajuste_somatotipo_cardio(CardioBase, Somatotipo, CardioFinal),

    % 6. Generar explicación completa
    generar_explicacion(
        Nivel, Objetivo, Dias, ImcCat, CatEdad, Somatotipo,
        FrecuenciaFinal, TipoFinal, IntensidadFinal, CardioFinal,
        Explicacion
    ).

% ─── GENERADOR DE EXPLICACIÓN ──────────────────────────────

generar_explicacion(Nivel, Objetivo, Dias, ImcCat, CatEdad, Somatotipo,
                    Frecuencia, Tipo, Intensidad, Cardio, Explicacion) :-
    exp_nivel(Nivel, E1),
    exp_objetivo(Objetivo, E2),
    exp_dias(Dias, Frecuencia, E3),
    exp_imc(ImcCat, E4),
    exp_tipo(Tipo, Nivel, E5),
    exp_intensidad(Intensidad, Nivel, E6),
    exp_cardio(Cardio, Objetivo, ImcCat, E7),
    exp_somatotipo(Somatotipo, E8),
    exp_edad(CatEdad, E9),
    atomic_list_concat(
        [E1, E2, E3, E4, E5, E6, E7, E8, E9],
        '|',
        Explicacion
    ).

% ─── TEXTOS EXPLICATIVOS — NIVEL ───────────────────────────

exp_nivel(principiante,
    'Nivel principiante: la prioridad es aprendizaje técnico y adaptación neuromuscular — fullbody para máxima frecuencia de práctica').
exp_nivel(intermedio,
    'Nivel intermedio: el sistema nervioso ya adaptado permite mayor volumen total e intensidades moderadas-altas').
exp_nivel(avanzado,
    'Nivel avanzado: se requiere especialización y periodización para superar mesetas de adaptación').

% ─── TEXTOS EXPLICATIVOS — OBJETIVO ────────────────────────

exp_objetivo(perder_grasa,
    'Objetivo pérdida de grasa: déficit calórico de 300-500 kcal/día combinado con entrenamiento de resistencia para preservar músculo').
exp_objetivo(ganar_musculo,
    'Objetivo hipertrofia: superávit calórico de 200-300 kcal/día con sobrecarga progresiva como estímulo principal de síntesis proteica').
exp_objetivo(mantener,
    'Objetivo mantenimiento: equilibrio entre ingesta y gasto — el entrenamiento preserva la composición corporal actual').

% ─── TEXTOS EXPLICATIVOS — DÍAS ────────────────────────────

exp_dias(Dias, Frecuencia, Texto) :-
    atomic_list_concat(
        ['Disponibilidad de ', Dias, ' días — se asignan ', Frecuencia,
         ' sesiones efectivas semanales respetando recuperación mínima de 48h entre grupos musculares'],
        Texto
    ).

% ─── TEXTOS EXPLICATIVOS — IMC ─────────────────────────────

exp_imc(bajo_peso,
    'IMC bajo: se prioriza ganancia de masa muscular con alta densidad calórica y mínimo cardio para maximizar el superávit').
exp_imc(normal,
    'IMC normal: condición física óptima — el sistema puede aplicar el protocolo estándar para el objetivo indicado').
exp_imc(sobrepeso,
    'IMC sobrepeso: se incluye cardio moderado 2-3 sesiones/semana y se controla el superávit calórico').
exp_imc(obesidad,
    'IMC obesidad: intensidad reducida para proteger articulaciones y sistema cardiovascular — progresión gradual obligatoria').

% ─── TEXTOS EXPLICATIVOS — TIPO DE RUTINA ──────────────────

exp_tipo(fullbody, principiante,
    'Rutina Full Body: estimula todos los grupos musculares en cada sesión — máxima frecuencia de práctica técnica para principiantes (2-3x/semana por grupo)').
exp_tipo(fullbody, _,
    'Rutina Full Body: alta frecuencia de estímulo por grupo muscular — ideal cuando los días disponibles son limitados').
exp_tipo(upper_lower, _,
    'Rutina Upper/Lower: división en tren superior e inferior — permite 2 estímulos semanales por grupo con volumen adecuado').
exp_tipo(ppl, avanzado,
    'Rutina Push/Pull/Legs: especialización avanzada por patrón de movimiento — requiere mínimo 12-18 meses de experiencia previa y alta capacidad de recuperación').
exp_tipo(ppl, _,
    'Rutina Push/Pull/Legs: máxima especialización por patrón de movimiento').
exp_tipo(torso_pierna, _,
    'Rutina Torso/Pierna: híbrido eficiente para frecuencia media-alta — combina volumen de upper/lower con especialización de PPL').
exp_tipo(especializado, _,
    'Rutina Especializada: días dedicados por grupo muscular — máximo volumen y detalle — solo para atletas avanzados con recuperación optimizada').

% ─── TEXTOS EXPLICATIVOS — INTENSIDAD ──────────────────────

exp_intensidad(baja, principiante,
    'Intensidad baja: carga al 50-60% del 1RM — el objetivo no es el peso sino dominar la técnica de cada patrón de movimiento').
exp_intensidad(baja, _,
    'Intensidad baja: cargas moderadas que protegen el sistema articular — recuperación prioritaria sobre el estímulo máximo').
exp_intensidad(moderada, _,
    'Intensidad moderada: rango de hipertrofia 8-12 repeticiones al 67-75% del 1RM — equilibrio óptimo entre volumen e intensidad').
exp_intensidad(alta, _,
    'Intensidad alta: 6-8 repeticiones al 75-85% del 1RM — zona de fuerza-hipertrofia que maximiza el reclutamiento de fibras tipo II').
exp_intensidad(muy_alta, _,
    'Intensidad muy alta: 3-6 repeticiones al 85-100% del 1RM — entrenamiento de fuerza máxima y potencia — solo para avanzados con técnica consolidada').

% ─── TEXTOS EXPLICATIVOS — CARDIO ──────────────────────────

exp_cardio(si, perder_grasa, _,
    'Cardio incluido: esencial para ampliar el déficit calórico — se recomienda LISS 30-40 min (zona aeróbica 60-70% FCmax) o HIIT 20-25 min 2x/semana').
exp_cardio(si, _, obesidad,
    'Cardio incluido: caminata inclinada o bicicleta de bajo impacto — protege articulaciones mientras mejora capacidad cardiovascular').
exp_cardio(si, _, sobrepeso,
    'Cardio incluido: 2-3 sesiones semanales de cardio moderado para acelerar la reducción de grasa corporal').
exp_cardio(si, mantener, _,
    'Cardio incluido: 2-3 sesiones semanales para salud cardiovascular y control del peso a largo plazo').
exp_cardio(si, _, _,
    'Cardio incluido: beneficioso para la salud metabólica general y la recuperación entre sesiones de fuerza').
exp_cardio(no, ganar_musculo, _,
    'Cardio omitido o mínimo: para maximizar el superávit calórico disponible para síntesis proteica muscular — el cardio excesivo compite con las adaptaciones de fuerza').
exp_cardio(no, _, _,
    'Cardio no prioritario en este plan — el entrenamiento de fuerza cubre el gasto calórico y las adaptaciones cardiovasculares básicas').

% ─── TEXTOS EXPLICATIVOS — SOMATOTIPO ──────────────────────

exp_somatotipo(ectomorfo,
    'Somatotipo ectomorfo: metabolismo acelerado — se requiere alta ingesta calórica (superávit real) y volumen de entrenamiento moderado para evitar catabolismo').
exp_somatotipo(mesomorfo,
    'Somatotipo mesomorfo: respuesta muscular favorable — el protocolo estándar produce resultados óptimos sin ajustes especiales').
exp_somatotipo(endomorfo,
    'Somatotipo endomorfo: tendencia a acumular grasa — se añade cardio complementario y se controla estrictamente el superávit calórico').

% ─── TEXTOS EXPLICATIVOS — EDAD ────────────────────────────

exp_edad(joven,
    'Rango etario joven (15-29): alta capacidad de recuperación hormonal — puede tolerar mayor frecuencia y volumen de entrenamiento').
exp_edad(adulto,
    'Rango etario adulto (30-49): la recuperación requiere más atención — el descanso entre sesiones es tan importante como el entrenamiento').
exp_edad(mayor,
    'Rango etario mayor (50+): se reduce la intensidad máxima para proteger el sistema osteoarticular — el calentamiento y la movilidad son obligatorios').