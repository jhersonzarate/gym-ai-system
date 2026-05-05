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
        password=os.getenv("DB_PASSWORD", "rrr100911")
    )

def init_db():
    conn = get_connection()
    cur = conn.cursor()
    schema_path = os.path.join(os.path.dirname(__file__), "..", "..", "database", "schema.sql")
    with open(schema_path, "r") as f:
        cur.execute(f.read())
    conn.commit()
    cur.close()
    conn.close()