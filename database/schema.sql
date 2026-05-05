-- database/schema.sql

CREATE TABLE IF NOT EXISTS usuarios (
    id            SERIAL PRIMARY KEY,
    nombre        VARCHAR(100) NOT NULL,
    email         VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
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
    id           SERIAL PRIMARY KEY,
    usuario_id   INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    perfil_json  JSONB,
    rutina_json  JSONB,
    macros_json  JSONB,
    created_at   TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_historial_usuario ON historial(usuario_id);
CREATE INDEX IF NOT EXISTS idx_rutinas_usuario   ON rutinas(usuario_id);