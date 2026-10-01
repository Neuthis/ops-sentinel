import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  TextField,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Stack
} from '@mui/material';
import {
  ShieldAlert,
  Server,
  Activity,
  Send,
  RefreshCw,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Flame,
  Database,
  CloudOff
} from 'lucide-react';
import axios from 'axios';
import CrystalGlow from './CrystalGlow';
import DynamicBackground from './DynamicBackground';
import MetricsWidget from './MetricsWidget';

const API_BASE = "http://localhost:8000/api/v1";

const CHAOS_SCENARIOS = [
  {
    title: "Saturación Crítica CPU",
    icon: <Flame size={16} color="#FF7A85" />,
    service: "payment-gateway",
    prompt: "Alerta crítica P0: payment-gateway presenta consumo sostenido de CPU al 95% y degradación masiva de tiempos de respuesta. Diagnostica, remedia escalando réplicas y estabiliza el servicio."
  },
  {
    title: "Agotamiento Pool DB",
    icon: <Database size={16} color="#FBBF24" />,
    service: "payment-gateway",
    prompt: "Falla de conectividad: payment-gateway reporta saturación 50/50 en el pool de sockets hacia la base de datos SQL. Diagnostica anomalías en logs, purga estados zombies reiniciando el servicio y alerta a guardia."
  },
  {
    title: "Caída Upstream Stripe",
    icon: <CloudOff size={16} color="#A78BFA" />,
    service: "payment-gateway",
    prompt: "Degradación en cascada: Latencia p99 superior a 800ms por timeouts continuos hacia la pasarela de pagos upstream (Stripe). Analiza la topología, mitiga la acumulación de peticiones y notifica a #ops-war-room."
  }
];

export default function App() {
  const [topology, setTopology] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [loadingDiagnose, setLoadingDiagnose] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [latestResolution, setLatestResolution] = useState(null);
  const [streamStatus, setStreamStatus] = useState("");

  const fetchData = async () => {
    try {
      setLoadingData(true);
      const [topRes, incRes] = await Promise.all([
        axios.get(`${API_BASE}/topology`),
        axios.get(`${API_BASE}/incidents`)
      ]);
      setTopology(topRes.data);
      setIncidents(incRes.data);
    } catch (err) {
      console.error("Error al obtener datos:", err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const triggerDiagnosis = async (incidentText, serviceName = "payment-gateway") => {
    setLoadingDiagnose(true);
    setLatestResolution("");
    setStreamStatus("Conectando con OpsSentinel...");

    try {
      const response = await fetch(`${API_BASE}/diagnose/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          incident_description: incidentText,
          service_name: serviceName
        })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop();

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.replace("data: ", ""));
            if (data.type === "status") {
              setStreamStatus(data.content);
            } else if (data.type === "token") {
              setLatestResolution((prev) => (prev ? prev + data.content : data.content));
            } else if (data.type === "done") {
              setStreamStatus("Completado");
              await fetchData();
            }
          }
        }
      }
    } catch (err) {
      console.error("Fallo durante streaming:", err);
      setStreamStatus("Error de comunicación");
    } finally {
      setLoadingDiagnose(false);
      setPrompt("");
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    triggerDiagnosis(prompt);
  };

  return (
    <Box sx={{ minHeight: '100vh', pb: 8, position: 'relative', overflowX: 'hidden' }}>
      {/* 1. Malla dinámica de fondo */}
      <DynamicBackground />

      {/* 2. Luz volumétrica reactiva */}
      <CrystalGlow />

      {/* 3. Header estilo iOS Glass */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1100,
          backdropFilter: 'blur(25px) saturate(190%)',
          backgroundColor: 'rgba(7, 9, 19, 0.65)',
          borderBottom: '1px solid rgba(223, 246, 255, 0.12)',
          py: 2,
          px: 4,
          mb: 4
        }}
      >
        <Container maxWidth="xl" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #5F2CFF 0%, #DFF6FF 120%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(95, 44, 255, 0.5)'
              }}
            >
              <Radio color="#FFFFFF" size={24} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1.1 }}>
                OpsSentinel <span style={{ color: '#DFF6FF', fontSize: '0.8rem', fontWeight: 400, opacity: 0.8 }}>v1.0</span>
              </Typography>
              <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                Autonomous Site Reliability Engineering Agent
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              icon={<Activity size={14} color="#10B981" />}
              label="Cluster: Active"
              sx={{
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#6EE7B7'
              }}
            />
            <IconButton onClick={fetchData} sx={{ color: '#DFF6FF', border: '1px solid rgba(223, 246, 255, 0.15)' }}>
              <RefreshCw size={18} />
            </IconButton>
          </Box>
        </Container>
      </Box>

      {/* 4. Contenido principal */}
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={3}>
          {/* Panel Izquierdo: Topología */}
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Server size={20} color="#5F2CFF" />
                <Typography variant="h6">Service Topology</Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3 }}>
                Live architecture map ingested from .NET Telemetry mesh.
              </Typography>

              {loadingData ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={30} sx={{ color: '#5F2CFF' }} />
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {topology.map((svc, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        backgroundColor: 'rgba(223, 246, 255, 0.03)',
                        border: svc.status === 'degraded' 
                          ? '1px solid rgba(239, 68, 68, 0.4)' 
                          : '1px solid rgba(223, 246, 255, 0.08)',
                        boxShadow: svc.status === 'degraded' ? '0 0 15px rgba(239, 68, 68, 0.15)' : 'none'
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                          {svc.service || svc.Service}
                        </Typography>
                        <Chip
                          size="small"
                          label={svc.status || svc.Status}
                          icon={
                            (svc.status || svc.Status) === 'degraded' ? (
                              <AlertTriangle size={12} color="#EF4444" />
                            ) : (
                              <CheckCircle2 size={12} color="#10B981" />
                            )
                          }
                          sx={{
                            backgroundColor:
                              (svc.status || svc.Status) === 'degraded'
                                ? 'rgba(239, 68, 68, 0.15)'
                                : 'rgba(16, 185, 129, 0.15)',
                            color: (svc.status || svc.Status) === 'degraded' ? '#FCA5A5' : '#6EE7B7',
                            border: `1px solid ${
                              (svc.status || svc.Status) === 'degraded'
                                ? 'rgba(239, 68, 68, 0.3)'
                                : 'rgba(16, 185, 129, 0.3)'
                            }`,
                            fontSize: '0.75rem',
                            textTransform: 'capitalize'
                          }}
                        />
                      </Box>

                      <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mb: 0.5 }}>
                        Dependencies:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(svc.dependencies || svc.Dependencies || []).map((dep, depIdx) => (
                          <Chip
                            key={depIdx}
                            label={dep}
                            size="small"
                            sx={{
                              fontSize: '0.7rem',
                              backgroundColor: 'rgba(95, 44, 255, 0.1)',
                              border: '1px solid rgba(95, 44, 255, 0.25)',
                              color: '#DFF6FF'
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Panel Derecho: Métricas, Caos y Consola */}
          <Grid item xs={12} lg={8}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Telemetría en Vivo */}
              <MetricsWidget />

              {/* Panel de Inyección de Caos */}
              <Paper sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <Flame size={20} color="#FF7A85" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Chaos Simulator: Interactive Outage Triggers
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#94A3B8', mb: 2, fontSize: '0.85rem' }}>
                  Simula caídas operativas reales para activar las herramientas de diagnóstico y mitigación autónoma de OpsSentinel:
                </Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  {CHAOS_SCENARIOS.map((sc, idx) => (
                    <Button
                      key={idx}
                      variant="outlined"
                      disabled={loadingDiagnose}
                      startIcon={sc.icon}
                      onClick={() => triggerDiagnosis(sc.prompt, sc.service)}
                      sx={{
                        flex: 1,
                        py: 1.2,
                        backgroundColor: 'rgba(223, 246, 255, 0.03)',
                        border: '1px solid rgba(223, 246, 255, 0.12)',
                        color: '#F8FAFC',
                        fontSize: '0.82rem',
                        '&:hover': {
                          backgroundColor: 'rgba(95, 44, 255, 0.15)',
                          borderColor: '#5F2CFF',
                          boxShadow: '0 0 16px rgba(95, 44, 255, 0.4)'
                        }
                      }}
                    >
                      {sc.title}
                    </Button>
                  ))}
                </Stack>
              </Paper>

              {/* Consola de Entrada Manual */}
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <ShieldAlert size={22} color="#5F2CFF" />
                  <Typography variant="h6">OpsSentinel Autonomous Dispatcher</Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#94A3B8', mb: 2 }}>
                  O redacta una consulta libre para evaluar el comportamiento del agente:
                </Typography>

                <form onSubmit={handleFormSubmit}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      placeholder="Ej: El servicio payment-gateway reporta lentitud intermitente..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      disabled={loadingDiagnose}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(223, 246, 255, 0.03)',
                          borderRadius: 3,
                          '& fieldset': { borderColor: 'rgba(223, 246, 255, 0.15)' },
                          '&:hover fieldset': { borderColor: '#5F2CFF' },
                          '&.Mui-focused fieldset': { borderColor: '#5F2CFF' }
                        },
                        '& .MuiInputBase-input': { color: '#F8FAFC' }
                      }}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={loadingDiagnose || !prompt.trim()}
                      startIcon={loadingDiagnose ? <CircularProgress size={18} color="inherit" /> : <Send size={18} />}
                      sx={{ minWidth: 160 }}
                    >
                      {loadingDiagnose ? "Analizando..." : "Diagnosticar"}
                    </Button>
                  </Box>
                </form>

                {/* Salida de Remediación con Streaming */}
                {(loadingDiagnose || latestResolution) && (
                  <Box
                    sx={{
                      mt: 3,
                      p: 2.5,
                      borderRadius: 3,
                      backgroundColor: 'rgba(95, 44, 255, 0.05)',
                      border: '1px solid rgba(95, 44, 255, 0.3)',
                      boxShadow: 'inset 0 0 20px rgba(95, 44, 255, 0.05)'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircle2 size={18} color="#DFF6FF" />
                        <Typography sx={{ fontWeight: 700, color: '#DFF6FF' }}>
                          Resolución Agéntica & Remediación Despachada
                        </Typography>
                      </Box>
                      {loadingDiagnose && (
                        <Chip
                          size="small"
                          label={streamStatus}
                          sx={{
                            backgroundColor: 'rgba(95, 44, 255, 0.2)',
                            color: '#DFF6FF',
                            fontSize: '0.75rem',
                            border: '1px solid rgba(95, 44, 255, 0.4)'
                          }}
                        />
                      )}
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        whiteSpace: 'pre-wrap',
                        color: '#E2E8F0',
                        lineHeight: 1.7,
                        fontFamily: 'monospace',
                        fontSize: '0.85rem'
                      }}
                    >
                      {latestResolution || "Procesando telemetría y ejecutando remediaciones..."}
                    </Typography>
                  </Box>
                )}
              </Paper>

              {/* Registro de Auditoría */}
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Cpu size={20} color="#5F2CFF" />
                    <Typography variant="h6">Incident Audit & Persistence Log</Typography>
                  </Box>
                  <Chip
                    label={`${incidents.length} Incidentes`}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(223, 246, 255, 0.08)',
                      border: '1px solid rgba(223, 246, 255, 0.2)',
                      color: '#DFF6FF'
                    }}
                  />
                </Box>

                {incidents.length === 0 ? (
                  <Typography variant="body2" sx={{ color: '#94A3B8', py: 2, textAlign: 'center' }}>
                    No hay incidentes registrados en auditoría todavía.
                  </Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {incidents.map((inc) => (
                      <Box
                        key={inc.id}
                        sx={{
                          p: 2,
                          borderRadius: 2.5,
                          backgroundColor: 'rgba(223, 246, 255, 0.02)',
                          border: '1px solid rgba(223, 246, 255, 0.07)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                              label={`#${inc.id}`}
                              size="small"
                              sx={{
                                backgroundColor: 'rgba(95, 44, 255, 0.2)',
                                color: '#DFF6FF',
                                fontWeight: 700,
                                fontSize: '0.75rem'
                              }}
                            />
                            <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                              {inc.service_affected}
                            </Typography>
                          </Box>
                          <Typography variant="caption" sx={{ color: '#64748B' }}>
                            {new Date(inc.created_at).toLocaleString()}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                          <strong>Problema:</strong> {inc.description}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}