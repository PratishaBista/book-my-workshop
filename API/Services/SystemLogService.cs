using API.Data;
using API.Entities;
using System.Threading.Tasks;

namespace API.Services;

public class SystemLogService : ISystemLogService
{
    private readonly ApplicationDbContext _context;

    public SystemLogService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task LogAsync(string level, string source, string message, string? exception = null, string? triggeredBy = null)
    {
        var log = new SystemLog
        {
            LogLevel = level,
            Source = source,
            Message = message,
            Exception = exception,
            TriggeredBy = triggeredBy
        };

        _context.SystemLogs.Add(log);
        await _context.SaveChangesAsync();
    }

    public Task LogInfoAsync(string source, string message, string? triggeredBy = null)
    {
        return LogAsync("Information", source, message, null, triggeredBy);
    }

    public Task LogWarningAsync(string source, string message, string? triggeredBy = null)
    {
        return LogAsync("Warning", source, message, null, triggeredBy);
    }

    public Task LogErrorAsync(string source, string message, string? exception = null, string? triggeredBy = null)
    {
        return LogAsync("Error", source, message, exception, triggeredBy);
    }
}
