import json
from typing import List, Any
import httpx
from google import genai
from google.genai import types
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from config import settings
from tools import TELEMETRY_API_BASE

client = genai.Client(
    api_key=settings.GEMINI_API_KEY,
    http_options={"api_version": "v1beta"}
)

def inspect_service_health(service_name: str) -> str:
    """Consulta metricas de rendimiento y salud en tiempo real desde el microservicio de telemetria .NET."""
    try:
        with httpx.Client(timeout=5.0) as http_client:
            res = http_client.get(f"{TELEMETRY_API_BASE}/health/{service_name}")
            return res.text if res.status_code == 200 else json.dumps({"error": f"Servicio {service_name} no encontrado"})
    except Exception as e:
        return json.dumps({"error": f"Error de conexion: {str(e)}"})

def query_sanitized_logs(service_name: str, limit: int = 3) -> str:
    """Obtiene logs sanitizados en tiempo real desde el microservicio de telemetria .NET."""
    try:
        with httpx.Client(timeout=5.0) as http_client:
            res = http_client.get(f"{TELEMETRY_API_BASE}/logs/{service_name}", params={"limit": limit})
            return res.text if res.status_code == 200 else json.dumps({"error": "No se encontraron logs"})
    except Exception as e:
        return json.dumps({"error": f"Error de conexion: {str(e)}"})

def get_service_topology() -> str:
    """Devuelve el mapa de dependencias y arquitectura de microservicios."""
    try:
        with httpx.Client(timeout=5.0) as http_client:
            res = http_client.get(f"{TELEMETRY_API_BASE}/topology")
            return res.text if res.status_code == 200 else json.dumps({"error": "Error al consultar topologia"})
    except Exception as e:
        return json.dumps({"error": f"Error de conexion: {str(e)}"})

def restart_service(service_name: str) -> str:
    """Reinicia el servicio para mitigar estados criticos o fugas de memoria."""
    try:
        with httpx.Client(timeout=5.0) as http_client:
            res = http_client.post(f"{TELEMETRY_API_BASE}/actions/restart/{service_name}")
            return res.text if res.status_code == 200 else json.dumps({"error": f"No se pudo reiniciar {service_name}"})
    except Exception as e:
        return json.dumps({"error": f"Error de conexion: {str(e)}"})

def scale_service(service_name: str, replicas: int = 3) -> str:
    """Escala las replicas del microservicio para mitigar saturacion de CPU o concurrencia."""
    try:
        with httpx.Client(timeout=5.0) as http_client:
            res = http_client.post(f"{TELEMETRY_API_BASE}/actions/scale/{service_name}?replicas={replicas}")
            return res.text if res.status_code == 200 else json.dumps({"error": f"No se pudo escalar {service_name}"})
    except Exception as e:
        return json.dumps({"error": f"Error de conexion: {str(e)}"})

def send_sre_alert(channel: str, severity: str, message: str) -> str:
    """Envia una alerta formateada a los canales de guardia (ej. ops-war-room, sre-alerts) notificando remediaciones aplicadas."""
    try:
        payload = {
            "channel": channel,
            "severity": severity,
            "message": message
        }
        with httpx.Client(timeout=5.0) as http_client:
            res = http_client.post(f"{TELEMETRY_API_BASE}/notifications/webhook", json=payload)
            return res.text if res.status_code == 200 else json.dumps({"error": "Fallo al enviar alerta"})
    except Exception as e:
        return json.dumps({"error": f"Error al notificar: {str(e)}"})

SYSTEM_INSTRUCTION = """Eres OpsSentinel, un agente autonomo de ingenieria de confiabilidad (SRE).
Tu funcion es diagnosticar, mitigar y reportar incidentes en la infraestructura.
Instrucciones:
1. Inspecciona la topologia ('get_service_topology') y el estado del servicio ('inspect_service_health').
2. Revisa eventos o errores en logs ('query_sanitized_logs').
3. Si el incidente involucra saturacion critica o caidas, ejecuta remediacion escalando ('scale_service') o reiniciando el servicio afectado ('restart_service').
4. SIEMPRE que ejecutes una remediacion, notifica al canal '#ops-war-room' usando 'send_sre_alert' detallando la accion tomada y la severidad.
5. En tu informe final, resume:
   - Diagnostico y Hallazgos.
   - Causa Raiz.
   - Acciones de Remediacion Ejecutadas.
   - Notificaciones Despachadas.
   - Recomendaciones preventivas a largo plazo.
"""

def run_agent_workflow(user_query: str) -> List[Any]:
    trace_messages = [
        SystemMessage(content=SYSTEM_INSTRUCTION),
        HumanMessage(content=user_query)
    ]
    
    chat = client.chats.create(
        model="gemini-3.5-flash-lite",
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_INSTRUCTION,
            temperature=0.1,
            tools=[
                inspect_service_health,
                query_sanitized_logs,
                get_service_topology,
                restart_service,
                scale_service,
                send_sre_alert
            ]
        )
    )

    response = chat.send_message(user_query)
    trace_messages.append(AIMessage(content=response.text))
    return trace_messages