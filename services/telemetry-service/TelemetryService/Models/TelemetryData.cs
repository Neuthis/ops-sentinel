namespace TelemetryService.Models;

public class ServiceHealthMetric
{
    public string ServiceName { get; set; } = string.Empty;
    public string Status { get; set; } = "healthy";
    public double CpuPercent { get; set; }
    public int MemoryMb { get; set; }
    public int Restarts { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

public class SanitizedLogEntry
{
    public string ServiceName { get; set; } = string.Empty;
    public string Level { get; set; } = "INFO";
    public string Message { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}