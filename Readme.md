# 🛡️ OpsSentinel — Autonomous SRE & Remediation Agent

**OpsSentinel** es un sistema agéntico integral de ingeniería de confiabilidad de sitios (**Site Reliability Engineering - SRE**) con una arquitectura full-stack distribuida y una interfaz inmersiva basada en estética **Liquid Glass / iOS**.

El sistema monitorea en tiempo real una malla de microservicios (.NET), detecta anomalías o alertas críticas mediante simulaciones de caos, y utiliza un agente autónomo potenciado por **Gemini** (FastAPI) para correlacionar eventos, diagnosticar la causa raíz, ejecutar remediaciones en caliente (escalado horizontal, reinicio de servicios, purga de estados zombis) y persistir el historial de incidentes en SQLite.

---

## 🏛️ Arquitectura del Sistema
                  ┌──────────────────────────────────────────┐
                  │          React Frontend (Vite)           │
                  │  • Liquid Glass UI (MUI + Lucide)        │
                  │  • Dynamic Shader Aurora & Cursor Glow   │
                  │  • Real-time Telemetry (Recharts)        │
                  │  • Chaos Injection Simulator             │
                  └────────────────────┬─────────────────────┘
                                       │
                    HTTP / SSE Stream  │  Port 8000 / 5173
                                       ▼
                  ┌──────────────────────────────────────────┐
                  │        Agent Backend (FastAPI)           │
                  │  • Google Gemini SDK (Function Calling)  │
                  │  • Autonomous Reasoning & Diagnostics    │
                  │  • Incident Audit Log (SQLite / SQLA)    │
                  │  • Server-Sent Events (SSE Engine)       │
                  └────────────────────┬─────────────────────┘
                                       │
                      REST Inter-Service│  Port 5001
                                       ▼
                  ┌──────────────────────────────────────────┐
                  │     Telemetry Mesh (.NET 8 Minimal)      │
                  │  • Live Topology & Cluster Dependency Map│
                  │  • Health Metrics (CPU, p99 Latency)     │
                  │  • Lifecycle Control (Restart, Scale)    │
                  │  • Webhook Alert Sink                    │
                  └──────────────────────────────────────────┘

---

## 💎 Características Principales

* **Estética Crystal / Liquid Glass:** Diseño visual basado en la identidad de color **Chrome Violet (`#5F2CFF`)** y **Glass Blue (`#DFF6FF`)**, con auroras dinámicas en bucle continuo, refracción interactiva al cursor/toque y tarjetas con difuminado volumétrico (`backdrop-filter`).
* **Telemetría y Métricas en Tiempo Real:** Gráficos de área interactivos con Recharts que monitorean latencia P99, porcentaje de uso de CPU y réplicas de pods activas vía sondeo continuo.
* **Simulador de Caos (Chaos Engineering):** Inyectores rápidos de fallas típicas en producción:
  * *Saturación Crítica de CPU* en pasarela de pagos.
  * *Agotamiento del Pool de Conexiones DB* (Connection Pool Exhaustion).
  * *Caída Upstream en servicios de terceros* (Stripe Outage / Circuit Breaker).
* **Streaming en Vivo (SSE):** Trazabilidad de decisiones paso a paso en tiempo real sin bloqueos en la interfaz.
* **Orquestación Multicontenedor:** Despliegue automatizado con `Docker Compose` que conecta las redes internas y volúmenes persistentes.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnologías |
| :--- | :--- |
| **Frontend** | React 18, Vite, Material UI (MUI), Lucide React, Recharts, Axios, Nginx |
| **Backend Agente** | Python 3.11, FastAPI, Google GenAI SDK, SQLAlchemy, SQLite, Pydantic, HTTPX, Uvicorn |
| **Malla Telemetría** | .NET 8 (C# Minimal APIs), ASP.NET Core Runtime |
| **Infraestructura** | Docker, Docker Compose, Linux Alpine / Debian Slim |

---

## 🚀 Despliegue Rápido con Docker

### 1. Clonar el repositorio y configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto (`ops-sentinel/.env`):

```env
GEMINI_API_KEY=tu_api_key_de_google_ai_studio_aqui
