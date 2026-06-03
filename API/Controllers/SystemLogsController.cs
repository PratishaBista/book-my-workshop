// system logs controller handles audit logging and system monitoring
// provides filtered log viewing, log cleanup, and test data seeding
// restricted to superadmin only for security and compliance

using API.Data;
using API.Entities;
using API.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace API.Controllers;

[ApiController]
[Route("api/superadmin/logs")]
[Authorize(Roles = UserRoles.SuperAdmin)] // only superadmin can view system logs
public class SystemLogsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public SystemLogsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // retrieves system logs with pagination and filtering options
    // supports filtering by log level (info/warning/error), source, search text, and date range
    // includes summary metrics for dashboard widgets
    // GET: api/superadmin/logs?page=1&pageSize=20&level=Error&source=Auth&search=login&startDate=2024-01-01&endDate=2024-12-31
    [HttpGet]
    public async Task<IActionResult> GetLogs(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? level = null,
        [FromQuery] string? source = null,
        [FromQuery] string? search = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        // validate and sanitize pagination parameters
        if (page < 1) page = 1;
        if (pageSize < 1 || pageSize > 100) pageSize = 20;

        var query = _context.SystemLogs.AsQueryable();

        // apply log level filter (information, warning, error)
        if (!string.IsNullOrWhiteSpace(level) && level != "All")
        {
            query = query.Where(l => l.LogLevel == level);
        }

        // filter by source module (auth, financials, moderation, system, etc.)
        if (!string.IsNullOrWhiteSpace(source) && source != "All")
        {
            query = query.Where(l => l.Source == source);
        }

        // text search across message and triggeredby fields
        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.ToLower();
            query = query.Where(l => l.Message.ToLower().Contains(searchLower)
                                  || (l.TriggeredBy != null && l.TriggeredBy.ToLower().Contains(searchLower)));
        }

        // date range filtering
        if (startDate.HasValue)
        {
            query = query.Where(l => l.Timestamp >= startDate.Value);
        }
        if (endDate.HasValue)
        {
            // set to end of day for inclusive filtering (e.g., 2024-01-01 includes all logs from that day)
            var inclusiveEnd = endDate.Value.Date.AddDays(1).AddTicks(-1);
            query = query.Where(l => l.Timestamp <= inclusiveEnd);
        }

        // execute count for pagination metadata
        var totalCount = await query.CountAsync();
        var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

        // fetch paginated logs ordered newest first
        var logs = await query
            .OrderByDescending(l => l.Timestamp)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        // calculate summary counts for dashboard widgets (all logs, not filtered)
        var infoCount = await _context.SystemLogs.CountAsync(l => l.LogLevel == "Information");
        var warningCount = await _context.SystemLogs.CountAsync(l => l.LogLevel == "Warning");
        var errorCount = await _context.SystemLogs.CountAsync(l => l.LogLevel == "Error");

        return Ok(new
        {
            totalCount,
            totalPages,
            currentPage = page,
            pageSize,
            logs,
            summary = new
            {
                total = infoCount + warningCount + errorCount,
                info = infoCount,
                warning = warningCount,
                error = errorCount
            }
        });
    }

    // clears system logs from the database
    // can either clear all logs or keep logs newer than a specified number of days
    // DELETE: api/superadmin/logs/clear?keepDays=30
    [HttpDelete("clear")]
    public async Task<IActionResult> ClearLogs([FromQuery] int? keepDays = null)
    {
        if (keepDays.HasValue && keepDays.Value > 0)
        {
            // keep logs from the last X days, delete everything older
            var cutoffDate = DateTime.UtcNow.AddDays(-keepDays.Value);
            var logsToDelete = await _context.SystemLogs.Where(l => l.Timestamp < cutoffDate).ToListAsync();
            _context.SystemLogs.RemoveRange(logsToDelete);
            await _context.SaveChangesAsync();
            return Ok(new { Message = $"Cleared logs older than {keepDays} days.", ClearedCount = logsToDelete.Count });
        }
        else
        {
            // delete all logs (full truncate)
            var allLogs = await _context.SystemLogs.ToListAsync();
            _context.SystemLogs.RemoveRange(allLogs);
            await _context.SaveChangesAsync();
            return Ok(new { Message = "All system logs have been cleared.", ClearedCount = allLogs.Count });
        }
    }

    // seeds test log entries for development and testing purposes
    // creates realistic log entries covering auth, financials, moderation, and system errors
    // POST: api/superadmin/logs/seed-test
    [HttpPost("seed-test")]
    public async Task<IActionResult> SeedTestLogs()
    {
        var testLogs = new[]
        {
            new SystemLog
            {
                LogLevel = "Information",
                Source = "Auth",
                Message = "SuperAdmin velvetscarfsoda@gmail.com successfully verified MFA and logged in.",
                TriggeredBy = "velvetscarfsoda@gmail.com",
                Timestamp = DateTime.UtcNow.AddMinutes(-5)
            },
            new SystemLog
            {
                LogLevel = "Warning",
                Source = "Financials",
                Message = "Commission rate updated from 10% to 12.5% by velvetscarfsoda@gmail.com.",
                TriggeredBy = "velvetscarfsoda@gmail.com",
                Timestamp = DateTime.UtcNow.AddMinutes(-12)
            },
            new SystemLog
            {
                LogLevel = "Information",
                Source = "Moderation",
                Message = "Host account 'Chef Milan Cooking Academy' (ID: 15) successfully reinstated by admin@bookmyworkshop.com.",
                TriggeredBy = "admin@bookmyworkshop.com",
                Timestamp = DateTime.UtcNow.AddHours(-1)
            },
            new SystemLog
            {
                LogLevel = "Warning",
                Source = "Moderation",
                Message = "User account 'John Doe' (johndoe@example.com) suspended for spamming host reviews.",
                TriggeredBy = "admin@bookmyworkshop.com",
                Timestamp = DateTime.UtcNow.AddHours(-4)
            },
            new SystemLog
            {
                LogLevel = "Error",
                Source = "System",
                Message = "Failed to establish a network handshake with python-recommendation-api at http://localhost:8000. ML recommendations will fall back to rule-based popularity matching.",
                Exception = "System.Net.Http.HttpRequestException: No connection could be made because the target machine actively refused it.\n   at System.Net.Http.HttpConnectionPool.ConnectToTcpHostAsync(String host, Int32 port, HttpRequestMessage request, Boolean async, CancellationToken cancellationToken)\n   at System.Net.Http.HttpConnectionPool.GetHttp11ConnectionAsync(HttpRequestMessage request, Boolean async, CancellationToken cancellationToken)\n   at System.Net.Http.HttpConnectionPool.SendWithVersionDetectionAndRetryAsync(HttpRequestMessage request, Boolean async, Boolean doRequestAuth, CancellationToken cancellationToken)\n   at System.Net.Http.DiagnosticsHandler.SendAsyncCore(HttpRequestMessage request, Boolean async, CancellationToken cancellationToken)\n   at System.Net.Http.HttpClient.<SendAsync>g__Core|83_0(HttpRequestMessage request, HttpCompletionOption completionOption, Activity activity, FrameHeadersFrame handlerFrame, CancellationTokenSource cts, Boolean disposeCts, CancellationToken cancellationToken)\n   at API.Services.MLService.GetSimilarWorkshopsAsync(Int32 workshopId) in c:\\Users\\USER\\Desktop\\BookMyWorkshop\\API\\Services\\MLService.cs:line 64",
                Timestamp = DateTime.UtcNow.AddHours(-12)
            }
        };

        _context.SystemLogs.AddRange(testLogs);
        await _context.SaveChangesAsync();

        return Ok(new { Message = "Successfully seeded 5 diagnostic test logs.", Count = testLogs.Length });
    }
}
