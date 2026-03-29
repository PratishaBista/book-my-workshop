using API.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace API.Services;

public class AccountCleanupService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<AccountCleanupService> _logger;

    public AccountCleanupService(IServiceProvider serviceProvider, ILogger<AccountCleanupService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Account Cleanup Background Service is starting.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessCleanupAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred executing account cleanup task.");
            }

            // Run once per hour
            await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
        }
    }

    private async Task ProcessCleanupAsync()
    {
        using (var scope = _serviceProvider.CreateScope())
        {
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
            var userService = scope.ServiceProvider.GetRequiredService<IUserService>();
            var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();
            var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();
            
            var now = DateTime.UtcNow;
            
            var usersToDelete = await userManager.Users
                .Where(u => u.DeletionScheduledAt != null && u.DeletionScheduledAt <= now.AddDays(-30))
                .ToListAsync();

            foreach (var user in usersToDelete)
            {
                _logger.LogInformation($"Permanently deleting account for: {user.Email}");
                await userService.HardDeleteUserAsync(user.Id);
            }

            var usersToWarn = await userManager.Users
                .Where(u => u.DeletionScheduledAt != null 
                         && u.DeletionScheduledAt <= now.AddDays(-29)
                         && !u.DeletionWarningSent)
                .ToListAsync();

            foreach (var user in usersToWarn)
            {
                _logger.LogInformation($"Sending 24h deletion warning to: {user.Email}");
                
                var loginLink = $"{configuration["FrontendUrl"]}/login";
                var emailBody = EmailTemplates.GetDeletionWarningEmail(user.FullName, loginLink);
                
                await emailService.SendEmailAsync(user.Email!, "IMPORTANT: Your account will be deleted in 24 hours", emailBody);
                
                user.DeletionWarningSent = true;
                await userManager.UpdateAsync(user);
            }
        }
    }
}
