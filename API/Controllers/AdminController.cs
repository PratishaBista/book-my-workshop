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
[Authorize(Roles = UserRoles.Admin)]
public class AdminController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IEmailService _emailService;

    public AdminController(ApplicationDbContext context, UserManager<ApplicationUser> userManager, IEmailService emailService)
    {
        _context = context;
        _userManager = userManager;
        _emailService = emailService;
    }

    // GET: api/admin/providers/pending
    [HttpGet("providers/pending")]
    public async Task<IActionResult> GetPendingProviders()
    {
        var pendingProviders = await _context.Providers
            .Include(p => p.User)
            .Where(p => p.Status == ProviderStatus.PendingReview)
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
                p.TrustScore,
                p.TrustAnalysisJson
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

        return Ok(new { Message = $"Provider '{provider.BusinessName}' approved successfully." });
    }

    // GET: api/admin/workshops/pending
    [HttpGet("workshops/pending")]
    public async Task<IActionResult> GetPendingWorkshops()
    {
        var pendingWorkshops = await _context.Workshops
            .Include(w => w.Provider)
            .ThenInclude(p => p.User)
            .Include(w => w.Categories)
            .Include(w => w.Pricing)
            .Where(w => w.Status == WorkshopStatus.PendingReview || w.HasPendingModifications)
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
                PendingChanges = _context.WorkshopMedia.Where(m => false).ToList(), // Placeholder, we'll fetch actual modifications below
                // AI Fields
                w.AISuggestedCategory,
                w.AIConfidenceScore,
                w.AIIsConfident
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
                PendingData = pendingData,
                w.AISuggestedCategory, w.AIConfidenceScore, w.AIIsConfident
            });
        }

        return Ok(result);
    }

    // GET: api/admin/workshops/live
    [HttpGet("workshops/live")]
    public async Task<IActionResult> GetLiveWorkshops()
    {
        var liveWorkshops = await _context.Workshops
            .Include(w => w.Provider)
            .ThenInclude(p => p.User)
            .Include(w => w.Categories)
            .Include(w => w.Pricing)
            .Where(w => w.Status == WorkshopStatus.Published || (w.Status == WorkshopStatus.PendingReview && w.HasPendingModifications))
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
                Price = w.Pricing != null ? w.Pricing.BasePrice : 0,
                // AI Fields
                w.AISuggestedCategory,
                w.AIConfidenceScore
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
                    var newCategories = await _context.WorkshopCategories
                        .Where(c => pendingRequest.CategoryIds.Contains(c.Id))
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
        var workshop = await _context.Workshops.FindAsync(id);
        if (workshop == null) return NotFound("Workshop not found");

        workshop.Status = WorkshopStatus.Rejected;
        workshop.RejectionReason = request.Reason;
        workshop.RejectedAt = DateTime.UtcNow;
        workshop.UpdatedAt = DateTime.UtcNow;
        workshop.HasPendingModifications = false;
        
        await _context.SaveChangesAsync();

        return Ok(new { Message = $"Workshop '{workshop.Title}' has been rejected.", Reason = request.Reason });
    }

    // GET: api/admin/users
    [HttpGet("users")]
    public async Task<IActionResult> GetUsers([FromQuery] string? role)
    {

        if (role == "Provider")
        {
            var providers = await _context.Providers
                .Include(p => p.User)
                //.Where(p => p.IsApproved)
                .Select(p => new
                {
                    Id = p.User.Id,
                    FullName = p.BusinessName,
                    p.User.Email,
                    p.User.PhoneNumber,
                    p.User.EmailConfirmed,
                    Role = "Provider",
                    ProviderId = p.Id,
                    Status = p.Status == ProviderStatus.Approved ? "Active" :
                             p.Status == ProviderStatus.PendingReview ? "Pending" :
                             p.Status == ProviderStatus.Incomplete ? "Incomplete" : "Other"
                })
                .ToListAsync();
            return Ok(providers);
        }

        if (role == "Customer")
        {

            var customers = await _userManager.GetUsersInRoleAsync(UserRoles.User);

            var admins = await _userManager.GetUsersInRoleAsync(UserRoles.Admin);
            var adminIds = admins.Select(a => a.Id).ToHashSet();

            var providerUserIds = await _context.Providers.Select(p => p.UserId).ToListAsync();
            var providerUserIdSet = providerUserIds.ToHashSet();

            var filteredCustomers = customers
                .Where(u => !adminIds.Contains(u.Id))
                .Where(u => !providerUserIdSet.Contains(u.Id))
                .Select(u => new
                {
                    u.Id,
                    u.FullName,
                    u.Email,
                    u.PhoneNumber,
                    u.EmailConfirmed,
                    Role = "Customer",
                    Status = "Active"
                });

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
}
