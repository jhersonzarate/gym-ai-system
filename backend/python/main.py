# backend/python/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import router
from db import init_db

init_db()  # Inicializar la base de datos al iniciar la aplicación

app = FastAPI(
    title="Gym Expert System API",
    description="Sistema Experto Multilenguaje — Rutinas y Nutrición",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")

@app.get("/")
def root():
    return {"status": "ok", "sistema": "Gym Expert System v1.0"}