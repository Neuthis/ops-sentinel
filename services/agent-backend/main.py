import json
import asyncio
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
import httpx

from database import engine, Base, get_db
from models import IncidentLog
from agent import run_agent_workflow
from tools import TELEMETRY_API_BASE

# Crear tablas en SQLite si no existen
Base.metadata.create_all(bind=engine)

app = FastAPI(title="OpsSentinel Agent API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DiagnoseRequest(BaseModel):
    incident_description: str
    service_name: Optional[str] = "payment-gateway"

class IncidentResponse(BaseModel):
    id: int
    description: str
    service_affected: str
    resolution: Optional[str] = None
    created_at: str

    class Config:
        from_attributes = True

@app.get("/api/v1/topology")
async def get_cluster_topology():
    """Consulta la topología directamente desde el microservicio .NET."""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            res = await client.get(f"{TELEMETRY_API_BASE}/topology")
            if res.status_code == 200:
                return res.json()
            raise HTTPException(status_code=res.status_code, detail="Error al consultar telemetría")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error conectando a telemetría: {str(e)}")

@app.get("/api/v1/incidents")
def list_incidents(db: Session = Depends(get_db)):
    """Devuelve los incidentes registrados en auditoría."""
    incidents = db.query(IncidentLog).order_by(IncidentLog.created_at.desc()).limit(20).all()
    return [
        {
            "id": inc.id,
            "description": inc.description,
            "service_affected": inc.service_affected,
            "resolution": inc.resolution,
            "created_at": inc.created_at.isoformat() if inc.created_at else ""
        }
        for inc in incidents
    ]

@app.post("/api/v1/diagnose")
def diagnose_incident_sync(request: DiagnoseRequest, db: Session = Depends(get_db)):
    """Diagnóstico síncrono estándar."""
    trace = run_agent_workflow(request.incident_description)
    resolution_text = trace[-1].content if trace else "No se obtuvo resolución."

    new_incident = IncidentLog(
        description=request.incident_description,
        service_affected=request.service_name or "payment-gateway",
        resolution=resolution_text,
        status="resolved"
    )
    db.add(new_incident)
    db.commit()
    db.refresh(new_incident)

    return {
        "status": "success",
        "incident_id": new_incident.id,
        "resolution": resolution_text
    }

@app.post("/api/v1/diagnose/stream")
async def diagnose_incident_stream(request: DiagnoseRequest, db: Session = Depends(get_db)):
    """Despacha el diagnóstico vía Server-Sent Events (SSE) en tiempo real."""
    async def event_generator():
        yield f"data: {json.dumps({'type': 'status', 'content': 'Iniciando inspección agéntica...'})}\n\n"
        await asyncio.sleep(0.4)

        yield f"data: {json.dumps({'type': 'status', 'content': 'Analizando topología y salud de pods...'})}\n\n"
        await asyncio.sleep(0.5)

        loop = asyncio.get_event_loop()
        trace = await loop.run_in_executor(None, run_agent_workflow, request.incident_description)
        resolution_text = trace[-1].content if trace else "No se obtuvo resolución."

        new_incident = IncidentLog(
            description=request.incident_description,
            service_affected=request.service_name or "payment-gateway",
            resolution=resolution_text,
            status="resolved"
        )
        db.add(new_incident)
        db.commit()
        db.refresh(new_incident)

        yield f"data: {json.dumps({'type': 'status', 'content': 'Remediación aplicada y guardada en auditoría.'})}\n\n"
        await asyncio.sleep(0.3)

        words = resolution_text.split(" ")
        chunk = []
        for word in words:
            chunk.append(word)
            if len(chunk) >= 3:
                yield f"data: {json.dumps({'type': 'token', 'content': ' '.join(chunk) + ' '})}\n\n"
                chunk = []
                await asyncio.sleep(0.03)

        if chunk:
            yield f"data: {json.dumps({'type': 'token', 'content': ' '.join(chunk)})}\n\n"

        yield f"data: {json.dumps({'type': 'done', 'id': new_incident.id})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")