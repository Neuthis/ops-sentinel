var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapGet("/api/v1/telemetry/topology", () =>
{
    var topology = new[]
    {
        new { Service = "api-gateway", Dependencies = new[] { "auth-service", "payment-gateway", "order-service" }, Status = "healthy" },
        new { Service = "payment-gateway", Dependencies = new[] { "database-cluster", "external-stripe-api" }, Status = "degraded" },
        new { Service = "order-service", Dependencies = new[] { "database-cluster", "inventory-service" }, Status = "healthy" },
        new { Service = "auth-service", Dependencies = new[] { "redis-cache", "database-cluster" }, Status = "healthy" }
    };

    return Results.Ok(topology);
});

app.MapPost("/api/v1/telemetry/actions/restart/{serviceName}", (string serviceName) =>
{
    return Results.Ok(new
    {
        service = serviceName,
        action = "restart",
        status = "executed",
        message = $"El pod de {serviceName} ha sido reiniciado satisfactoriamente.",
        timestamp = DateTime.UtcNow
    });
});

app.MapPost("/api/v1/telemetry/actions/scale/{serviceName}", (string serviceName, int? replicas) =>
{
    int targetReplicas = replicas ?? 3;
    return Results.Ok(new
    {
        service = serviceName,
        action = "scale",
        replicas = targetReplicas,
        status = "executed",
        message = $"El despliegue de {serviceName} fue escalado a {targetReplicas} replicas.",
        timestamp = DateTime.UtcNow
    });
});

app.MapPost("/api/v1/telemetry/notifications/webhook", (AlertNotification payload) =>
{
    Console.ForegroundColor = ConsoleColor.Yellow;
    Console.WriteLine($"\n[ALERT WEBHOOK TRIGGERED] Canal: #{payload.Channel} | Severidad: {payload.Severity.ToUpper()}");
    Console.WriteLine($"Mensaje: {payload.Message}");
    Console.ResetColor();

    return Results.Ok(new
    {
        status = "delivered",
        channel = payload.Channel,
        receivedAt = DateTime.UtcNow
    });
});

// Record para deserializar el payload entrante


app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
public record AlertNotification(string Channel, string Severity, string Message);