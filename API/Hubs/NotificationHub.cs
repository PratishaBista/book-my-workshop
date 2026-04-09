using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;

namespace API.Hubs;

[Authorize]
public class NotificationHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        var roles = Context.User?.FindAll(System.Security.Claims.ClaimTypes.Role).Select(r => r.Value).ToList();
        
        // Add user to specific groups based on their roles for easier broadcasting
        if (roles != null)
        {
            foreach (var role in roles)
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, role);
            }
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await base.OnDisconnectedAsync(exception);
    }
}
