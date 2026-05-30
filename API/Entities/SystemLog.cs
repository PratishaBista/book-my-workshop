using System;

namespace API.Entities;

public class SystemLog
{
    public int Id { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string LogLevel { get; set; } = "Information"; // Information, Warning, Error
    public string Source { get; set; } = "System"; // Auth, Financials, Moderation, Payment, System, MLService
    public string Message { get; set; } = string.Empty;
    public string? Exception { get; set; }
    public string? TriggeredBy { get; set; } // Username / Email of the user/admin
}
