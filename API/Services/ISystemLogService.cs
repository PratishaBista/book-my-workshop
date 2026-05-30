using System.Threading.Tasks;

namespace API.Services;

public interface ISystemLogService
{
    Task LogAsync(string level, string source, string message, string? exception = null, string? triggeredBy = null);
    Task LogInfoAsync(string source, string message, string? triggeredBy = null);
    Task LogWarningAsync(string source, string message, string? triggeredBy = null);
    Task LogErrorAsync(string source, string message, string? exception = null, string? triggeredBy = null);
}
