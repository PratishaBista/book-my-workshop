using System.Text.Json;
using API.DTOs.Requests;
using API.Data;
using API.Entities;
using API.Enums;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = $"{UserRoles.Admin},{UserRoles.SuperAdmin}")]
public class AdminController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IEmailService _emailService;
    private readonly INotificationService _notificationService;
    private readonly IReviewSeedService _reviewSeedService;
    private readonly IReviewModerationService _reviewModeration;

    public AdminController(
        ApplicationDbContext context,
        UserManager<ApplicationUser> userManager,
        IEmailService emailService,
        INotificationService notificationService,
        IReviewSeedService reviewSeedService,
        IReviewModerationService reviewModeration)
    {
        _context = context;
        _userManager = userManager;
        _emailService = emailService;
        _notificationService = notificationService;
        _reviewSeedService = reviewSeedService;
        _reviewModeration = reviewModeration;
    }

    // GET: api/admin/providers/pending
    [HttpGet("providers/pending")]
    public async Task<IActionResult> GetPendingProviders()
    {
        var admins = await _userManager.GetUsersInRoleAsync(UserRoles.Admin);
        var adminIds = admins.Select(a => a.Id).ToList();

        var pendingProviders = await _context.Providers
            .Include(p => p.User)
            .Where(p => p.Status == ProviderStatus.PendingReview && !adminIds.Contains(p.UserId))
            .Select(p => new
            {
                p.Id,
                p.BusinessName,
                p.PhoneNumber,
                p.State,
                p.Address,
                p.Website,
                p.Tagline,
                p.Description,
                p.Slug,
                p.ReferralSource,
                ContactPerson = p.User.FullName,
                Email = p.User.Email,
                RegisteredAt = p.CreatedAt,
                IdCardUrl = p.IdCardUrl,
                PanCardUrl = p.PanCardUrl,
                StudioImageUrl = p.StudioImageUrl
            })
            .ToListAsync();

        return Ok(pendingProviders);
    }

    // PUT: api/admin/approve-provider/{id}
    [HttpPut("approve-provider/{id}")]
    public async Task<IActionResult> ApproveProvider(int id)
    {
        var provider = await _context.Providers.FindAsync(id);
        if (provider == null) return NotFound("Provider not found");

        if (provider.Status == ProviderStatus.Approved) return BadRequest("Provider is already approved");

        provider.Status = ProviderStatus.Approved;
        provider.IsApproved = true;
        provider.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        // Send Approval Email
        var user = await _userManager.FindByIdAsync(provider.UserId);
        if (user != null && !string.IsNullOrEmpty(user.Email))
        {
            var dashboardLink = "http://localhost:4000/host/dashboard";
            var emailBody = EmailTemplates.GetHostApprovalEmail(user.FullName ?? provider.BusinessName, dashboardLink);
            await _emailService.SendEmailAsync(user.Email, "Account Approved - BookMyWorkshop", emailBody);
        }

        // Notify Host via SignalR
        await _notificationService.CreateNotificationAsync(provider.UserId, 
            "Profile Approved", 
            "Congratulations! Your host profile has been approved. You can now publish workshops.", 
            NotificationType.Success, 
            "/host/dashboard");

        return Ok(new { Message = $"Provider '{provider.BusinessName}' approved successfully." });
    }

    public class RejectProviderRequest
    {
        public string Reason { get; set; } = string.Empty;
    }

    // PUT: api/admin/reject-provider/{id}
    [HttpPut("reject-provider/{id}")]
    public async Task<IActionResult> RejectProvider(int id, [FromBody] RejectProviderRequest request)
    {
        var provider = await _context.Providers.FindAsync(id);
        if (provider == null) return NotFound("Provider not found");

        if (provider.Status == ProviderStatus.Approved) return BadRequest("Provider is already approved. You must suspend them instead.");

        provider.Status = ProviderStatus.Rejected;
        provider.ReviewNotes = request.Reason;
        provider.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        // Send Rejection Email
        var user = await _userManager.FindByIdAsync(provider.UserId);
        if (user != null && !string.IsNullOrEmpty(user.Email))
        {
            var emailBody = EmailTemplates.GetNotificationEmail("Host Profile Requires Action", $"We have reviewed your host application. Unfortunately, it cannot be approved at this time for the following reason:<br/><br/><i>{request.Reason}</i><br/><br/>Please login to your dashboard to update your profile and resubmit.");
            await _emailService.SendEmailAsync(user.Email, "Action Required: Host Profile Update - BookMyWorkshop", emailBody);
        }

        // Notify Host via SignalR
        await _notificationService.CreateNotificationAsync(provider.UserId, 
            "Profile Needs Update", 
            $"Your host profile was reviewed but requires changes. Reason: {request.Reason}", 
            NotificationType.Alert, 
            "/host/settings");

        return Ok(new { Message = $"Provider '{provider.BusinessName}' rejected.", Reason = request.Reason });
    }

    // GET: api/admin/workshops/pending
    [HttpGet("workshops/pending")]
    public async Task<IActionResult> GetPendingWorkshops()
    {
        var admins = await _userManager.GetUsersInRoleAsync(UserRoles.Admin);
        var adminIds = admins.Select(a => a.Id).ToList();

        var pendingWorkshops = await _context.Workshops
            .Include(w => w.Provider)
            .ThenInclude(p => p.User)
            .Include(w => w.Categories)
            .Include(w => w.Pricing)
            .Where(w => (w.Status == WorkshopStatus.PendingReview || w.HasPendingModifications) && !adminIds.Contains(w.Provider.UserId))
            .Select(w => new
            {
                w.Id,
                w.Title,
                w.Description,
                w.Tagline,
                w.Duration,
                w.MaxCapacity,
                w.LocationAddress,
                w.LocationName,
                ProviderName = w.Provider.BusinessName,
                ProviderContact = w.Provider.User.FullName,
                ProviderEmail = w.Provider.User.Email,
                SubmittedAt = w.UpdatedAt,
                CategoryNames = w.Categories.Select(c => c.Name).ToList(),
                Price = w.Pricing != null ? w.Pricing.BasePrice : 0,
                w.HasPendingModifications,
                PendingChanges = _context.WorkshopMedia.Where(m => false).ToList() // Placeholder, we'll fetch actual modifications below
            })
            .ToListAsync();

        // Add pending data if exists
        var result = new List<object>();
        foreach (var w in pendingWorkshops)
        {
            object? pendingData = null;
            if (w.HasPendingModifications)
            {
                var mod = await _context.WorkshopModifications
                    .Where(m => m.WorkshopId == w.Id && m.ReviewedAt == null)
                    .OrderByDescending(m => m.CreatedAt)
                    .FirstOrDefaultAsync();
                
                if (mod?.PendingData != null)
                {
                    pendingData = JsonSerializer.Deserialize<UpdateWorkshopRequest>(mod.PendingData);
                }
            }
            
            result.Add(new {
                w.Id, w.Title, w.Description, w.Tagline, w.Duration, w.MaxCapacity,
                w.LocationAddress, w.LocationName, w.ProviderName, w.ProviderContact,
                w.ProviderEmail, w.SubmittedAt, w.CategoryNames, w.Price,
                w.HasPendingModifications,
                PendingData = pendingData
            });
        }

        return Ok(result);
    }

    // GET: api/admin/workshops/live
    [HttpGet("workshops/live")]
    public async Task<IActionResult> GetLiveWorkshops()
    {
        var admins = await _userManager.GetUsersInRoleAsync(UserRoles.Admin);
        var adminIds = admins.Select(a => a.Id).ToList();

        var liveWorkshops = await _context.Workshops
            .Include(w => w.Provider)
            .ThenInclude(p => p.User)
            .Include(w => w.Categories)
            .Include(w => w.Pricing)
            .Where(w => (w.Status == WorkshopStatus.Published || (w.Status == WorkshopStatus.PendingReview && w.HasPendingModifications)) && !adminIds.Contains(w.Provider.UserId))
            .Select(w => new
            {
                w.Id,
                w.Title,
                w.Description,
                w.Tagline,
                w.Duration,
                w.MaxCapacity,
                w.LocationAddress,
                w.LocationName,
                ProviderName = w.Provider.BusinessName,
                ProviderContact = w.Provider.User.FullName,
                ProviderEmail = w.Provider.User.Email,
                PublishedAt = w.UpdatedAt,
                CategoryNames = w.Categories.Select(c => c.Name).ToList(),
                Price = w.Pricing != null ? w.Pricing.BasePrice : 0
            })
            .ToListAsync();

        return Ok(liveWorkshops);
    }

    public class ApproveWorkshopRequest
    {
        public int? CategoryId { get; set; }
    }

    // PUT: api/admin/approve-workshop/{id}
    [HttpPut("approve-workshop/{id}")]
    public async Task<IActionResult> ApproveWorkshop(int id, [FromBody] ApproveWorkshopRequest request)
    {
        var workshop = await _context.Workshops
            .Include(w => w.Categories)
            .Include(w => w.Pricing)
            .Include(w => w.Media)
            .Include(w => w.Provider)
            .FirstOrDefaultAsync(w => w.Id == id);
        if (workshop == null) return NotFound("Workshop not found");

        // Handle Pending Modifications if it's already Published
        if (workshop.Status == WorkshopStatus.Published && workshop.HasPendingModifications)
        {
            var mod = await _context.WorkshopModifications
                .Where(m => m.WorkshopId == id && m.ReviewedAt == null)
                .OrderByDescending(m => m.CreatedAt)
                .FirstOrDefaultAsync();

            if (mod?.PendingData != null)
            {
                var pendingRequest = JsonSerializer.Deserialize<UpdateWorkshopRequest>(mod.PendingData);
                if (pendingRequest != null)
                {
                    // Apply pending data to workshop entity
                    workshop.Title = pendingRequest.Title;
                    workshop.Tagline = pendingRequest.Tagline;
                    workshop.Subtitle = pendingRequest.Subtitle;
                    workshop.Description = pendingRequest.Description;
                    workshop.Duration = pendingRequest.Duration;
                    workshop.MaxCapacity = pendingRequest.MaxCapacity;
                    workshop.MinCapacity = pendingRequest.MinCapacity;
                    workshop.LocationAddress = pendingRequest.LocationAddress;
                    workshop.LocationName = pendingRequest.LocationName;
                    workshop.LocationDetails = pendingRequest.LocationDetails;
                    workshop.VenueId = pendingRequest.VenueId;
                    workshop.VenueDescription = pendingRequest.VenueDescription;
                    workshop.WorkshopType = pendingRequest.WorkshopType;
                    workshop.WhatToBring = pendingRequest.WhatToBring;
                    workshop.SkillLevel = pendingRequest.SkillLevel;
                    workshop.Suitability = pendingRequest.Suitability;
                    workshop.CancellationPolicy = pendingRequest.CancellationPolicy;
                    workshop.BookingCutoffHours = pendingRequest.BookingCutoffHours;
                    workshop.SafetyRequirements = pendingRequest.SafetyRequirements;
                    workshop.WhatsIncluded = pendingRequest.WhatsIncluded;

                    if (workshop.Pricing != null)
                    {
                        workshop.Pricing.BasePrice = pendingRequest.BasePrice;
                        workshop.Pricing.PricingType = pendingRequest.PricingType;
                        workshop.Pricing.UpdatedAt = DateTime.UtcNow;
                    }

                    // Update Categories
                    var categoryIds = pendingRequest.CategoryIds ?? new List<int>();
                    var newCategories = await _context.WorkshopCategories
                        .Where(c => categoryIds.Contains(c.Id))
                        .ToListAsync();
                    workshop.Categories.Clear();
                    foreach (var cat in newCategories) workshop.Categories.Add(cat);

                    // Mark modification as reviewed
                    mod.ReviewedAt = DateTime.UtcNow;
                    mod.NewStatus = WorkshopStatus.Published;
                }
            }
        }
        else if (workshop.Status == WorkshopStatus.Published) 
        {
            return BadRequest("Workshop is already published");
        }

        if (request.CategoryId.HasValue)
        {
            var category = await _context.WorkshopCategories.FindAsync(request.CategoryId.Value);
            if (category != null)
            {
                workshop.Categories.Clear();
                workshop.Categories.Add(category);
                
                workshop.IsManuallyCategorized = true;
                
                _context.Workshops.Update(workshop);
            }
        }

        if (!workshop.Categories.Any())
        {
             return BadRequest("Cannot approve a workshop without a category. Please select one.");
        }

        workshop.Status = WorkshopStatus.Published;
        workshop.HasPendingModifications = false;
        workshop.RejectionReason = null;
        workshop.RejectedAt = null;
        workshop.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        // Notify Host
        await _notificationService.CreateNotificationAsync(workshop.Provider.UserId, 
            "Workshop Approved", 
            $"Your workshop '{workshop.Title}' has been approved and is now live.", 
            NotificationType.Success, 
            $"/host/workshops"); // Adjusted for host dashboard workshops list

        return Ok(new { Message = $"Workshop '{workshop.Title}' approved and published." });
    }

    public class RejectWorkshopRequest
    {
        public string Reason { get; set; } = string.Empty;
    }

    // PUT: api/admin/reject-workshop/{id}
    [HttpPut("reject-workshop/{id}")]
    public async Task<IActionResult> RejectWorkshop(int id, [FromBody] RejectWorkshopRequest request)
    {
        var workshop = await _context.Workshops
            .Include(w => w.Provider)
            .FirstOrDefaultAsync(w => w.Id == id);
        if (workshop == null) return NotFound("Workshop not found");

        workshop.Status = WorkshopStatus.Rejected;
        workshop.RejectionReason = request.Reason;
        workshop.RejectedAt = DateTime.UtcNow;
        workshop.UpdatedAt = DateTime.UtcNow;
        workshop.HasPendingModifications = false;
        
        await _context.SaveChangesAsync();

        // Send Email
        var user = await _userManager.FindByIdAsync(workshop.Provider.UserId);
        if (user != null && !string.IsNullOrEmpty(user.Email))
        {
            var emailBody = EmailTemplates.GetNotificationEmail("Workshop Needs Changes", $"Your workshop '<b>{workshop.Title}</b>' has been reviewed and requires changes before it can be published. Reason:<br/><br/><i>{request.Reason}</i><br/><br/>Please login to your host dashboard, edit the workshop, and resubmit it.");
            await _emailService.SendEmailAsync(user.Email, "Action Required: Workshop Review - BookMyWorkshop", emailBody);
        }

        // Notify Host
        await _notificationService.CreateNotificationAsync(workshop.Provider.UserId, 
            "Workshop Rejected", 
            $"Your workshop '{workshop.Title}' requires changes. Reason: {request.Reason}", 
            NotificationType.Alert, 
            $"/host/workshops");

        return Ok(new { Message = $"Workshop '{workshop.Title}' has been rejected.", Reason = request.Reason });
    }

    // PUT: api/admin/suspend-provider/{id}
    [HttpPut("suspend-provider/{id}")]
    public async Task<IActionResult> SuspendProvider(int id, [FromBody] SuspendRequest request)
    {
        var provider = await _context.Providers.Include(p => p.User).FirstOrDefaultAsync(p => p.Id == id);
        if (provider == null) return NotFound("Provider not found");
        if (provider.Status == ProviderStatus.Suspended) return BadRequest("Provider is already suspended.");

        provider.Status = ProviderStatus.Suspended;
        provider.ReviewNotes = request.Reason;
        provider.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        // Email
        if (provider.User?.Email != null)
        {
            var body = EmailTemplates.GetNotificationEmail("Your Host Account Has Been Suspended",
                $"Your BookMyWorkshop host account (<b>{provider.BusinessName}</b>) has been suspended.<br/><br/>"
              + $"<b>Reason:</b> <i>{request.Reason}</i><br/><br/>"
              + "All your active workshops have been hidden from the marketplace. "
              + "Please contact support if you believe this is a mistake.");
            await _emailService.SendEmailAsync(provider.User.Email, "Account Suspended - BookMyWorkshop", body);
        }

        // In-app notification
        await _notificationService.CreateNotificationAsync(provider.UserId,
            "Account Suspended",
            $"Your host account has been suspended. Reason: {request.Reason}",
            NotificationType.Alert,
            "/host/settings");

        try
        {
            var logService = HttpContext.RequestServices.GetRequiredService<ISystemLogService>();
            await logService.LogWarningAsync("Moderation", $"Host account '{provider.BusinessName}' (ID: {id}) suspended. Reason: {request.Reason}.", User.Identity?.Name ?? "Admin");
        }
        catch {}

        return Ok(new { Message = $"Provider '{provider.BusinessName}' has been suspended." });
    }

    // PUT: api/admin/unsuspend-provider/{id}
    [HttpPut("unsuspend-provider/{id}")]
    public async Task<IActionResult> UnsuspendProvider(int id)
    {
        var provider = await _context.Providers.Include(p => p.User).FirstOrDefaultAsync(p => p.Id == id);
        if (provider == null) return NotFound("Provider not found");
        if (provider.Status != ProviderStatus.Suspended) return BadRequest("Provider is not suspended.");

        provider.Status = ProviderStatus.Approved;
        provider.ReviewNotes = null;
        provider.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        // Email
        if (provider.User?.Email != null)
        {
            var body = EmailTemplates.GetNotificationEmail("Your Host Account Has Been Reinstated",
                $"Great news! Your BookMyWorkshop host account (<b>{provider.BusinessName}</b>) has been reinstated.<br/><br/>"
              + "You can now log back in and your workshops will be visible again. "
              + "Please ensure you follow our community guidelines going forward.");
            await _emailService.SendEmailAsync(provider.User.Email, "Account Reinstated - BookMyWorkshop", body);
        }

        await _notificationService.CreateNotificationAsync(provider.UserId,
            "Account Reinstated",
            "Your host account suspension has been lifted. Welcome back!",
            NotificationType.Success,
            "/host/dashboard");

        try
        {
            var logService = HttpContext.RequestServices.GetRequiredService<ISystemLogService>();
            await logService.LogInfoAsync("Moderation", $"Host account '{provider.BusinessName}' (ID: {id}) suspension lifted.", User.Identity?.Name ?? "Admin");
        }
        catch {}

        return Ok(new { Message = $"Provider '{provider.BusinessName}' has been reinstated." });
    }

    public class SuspendRequest
    {
        public string Reason { get; set; } = string.Empty;
    }

    // PUT: api/admin/suspend-user/{userId}
    [HttpPut("suspend-user/{userId}")]
    public async Task<IActionResult> SuspendUser(string userId, [FromBody] SuspendRequest request)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return NotFound("User not found");

        // Use ASP.NET Identity's built-in lockout mechanism
        await _userManager.SetLockoutEnabledAsync(user, true);
        await _userManager.SetLockoutEndDateAsync(user, DateTimeOffset.MaxValue);

        if (!string.IsNullOrEmpty(user.Email))
        {
            var body = EmailTemplates.GetNotificationEmail("Your Account Has Been Suspended",
                $"Your BookMyWorkshop account has been suspended.<br/><br/>"
              + $"<b>Reason:</b> <i>{request.Reason}</i><br/><br/>"
              + "If you believe this is a mistake, please contact our support team at "
              + "<a href='mailto:support@bookmyworkshop.com'>support@bookmyworkshop.com</a>.");
            await _emailService.SendEmailAsync(user.Email, "Account Suspended - BookMyWorkshop", body);
        }

        try
        {
            var logService = HttpContext.RequestServices.GetRequiredService<ISystemLogService>();
            await logService.LogWarningAsync("Moderation", $"User account '{user.FullName}' (Email: {user.Email}) suspended. Reason: {request.Reason}.", User.Identity?.Name ?? "Admin");
        }
        catch {}

        return Ok(new { Message = $"User '{user.FullName}' has been suspended." });
    }

    // PUT: api/admin/unsuspend-user/{userId}
    [HttpPut("unsuspend-user/{userId}")]
    public async Task<IActionResult> UnsuspendUser(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return NotFound("User not found");

        await _userManager.SetLockoutEndDateAsync(user, null);
        await _userManager.ResetAccessFailedCountAsync(user);

        if (!string.IsNullOrEmpty(user.Email))
        {
            var body = EmailTemplates.GetNotificationEmail("Your Account Has Been Reinstated",
                "Your BookMyWorkshop account suspension has been lifted. "
              + "You can now log in and use the platform normally. "
              + "Please ensure you follow our community guidelines going forward.");
            await _emailService.SendEmailAsync(user.Email, "Account Reinstated - BookMyWorkshop", body);
        }

        try
        {
            var logService = HttpContext.RequestServices.GetRequiredService<ISystemLogService>();
            await logService.LogInfoAsync("Moderation", $"User account '{user.FullName}' (Email: {user.Email}) suspension lifted.", User.Identity?.Name ?? "Admin");
        }
        catch {}

        return Ok(new { Message = $"User '{user.FullName}' has been reinstated." });
    }

    // GET: api/admin/users
    [HttpGet("users")]
    public async Task<IActionResult> GetUsers([FromQuery] string? role)
    {

        if (role == "Provider")
        {
            var admins = await _userManager.GetUsersInRoleAsync(UserRoles.Admin);
            var adminIds = admins.Select(a => a.Id).ToList();

            var providers = await _context.Providers
                .Include(p => p.User)
                .Where(p => !adminIds.Contains(p.UserId))
                .Select(p => new
                {
                    Id = p.User.Id,
                    FullName = p.BusinessName,
                    p.User.Email,
                    p.User.PhoneNumber,
                    p.User.EmailConfirmed,
                    Role = "Provider",
                    ProviderId = p.Id,
                    IsSuspended = p.Status == ProviderStatus.Suspended,
                    Status = p.Status == ProviderStatus.Approved ? "Active" :
                             p.Status == ProviderStatus.Suspended ? "Suspended" :
                             p.Status == ProviderStatus.PendingReview ? "Pending" :
                             p.Status == ProviderStatus.Incomplete ? "Incomplete" : "Other"
                })
                .ToListAsync();
            return Ok(providers);
        }

        if (role == "Customer")
        {
            var excludedUserIds = new HashSet<string>();
            foreach (var admin in await _userManager.GetUsersInRoleAsync(UserRoles.Admin))
                excludedUserIds.Add(admin.Id);
            foreach (var superAdmin in await _userManager.GetUsersInRoleAsync(UserRoles.SuperAdmin))
                excludedUserIds.Add(superAdmin.Id);

            var providerUserIds = (await _context.Providers.Select(p => p.UserId).ToListAsync()).ToHashSet();

            // Clients = any account that is not admin/super-admin and has no host (Provider) profile.
            // Includes email/password and Google users
            var filteredCustomers = await _userManager.Users
                .Where(u => !excludedUserIds.Contains(u.Id) && !providerUserIds.Contains(u.Id))
                .OrderByDescending(u => u.CreatedAt)
                .Select(u => new
                {
                    u.Id,
                    u.FullName,
                    u.Email,
                    u.PhoneNumber,
                    u.EmailConfirmed,
                    Role = "Customer",
                    IsSuspended = u.LockoutEnd != null && u.LockoutEnd > DateTimeOffset.UtcNow,
                    Status = (u.LockoutEnd != null && u.LockoutEnd > DateTimeOffset.UtcNow) ? "Suspended" : "Active"
                })
                .ToListAsync();

            return Ok(filteredCustomers);
        }

        return BadRequest("Please specify a role (Customer or Provider).");
    }

    // PUT: api/admin/verify-user/{userId}
    [HttpPut("verify-user/{userId}")]
    public async Task<IActionResult> VerifyUser(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return NotFound("User not found");

        if (user.EmailConfirmed) return BadRequest("User is already verified");

        user.EmailConfirmed = true;
        var result = await _userManager.UpdateAsync(user);

        if (!result.Succeeded)
        {
            return StatusCode(500, new { errors = result.Errors });
        }

        return Ok(new { Message = $"User '{user.FullName}' has been manually verified." });
    }

    // POST: api/admin/reviews/remoderate
    [HttpPost("reviews/remoderate")]
    public async Task<IActionResult> RemoderateAllReviews()
    {
        var reviews = await _context.WorkshopReviews.ToListAsync();
        var flagged = 0;

        foreach (var review in reviews)
        {
            var (isFlagged, score, _) = await _reviewModeration.AnalyzeAsync(review.Comment);
            review.IsFlagged = isFlagged;
            review.OffensiveScore = score;
            if (isFlagged) flagged++;
        }

        await _context.SaveChangesAsync();
        return Ok(new { updated = reviews.Count, flagged });
    }

    // POST: api/admin/seed-sample-reviews?force=false
    [HttpPost("seed-sample-reviews")]
    public async Task<IActionResult> SeedSampleReviews([FromQuery] bool force = false)
    {
        var result = await _reviewSeedService.SeedSampleReviewsAsync(force);
        if (result.ReviewsCreated == 0 && !result.Skipped)
            return BadRequest(new { result.Message, result.Skipped, result.Items });

        return Ok(result);
    }

    // GET: api/admin/reviews?filter=all|flagged
    [HttpGet("reviews")]
    public async Task<IActionResult> GetReviews([FromQuery] string filter = "all")
    {
        var query = _context.WorkshopReviews
            .AsNoTracking()
            .Include(r => r.User)
            .Include(r => r.Workshop)
            .AsQueryable();

        if (string.Equals(filter, "flagged", StringComparison.OrdinalIgnoreCase))
            query = query.Where(r => r.IsFlagged);

        var reviews = await query
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return Ok(reviews.Select(MapAdminReview));
    }

    // GET: api/admin/reviews/flagged (legacy alias)
    [HttpGet("reviews/flagged")]
    public Task<IActionResult> GetFlaggedReviews() => GetReviews("flagged");

    private static DTOs.Responses.AdminReviewResponse MapAdminReview(WorkshopReview r) =>
        new()
        {
            Id = r.Id,
            WorkshopId = r.WorkshopId,
            WorkshopTitle = r.Workshop.Title,
            UserName = r.User.FullName ?? "Unknown",
            UserEmail = r.User.Email ?? "",
            Rating = r.Rating,
            Comment = r.Comment,
            ImageUrls = r.ImageUrls,
            IsFlagged = r.IsFlagged,
            OffensiveScore = r.OffensiveScore,
            CreatedAt = r.CreatedAt
        };

    // DELETE: api/admin/reviews/{id}
    [HttpDelete("reviews/{id}")]
    public async Task<IActionResult> DeleteFlaggedReview(int id)
    {
        var review = await _context.WorkshopReviews.FindAsync(id);
        if (review == null) return NotFound(new { message = "Review not found." });

        if (!review.IsFlagged)
        {
            return BadRequest(new { message = "Only flagged reviews can be removed from this panel." });
        }

        _context.WorkshopReviews.Remove(review);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("overview-stats")]
    public async Task<IActionResult> GetOverviewStats()
    {
        var totalRevenue = await _context.Bookings
            .Where(b => b.PaymentStatus == PaymentStatus.Paid 
                     && b.BookingStatus != BookingStatus.Refunded
                     && b.PayoutStatus != PayoutStatus.Escrow)
            .SumAsync(b => b.PlatformFee - b.VatOnCommission);

        var activeWorkshops = await _context.Workshops.CountAsync(w => w.Status == WorkshopStatus.Published);
        var pendingHosts = await _context.Providers.CountAsync(p => p.Status == ProviderStatus.PendingReview);
        var totalUsers = await _context.Users.CountAsync();
        var flaggedReviews = await _context.WorkshopReviews.CountAsync(r => r.IsFlagged);
        var totalReviews = await _context.WorkshopReviews.CountAsync();

        return Ok(new AdminOverviewStatsResponse
        {
            TotalRevenue = totalRevenue,
            ActiveWorkshops = activeWorkshops,
            PendingHosts = pendingHosts,
            TotalUsers = totalUsers,
            FlaggedReviews = flaggedReviews,
            TotalReviews = totalReviews
        });
    }
}

public class AdminOverviewStatsResponse
{
    public decimal TotalRevenue { get; set; }
    public int ActiveWorkshops { get; set; }
    public int PendingHosts { get; set; }
    public int TotalUsers { get; set; }
    public int FlaggedReviews { get; set; }
    public int TotalReviews { get; set; }
}
