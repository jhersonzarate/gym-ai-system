# backend/python/db.py
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

def get_connection():
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=os.getenv("DB_PORT", "5432"),
        database=os.getenv("DB_NAME", "gym_expert"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD")  # ← sin fallback hardcodeado
    )

def init_db():
    """
    Inicializa el esquema solo si las tablas no existen todavía.
    Evita ejecutar el SQL completo en cada arranque.
    """
    conn = get_connection()
    cur = conn.cursor()
    try:
        # Verificar si las tablas ya existen antes de ejecutar el schema
        cur.execute("""
            SELECT COUNT(*) FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name IN ('usuarios', 'historial', 'rutinas', 'perfiles')
        """)
        existing_tables = cur.fetchone()[0]

        if existing_tables < 4:
            # Solo ejecutar schema si faltan tablas
            schema_path = os.path.join(
                os.path.dirname(__file__), "..", "..", "database", "schema.sql"
            )
            with open(schema_path, "r", encoding="utf-8") as f:
                cur.execute(f.read())
            conn.commit()
            print("[DB] Esquema inicializado correctamente.")
        else:
            print("[DB] Tablas ya existentes, omitiendo schema.sql.")
    finally:
        cur.close()
        conn.close()