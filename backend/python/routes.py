# backend/python/routes.py
from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
import json

from db import get_connection
from auth import hash_password, verify_password, create_token, decode_token
from calculos import (
    calcular_imc, clasificar_imc, calcular_bmr,
    calcular_tdee, calcular_macros, determinar_somatotipo, simular_progreso
)
from integracion_prolog import consultar_prolog
from integracion_scala import generar_rutina_scala

router = APIRouter()

# ─── MODELOS ──────────────────────────────────────────────────────────────────

class RegistroRequest(BaseModel):
    nombre: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1)

class PerfilRequest(BaseModel):
    edad: int             = Field(ge=15,  le=80,  description="Edad entre 15 y 80 años")
    peso: float           = Field(gt=30,  lt=300, description="Peso en kg (30–300)")
    altura: float         = Field(gt=100, lt=250, description="Altura en cm (100–250)")
    sexo: str             = Field(pattern="^(masculino|femenino)$")
    nivel: str            = Field(pattern="^(principiante|intermedio|avanzado)$")
    objetivo: str         = Field(pattern="^(perder_grasa|ganar_musculo|mantener)$")
    dias_disponibles: int = Field(ge=2, le=7, description="Días disponibles (2–7)")

# ─── HELPERS ──────────────────────────────────────────────────────────────────

def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token requerido")
    token = authorization.split(" ")[1]
    user = decode_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")
    return user

# ─── ENDPOINTS ────────────────────────────────────────────────────────────────

@router.post("/register")
def register(data: RegistroRequest):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT id FROM usuarios WHERE email = %s", (data.email,))
        if cur.fetchone():
            raise HTTPException(status_code=400, detail="Este correo ya está registrado")

        hashed = hash_password(data.password)
        cur.execute(
            "INSERT INTO usuarios (nombre, email, password_hash) VALUES (%s, %s, %s) RETURNING id",
            (data.nombre, data.email, hashed)
        )
        user_id = cur.fetchone()[0]
        conn.commit()
        token = create_token(user_id, data.email)
        return {
            "message": "Cuenta creada exitosamente",
            "token": token,
            "user_id": user_id,
            "nombre": data.nombre
        }
    finally:
        cur.close()
        conn.close()


@router.post("/login")
def login(data: LoginRequest):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            "SELECT id, nombre, password_hash FROM usuarios WHERE email = %s",
            (data.email,)
        )
        row = cur.fetchone()
        if not row or not verify_password(data.password, row[2]):
            raise HTTPException(status_code=401, detail="Correo o contraseña incorrectos")

        token = create_token(row[0], data.email)
        return {"token": token, "user_id": row[0], "nombre": row[1]}
    finally:
        cur.close()
        conn.close()


@router.post("/generate-routine")
def generate_routine(perfil: PerfilRequest, user=Depends(get_current_user)):
    # 1. Cálculos físicos
    altura_m = perfil.altura / 100

    try:
        imc = calcular_imc(perfil.peso, altura_m)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    imc_cat = clasificar_imc(imc)
    bmr = calcular_bmr(perfil.peso, perfil.altura, perfil.edad, perfil.sexo)
    tdee = calcular_tdee(bmr, perfil.dias_disponibles)
    macros = calcular_macros(tdee, perfil.objetivo)
    somatotipo = determinar_somatotipo(imc, perfil.objetivo)
    progreso = simular_progreso(perfil.objetivo)

    # 2. Consulta al motor de inferencia (Prolog / fallback Python)
    perfil_dict = {
        **perfil.model_dump(),
        "imc": imc,
        "imc_categoria": imc_cat,
        "somatotipo": somatotipo
    }
    prolog_result = consultar_prolog(perfil_dict)

    # 3. Añadir objetivo en ia_decision
    prolog_result["objetivo"] = perfil.objetivo

    # 4. Generación rutina (Scala JAR / fallback Python)
    scala_params = {
        **perfil.model_dump(),
        **prolog_result
    }
    rutina = generar_rutina_scala(scala_params)

    # 5. Guardar en historial
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            INSERT INTO historial (usuario_id, perfil_json, rutina_json, macros_json, ia_decision_json)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id
        """, (
            user["user_id"],
            json.dumps(perfil_dict),
            json.dumps(rutina),
            json.dumps(macros),
            json.dumps(prolog_result),
        ))
        historial_id = cur.fetchone()[0]
        conn.commit()
    finally:
        cur.close()
        conn.close()

    return {
        "id": historial_id,
        "perfil": {
            "imc": imc,
            "imc_categoria": imc_cat,
            "bmr": bmr,
            "tdee": tdee,
            "somatotipo": somatotipo,
            "objetivo": perfil.objetivo,
            "nivel": perfil.nivel,
            "dias_disponibles": perfil.dias_disponibles,
        },
        "nutricion": macros,
        "ia_decision": prolog_result,
        "rutina": rutina,
        "progreso_simulado": progreso
    }


@router.get("/history")
def get_history(user=Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT id, created_at, perfil_json, rutina_json, macros_json, ia_decision_json
            FROM historial
            WHERE usuario_id = %s
            ORDER BY created_at DESC
            LIMIT 20
        """, (user["user_id"],))
        rows = cur.fetchall()
        history = []
        for row in rows:
            history.append({
                "id":          row[0],
                "fecha":       row[1].isoformat(),
                "perfil":      row[2],
                "rutina":      row[3],
                "macros":      row[4],
                "ia_decision": row[5],
            })
        return {"historial": history}
    finally:
        cur.close()
        conn.close()


@router.delete("/history/{item_id}")
def delete_history_item(item_id: int, user=Depends(get_current_user)):
    """Elimina un plan específico del historial del usuario."""
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            "DELETE FROM historial WHERE id = %s AND usuario_id = %s RETURNING id",
            (item_id, user["user_id"])
        )
        deleted = cur.fetchone()
        if not deleted:
            raise HTTPException(status_code=404, detail="Plan no encontrado")
        conn.commit()
        return {"message": "Plan eliminado", "id": item_id}
    finally:
        cur.close()
        conn.close()


@router.delete("/history")
def delete_all_history(user=Depends(get_current_user)):
    """Elimina todo el historial del usuario."""
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            "DELETE FROM historial WHERE usuario_id = %s",
            (user["user_id"],)
        )
        conn.commit()
        return {"message": "Historial eliminado completamente"}
    finally:
        cur.close()
        conn.close()


@router.get("/me")
def get_me(user=Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT id, nombre, email FROM usuarios WHERE id = %s", (user["user_id"],))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        return {"id": row[0], "nombre": row[1], "email": row[2]}
    finally:
        cur.close()
        conn.close()