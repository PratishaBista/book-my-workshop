// notification controller handles user notifications for the platform
// includes fetching notifications, marking single or all as read
//all endpoints require authentication sicne notifications are user-specific

using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API.Controllers;

[Authorize] // all notification endpoints require authenticated user
[ApiController]
[Route("api/[controller]")]
public class NotificationController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    // returns all notifications for the currently authenticated user
    //includes unread count in response typically
    // ordered by creation data descending (newest first)
    // GET: api/notification
    [HttpGet]
    public async Task<IActionResult> GetNotifications()
    {
        // try to get user id from multiple claim types for compatibiity
        // some setups use defaultnameclaimtype, others use nameidentifier directly
        var userId = User.FindFirstValue(ClaimsIdentity.DefaultNameClaimType)
                    ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var notifications = await _notificationService.GetUserNotificationsAsync(userId);
        return Ok(notifications);
    }

    // marks a specific notification as read
    // verifies notification belongs to the user before updating
    // PUT: api/notification/{id}/read
    [HttpPut("{id}/read")]
    public async Task<IActionResult> MarkAsRead(int id)
    {
        var userId = User.FindFirstValue(ClaimsIdentity.DefaultNameClaimType)
                    ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var result = await _notificationService.MarkAsReadAsync(id, userId);
        if (!result) return NotFound(); // notification doesn't exist or doesn't belong to user

        return Ok(); // 200 success with no body
    }

    // marks all notifications for the current user as read in one operation
    // useful for "mark all as read" button in notification dropdown
    // PUT: api/notification/read-all
    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var userId = User.FindFirstValue(ClaimsIdentity.DefaultNameClaimType)
                    ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        await _notificationService.MarkAllAsReadAsync(userId);
        return Ok();
    }
}
