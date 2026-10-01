using Microsoft.AspNetCore.Mvc;
using TelemetryService.Models;

namespace TelemetryService.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class TelemetryController : ControllerBase
{
    private static readonly Dictionary<string, ServiceHealthMetric> ServiceMetrics = new(StringComparer.OrdinalIgnoreCase)
    {
        ["auth-service"] = new() { ServiceName = "auth-service", Status = "healthy", CpuPercent = 14.2, MemoryMb = 256, Restarts = 0 },
        ["payment-gateway"] = new() { ServiceName = "payment-gateway", Status = "degraded", CpuPercent = 91.5, MemoryMb = 1024, Restarts = 4 },
        ["order-api"] = new() { ServiceName = "order-api", Status = "healthy", CpuPercent = 22.0, MemoryMb = 512, Restarts = 1 }
    };

    private static readonly Dictionary<string, List<SanitizedLogEntry>> ServiceLogs = new(StringComparer.OrdinalIgnoreCase)
    {
        ["payment-gateway"] = new()
        {
            new() { ServiceName = "payment-gateway", Level = "ERROR", Message = "Connection pool exhaustion detected (active=50/50)" },
            new() { ServiceName = "payment-gateway", Level = "ERROR", Message = "Timeout upstream response at 10.0.1.25:504" },
            new() { ServiceName = "payment-gateway", Level = "WARN", Message = "Auto-restarting worker due to health probe failure" }
        }
    };

    [HttpGet("health/{serviceName}")]
    public IActionResult GetServiceHealth(string serviceName)
    {
        if (ServiceMetrics.TryGetValue(serviceName, out var metric))
        {
            return Ok(metric);
        }

        return NotFound(new { error = $"Servicio '{serviceName}' no encontrado en el clúster." });
    }

    [HttpGet("logs/{serviceName}")]
    public IActionResult GetServiceLogs(string serviceName, [FromQuery] int limit = 5)
    {
        if (ServiceLogs.TryGetValue(serviceName, out var logs))
        {
            return Ok(logs.Take(limit));
        }

        return Ok(new List<SanitizedLogEntry>
        {
            new() { ServiceName = serviceName, Level = "INFO", Message = $"Servicio {serviceName} operando bajo parámetros estándar." }
        });
    }
}