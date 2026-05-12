-- database/schema.sql
-- VERSION ACTUALIZADA - incluye foto_perfil en usuarios

CREATE TABLE IF NOT EXISTS usuarios (
    id            SERIAL PRIMARY KEY,
    nombre        VARCHAR(100) NOT NULL,
    email         VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    foto_perfil   TEXT DEFAULT NULL,       -- imagen en base64 (data:image/...;base64,...)
    created_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS perfiles (
    id               SERIAL PRIMARY KEY,
    usuario_id       INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    edad             INTEGER,
    peso             NUMERIC(5,2),
    altura           NUMERIC(5,2),
    sexo             VARCHAR(20),
    nivel            VARCHAR(30),
    objetivo         VARCHAR(30),
    dias_disponibles INTEGER,
    imc              NUMERIC(5,2),
    bmr              NUMERIC(8,2),
    tdee             NUMERIC(8,2),
    somatotipo       VARCHAR(20),
    created_at       TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rutinas (
    id           SERIAL PRIMARY KEY,
    usuario_id   INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo_rutina  VARCHAR(30),
    frecuencia   INTEGER,
    intensidad   VARCHAR(20),
    usa_cardio   BOOLEAN,
    rutina_json  JSONB,
    created_at   TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS historial (
    id               SERIAL PRIMARY KEY,
    usuario_id       INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    perfil_json      JSONB,
    rutina_json      JSONB,
    macros_json      JSONB,
    ia_decision_json JSONB,
    progreso_json    JSONB,
    created_at       TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_historial_usuario ON historial(usuario_id);
CREATE INDEX IF NOT EXISTS idx_rutinas_usuario   ON rutinas(usuario_id);

-- Migración segura: agregar columnas si no existen (para bases de datos ya creadas)
DO $$
BEGIN
    -- ia_decision_json en historial
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='historial' AND column_name='ia_decision_json'
    ) THEN
        ALTER TABLE historial ADD COLUMN ia_decision_json JSONB;
    END IF;

    -- foto_perfil en usuarios
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='usuarios' AND column_name='foto_perfil'
    ) THEN
        ALTER TABLE usuarios ADD COLUMN foto_perfil TEXT DEFAULT NULL;
        RAISE NOTICE 'Columna foto_perfil agregada a usuarios.';
    END IF;
END
$$;