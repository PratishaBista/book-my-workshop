using API.Entities;
using API.Enums;

namespace API.Services;

public interface INotificationService
{
    Task<Notification> CreateNotificationAsync(string userId, string title, string message, NotificationType type, string? actionUrl = null);
    Task NotifyRoleAsync(string roleName, string title, string message, NotificationType type, string? actionUrl = null);
    Task<IEnumerable<Notification>> GetUserNotificationsAsync(string userId);
    Task<bool> MarkAsReadAsync(int notificationId, string userId);
    Task<bool> MarkAllAsReadAsync(string userId);
}
