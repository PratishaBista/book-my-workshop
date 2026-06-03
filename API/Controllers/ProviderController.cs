// provider controller manages host/provider operations
// includes profile management, document uploads for verification, earnings tracking, and stats
// accessible by users with provider or admin roles

using System.Security.Claims;
using System.Text.Json;
using API.Data;
using API.DTOs.Requests;
using API.DTOs.Responses;
using API.Entities;
using API.Enums;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;

namespace API.Controllers;

[Authorize(Roles = "Provider,Admin")]  // only providers and admins can access
[ApiController]
[Route("api/[controller]")]
public class ProviderController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IMapper _mapper;
    private readonly IMediaService _mediaService;
    private readonly IStorageService _storageService;
    private readonly IMLService _mlService;
    private readonly INotificationService _notificationService;

    public ProviderController(ApplicationDbContext context, UserManager<ApplicationUser> userManager, IMapper mapper, IMediaService mediaService, IStorageService storageService, IMLService mlService, INotificationService notificationService)
    {
        _context = context;
        _userManager = userManager;
        _mapper = mapper;
        _mediaService = mediaService;
        _storageService = storageService;
        _mlService = mlService;
        _notificationService = notificationService;
    }

    // retrieves the current provider's full profile
    // includes user details, venues, and status information
    // GET: api/provider/profile
    [HttpGet("profile")]
    public async Task<ActionResult<ProviderProfileResponse>> GetProviderProfile()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var provider = await _context.Providers
            .Include(p => p.User)
            .Include(p => p.Venues) // multiple venues per provider
            .FirstOrDefaultAsync(p => p.UserId == userId);

        if (provider == null) return NotFound("Provider profile not found");

        // auto-fix inconsistent state: approved status flag should match status enum
        if (provider.Status == ProviderStatus.Approved && !provider.IsApproved)
        {
            provider.IsApproved = true;
            await _context.SaveChangesAsync();
        }

        return _mapper.Map<ProviderProfileResponse>(provider);
    }

    // updates provider profile information
    // can also submit for admin review when profile is complete
    // PUT: api/provider/profile
    [HttpPut("profile")]
    public async Task<ActionResult<ProviderProfileResponse>> UpdateProviderProfile([FromBody] UpdateProviderProfileRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var provider = await _context.Providers
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.UserId == userId);

        if (provider == null) return NotFound("Provider profile not found");

        // update slug (business handle) if changed (must be unique)
        if (!string.IsNullOrEmpty(request.Slug) && request.Slug != provider.Slug)
        {
            var exists = await _context.Providers.AnyAsync(p => p.Slug == request.Slug);
            if (exists) return BadRequest(new { message = "This business handle is already taken." });
            provider.Slug = request.Slug.ToLower().Replace(" ", "-");
        }

        // update all profile fields
        provider.BusinessName = request.BusinessName;
        provider.PhoneNumber = request.PhoneNumber;
        provider.Address = request.Address;
        provider.State = request.State;
        provider.VenueName = request.VenueName;
        provider.Latitude = request.Latitude; // for map display
        provider.Longitude = request.Longitude;
        provider.Website = request.Website;
        provider.Tagline = request.Tagline; // short catchy phrase
        provider.Description = request.Description; // detailed business description
        provider.LogoUrl = request.LogoUrl;
        provider.CoverImageUrl = request.CoverImageUrl;
        provider.UpdatedAt = DateTime.UtcNow;

        // submit for admin review if requested and currently incomplete
        if (request.SubmitForReview && provider.Status == ProviderStatus.Incomplete)
        {
            // validation: require tagline and description before submission
            if (string.IsNullOrEmpty(provider.Tagline) || string.IsNullOrEmpty(provider.Description))
            {
                return BadRequest(new { message = "Please complete your tagline and description before submitting." });
            }
            provider.Status = ProviderStatus.PendingReview;
        }

        await _context.SaveChangesAsync();

        return Ok(_mapper.Map<ProviderProfileResponse>(provider));
    }

    // uploads business logo image
    // POST: api/provider/upload-logo
    [HttpPost("upload-logo")]
    public async Task<IActionResult> UploadLogo([FromForm] IFormFile file)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var provider = await _context.Providers.FirstOrDefaultAsync(p => p.UserId == userId);
        if (provider == null) return NotFound("Provider not found");

        try
        {
            var url = await _mediaService.UploadImageAsync(file, "providers/logos");
            provider.LogoUrl = url;
            await _context.SaveChangesAsync();
            return Ok(new { url });
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    // uploads banner/cover image for provider profile page
    // POST: api/provider/upload-banner
    [HttpPost("upload-banner")]
    public async Task<IActionResult> UploadBanner([FromForm] IFormFile file)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var provider = await _context.Providers.FirstOrDefaultAsync(p => p.UserId == userId);
        if (provider == null) return NotFound("Provider not found");

        try
        {
            var url = await _mediaService.UploadImageAsync(file, "providers/banners");
            provider.CoverImageUrl = url;
            await _context.SaveChangesAsync();
            return Ok(new { url });
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    // uploads government-issued id card for verification (sensitive document)
    // stored securely (only accessible by admins)
    // POST: api/provider/upload-id-card
    [HttpPost("upload-id-card")]
    public async Task<IActionResult> UploadIdCard([FromForm] IFormFile file)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var provider = await _context.Providers.FirstOrDefaultAsync(p => p.UserId == userId);
        if (provider == null) return NotFound();

        try
        {
            var url = await _mediaService.UploadImageAsync(file, "providers/verification");

            provider.IdCardUrl = url;
            provider.IdFileName = file.FileName;
            provider.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { url, message = "ID Card uploaded successfully" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "Upload failed.", detail = ex.Message });
        }
    }

    // uploads pan card (tax identification) for verification
    // required for payout processing in nepal
    // POST: api/provider/upload-pan-card
    [HttpPost("upload-pan-card")]
    public async Task<IActionResult> UploadPanCard([FromForm] IFormFile file)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var provider = await _context.Providers.FirstOrDefaultAsync(p => p.UserId == userId);
        if (provider == null) return NotFound();

        try
        {
            var url = await _mediaService.UploadImageAsync(file, "providers/verification");

            provider.PanCardUrl = url;
            provider.PanFileName = file.FileName;
            provider.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { url, message = "PAN Certificate uploaded successfully" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "Upload failed.", detail = ex.Message });
        }
    }

    // uploads studio image showing the workspace/facility
    // helps build trust with potential customers
    // POST: api/provider/upload-studio-image
    [HttpPost("upload-studio-image")]
    public async Task<IActionResult> UploadStudioImage([FromForm] IFormFile file)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var provider = await _context.Providers.FirstOrDefaultAsync(p => p.UserId == userId);
        if (provider == null) return NotFound();

        try
        {
            var url = await _mediaService.UploadImageAsync(file, "providers/studio");

            provider.StudioImageUrl = url;
            provider.StudioFileName = file.FileName;
            provider.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { url, message = "Studio image uploaded successfully" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "Upload failed.", detail = ex.Message });
        }
    }

    // submits provider profile for admin verification
    // requires all three verification documents (id, pan, studio image)
    // POST: api/provider/submit-verification
    [HttpPost("submit-verification")]
    public async Task<IActionResult> SubmitForVerification()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var provider = await _context.Providers.FirstOrDefaultAsync(p => p.UserId == userId);
        if (provider == null) return NotFound();

        // ensure all required documents are uploaded
        if (string.IsNullOrEmpty(provider.IdCardUrl) || string.IsNullOrEmpty(provider.PanCardUrl) || string.IsNullOrEmpty(provider.StudioImageUrl))
        {
            return BadRequest(new { message = "Please upload your Government ID, PAN Certificate, and Studio Image." });
        }

        // change status to pending review for admin approval
        provider.Status = ProviderStatus.PendingReview;
        provider.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        // notify all admin users about new application
        await _notificationService.NotifyRoleAsync("Admin",
            "New Host Application",
            $"{provider.BusinessName} has submitted their profile for verification.",
            NotificationType.Info,
            "/admin/pending-hosts");

        return Ok(new { message = "Profile submitted for review. Admin will verify shortly." });
    }

    // returns host earnings summary and transaction history
    // includes wallet balance, total earnings, pending payouts, and detailed transactions
    // GET: api/provider/earnings
    [HttpGet("earnings")]
    public async Task<ActionResult<HostEarningsResponse>> GetEarnings()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var provider = await _context.Providers.FirstOrDefaultAsync(p => p.UserId == userId);

        if (provider == null) return NotFound("Provider profile not found");

        // get all paid or refunded bookings for this provider
        var bookings = await _context.Bookings
            .Include(b => b.WorkshopSchedule)
                .ThenInclude(s => s.Workshop)
            .Include(b => b.User)
            .Where(b => b.WorkshopSchedule.Workshop.ProviderId == provider.Id &&
                        (b.PaymentStatus == PaymentStatus.Paid || b.PaymentStatus == PaymentStatus.Refunded))
            .OrderByDescending(b => b.BookingDate)
            .ToListAsync();

        var totalEarnings = bookings.Where(b => b.PaymentStatus == PaymentStatus.Paid).Sum(b => b.HostEarnings);

        // pending = funds still in escrow (workshop not completed yet)
        var pendingPayouts = bookings.Where(b => b.PayoutStatus == PayoutStatus.Escrow && b.PaymentStatus == PaymentStatus.Paid).Sum(b => b.HostEarnings);

        // paid out = funds already transferred to host's bank account
        var paidOut = bookings.Where(b => b.PayoutStatus == PayoutStatus.Paid).Sum(b => b.HostEarnings);

        var transactions = bookings.Select(b => new EarningTransactionResponse
        {
            BookingId = b.Id,
            WorkshopTitle = b.WorkshopSchedule.Workshop.Title,
            BookingDate = b.BookingDate,
            GuestName = b.User.FullName,
            NumberOfSeats = b.NumberOfSeats,
            TotalAmount = b.TotalAmount,
            PlatformFee = b.PlatformFee,
            HostEarnings = b.HostEarnings,
            PayoutStatus = b.PayoutStatus.ToString(),
            BookingStatus = b.BookingStatus.ToString()
        }).ToList();

        return new HostEarningsResponse
        {
            WalletBalance = provider.WalletBalance, // funds ready for withdrawal
            TotalEarnings = totalEarnings,
            PendingPayouts = pendingPayouts,
            PaidOut = paidOut,
            TotalBookings = bookings.Count,
            RecentTransactions = transactions
        };
    }

    // returns high-level statistics for host dashboard
    // includes booking counts, active workshops, revenue, and average rating
    // GET: api/provider/stats
    [HttpGet("stats")]
    public async Task<ActionResult<HostStatsResponse>> GetStats()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var provider = await _context.Providers.FirstOrDefaultAsync(p => p.UserId == userId);

        if (provider == null) return NotFound("Provider profile not found");

        // get all paid or refunded bookings
        var bookings = await _context.Bookings
            .Include(b => b.WorkshopSchedule)
                .ThenInclude(s => s.Workshop)
            .Where(b => b.WorkshopSchedule.Workshop.ProviderId == provider.Id &&
                        (b.PaymentStatus == PaymentStatus.Paid || b.PaymentStatus == PaymentStatus.Refunded))
            .ToListAsync();

        var totalBookings = bookings.Count;
        var activeWorkshops = await _context.Workshops.CountAsync(w => w.ProviderId == provider.Id && w.Status == WorkshopStatus.Published);
        var totalRevenue = bookings.Where(b => b.PaymentStatus == PaymentStatus.Paid).Sum(b => b.HostEarnings);

        // calculate average rating from workshop reviews
        // default to 5.0 if no reviews yet
        var avgRating = await _context.WorkshopReviews
            .Where(r => r.Workshop.ProviderId == provider.Id)
            .Select(r => (double?)r.Rating)
            .AverageAsync() ?? 5.0;

        return new HostStatsResponse
        {
            TotalBookings = totalBookings,
            ActiveWorkshops = activeWorkshops,
            TotalRevenue = totalRevenue,
            AvgRating = Math.Round(avgRating, 1)
        };
    }
}

// response dto for host statistics
public class HostStatsResponse
{
    public int TotalBookings { get; set; }
    public int ActiveWorkshops { get; set; }
    public decimal TotalRevenue { get; set; }
    public double AvgRating { get; set; }
}
