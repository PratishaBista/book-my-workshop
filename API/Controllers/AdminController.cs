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
                RegisteredAt = p.CreatedAt
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
            .Where(w => w.Status == WorkshopStatus.PendingReview)
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
                // AI Fields
                w.AISuggestedCategory,
                w.AIConfidenceScore,
                w.AIIsConfident
            })
            .ToListAsync();

        return Ok(pendingWorkshops);
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
            .Where(w => w.Status == WorkshopStatus.Published)
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
        var workshop = await _context.Workshops.Include(w => w.Categories).FirstOrDefaultAsync(w => w.Id == id);
        if (workshop == null) return NotFound("Workshop not found");

        if (workshop.Status == WorkshopStatus.Published) return BadRequest("Workshop is already published");

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
        workshop.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new { Message = $"Workshop '{workshop.Title}' approved and published." });
    }

    // PUT: api/admin/reject-workshop/{id}
    [HttpPut("reject-workshop/{id}")]
    public async Task<IActionResult> RejectWorkshop(int id)
    {
        var workshop = await _context.Workshops.FindAsync(id);
        if (workshop == null) return NotFound("Workshop not found");

        workshop.Status = WorkshopStatus.Rejected;
        await _context.SaveChangesAsync();

        return Ok(new { Message = $"Workshop '{workshop.Title}' has been rejected." });
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
}
