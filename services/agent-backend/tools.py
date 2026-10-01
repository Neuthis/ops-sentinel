import json
import httpx
from typing import Dict, Any, List
from langchain_core.tools import tool

TELEMETRY_API_BASE = "http://127.0.0.1:5001/api/v1/telemetry"
# (Mantén tus funciones anteriores: inspect_service_health y query_sanitized_logs)

@tool
def get_service_topology() -> str:
    """Devuelve el mapa de dependencias y arquitectura de microservicios para identificar dependencias críticas y posibles caídas en cascada."""
    try:
        with httpx.Client(timeout=5.0) as client:
            response = client.get(f"{TELEMETRY_API_BASE}/topology")
            if response.status_code == 200:
                return response.text
            return json.dumps({"error": "No se pudo recuperar la topología"})
    except Exception as e:
        return json.dumps({"error": f"Fallo al conectar con .NET: {str(e)}"})


@tool
def inspect_service_health(service_name: str) -> Dict[str, Any]:
    """Consulta metricas de rendimiento y salud en tiempo real desde el microservicio de telemetria .NET."""
    try:
        with httpx.Client(timeout=5.0) as client:
            response = client.get(f"{TELEMETRY_API_BASE}/health/{service_name}")
            if response.status_code == 200:
                return response.json()
            return {"status": "unknown", "error": f"Servicio '{service_name}' no encontrado."}
    except Exception as e:
        return {"error": f"Fallo al conectar con el microservicio de telemetria: {str(e)}"}

@tool
def query_sanitized_logs(service_name: str, limit: int = 3) -> Dict[str, Any]:
    """Obtiene logs sanitizados en tiempo real desde el microservicio de telemetria .NET."""
    try:
        with httpx.Client(timeout=5.0) as client:
            response = client.get(f"{TELEMETRY_API_BASE}/logs/{service_name}", params={"limit": limit})
            if response.status_code == 200:
                return {"service": service_name, "logs": response.json()}
            return {"service": service_name, "logs": []}
    except Exception as e:
        return {"error": f"Fallo al obtener logs de telemetria: {str(e)}"}

@tool
def restart_service(service_name: str) -> str:
    """Ejecuta un reinicio forzado del pod/contenedor del servicio especificado para mitigar bloqueos o saturacion de recursos."""
    try:
        with httpx.Client(timeout=5.0) as client:
            res = client.post(f"{TELEMETRY_API_BASE}/actions/restart/{service_name}")
            return res.text if res.status_code == 200 else json.dumps({"error": f"Fallo al reiniciar {service_name}"})
    except Exception as e:
        return json.dumps({"error": f"Error de conexion con .NET: {str(e)}"})

@tool
def scale_service(service_name: str, replicas: int) -> str:
    """Escala horizontalmente el numero de replicas de un servicio para distribuir la carga concurrente."""
    try:
        with httpx.Client(timeout=5.0) as client:
            res = client.post(f"{TELEMETRY_API_BASE}/actions/scale/{service_name}", params={"replicas": replicas})
            return res.text if res.status_code == 200 else json.dumps({"error": f"Fallo al escalar {service_name}"})
    except Exception as e:
        return json.dumps({"error": f"Error de conexion con .NET: {str(e)}"})

@tool
def send_sre_alert(channel: str, severity: str, message: str) -> str:
    """Envía una alerta formateada a los canales de guardia (ej. ops-war-room, alerts) notificando el estado del incidente y las acciones tomadas."""
    try:
        payload = {
            "channel": channel,
            "severity": severity,
            "message": message
        }
        with httpx.Client(timeout=5.0) as client:
            res = client.post(f"{TELEMETRY_API_BASE}/notifications/webhook", json=payload)
            return res.text if res.status_code == 200 else json.dumps({"error": "Fallo al enviar notificación"})
    except Exception as e:
        return json.dumps({"error": f"Error de conexión con webhook: {str(e)}"})