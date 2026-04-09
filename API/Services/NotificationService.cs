using API.Data;
using API.Entities;
using API.Enums;
using API.Hubs;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace API.Services;

public class NotificationService : INotificationService
{
    private readonly ApplicationDbContext _context;
    private readonly IHubContext<NotificationHub> _hubContext;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(
        ApplicationDbContext context, 
        IHubContext<NotificationHub> hubContext,
        UserManager<ApplicationUser> userManager,
        ILogger<NotificationService> logger)
    {
        _context = context;
        _hubContext = hubContext;
        _userManager = userManager;
        _logger = logger;
    }

    public async Task NotifyRoleAsync(string roleName, string title, string message, NotificationType type, string? actionUrl = null)
    {
        var usersInRole = await _userManager.GetUsersInRoleAsync(roleName);
        
        foreach (var user in usersInRole)
        {
            // We don't save per role in a single row, we save for each user so they can read/dismiss individually
            await CreateNotificationAsync(user.Id, title, message, type, actionUrl);
        }
        
        // No need to push to group here because CreateNotificationAsync already pushes to the specific user via SignalR
    }

    public async Task<Notification> CreateNotificationAsync(string userId, string title, string message, NotificationType type, string? actionUrl = null)
    {
        var notification = new Notification
        {
            UserId = userId,
            Title = title,
            Message = message,
            Type = type,
            ActionUrl = actionUrl,
            CreatedAt = DateTime.UtcNow,
            IsRead = false
        };

        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();

        // Push to SignalR
        try
        {
            await _hubContext.Clients.User(userId).SendAsync("ReceiveNotification", new
            {
                notification.Id,
                notification.Title,
                notification.Message,
                notification.Type,
                notification.ActionUrl,
                notification.CreatedAt,
                notification.IsRead
            });
            _logger.LogInformation($"[SignalR] Notification pushed to user {userId}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"[SignalR Error] Failed to push notification to user {userId}");
        }

        return notification;
    }

    public async Task<IEnumerable<Notification>> GetUserNotificationsAsync(string userId)
    {
        return await _context.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Take(50)
            .ToListAsync();
    }

    public async Task<bool> MarkAsReadAsync(int notificationId, string userId)
    {
        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);

        if (notification == null) return false;

        notification.IsRead = true;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> MarkAllAsReadAsync(string userId)
    {
        var unread = await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync();

        foreach (var n in unread) n.IsRead = true;

        await _context.SaveChangesAsync();
        return true;
    }
}
