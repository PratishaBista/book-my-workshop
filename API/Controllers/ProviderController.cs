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

[Authorize(Roles = "Provider,Admin")]
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

    [HttpGet("profile")]
    public async Task<ActionResult<ProviderProfileResponse>> GetProviderProfile()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var provider = await _context.Providers
            .Include(p => p.User)
            .Include(p => p.Venues)
            .FirstOrDefaultAsync(p => p.UserId == userId);

        if (provider == null) return NotFound("Provider profile not found");

        if (provider.Status == ProviderStatus.Approved && !provider.IsApproved)
        {
            provider.IsApproved = true;
            await _context.SaveChangesAsync();
        }

        return _mapper.Map<ProviderProfileResponse>(provider);
    }

    [HttpPut("profile")]
    public async Task<ActionResult<ProviderProfileResponse>> UpdateProviderProfile([FromBody] UpdateProviderProfileRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var provider = await _context.Providers
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.UserId == userId);

        if (provider == null) return NotFound("Provider profile not found");

        if (!string.IsNullOrEmpty(request.Slug) && request.Slug != provider.Slug)
        {
            var exists = await _context.Providers.AnyAsync(p => p.Slug == request.Slug);
            if (exists) return BadRequest(new { message = "This business handle is already taken." });
            provider.Slug = request.Slug.ToLower().Replace(" ", "-");
        }

        provider.BusinessName = request.BusinessName;
        provider.PhoneNumber = request.PhoneNumber;
        provider.Address = request.Address;
        provider.State = request.State;
        provider.VenueName = request.VenueName;
        provider.Latitude = request.Latitude;
        provider.Longitude = request.Longitude;
        provider.Website = request.Website;
        provider.Tagline = request.Tagline;
        provider.Description = request.Description;
        provider.LogoUrl = request.LogoUrl;
        provider.CoverImageUrl = request.CoverImageUrl;
        provider.UpdatedAt = DateTime.UtcNow;

        if (request.SubmitForReview && provider.Status == ProviderStatus.Incomplete)
        {
            if (string.IsNullOrEmpty(provider.Tagline) || string.IsNullOrEmpty(provider.Description))
            {
                return BadRequest(new { message = "Please complete your tagline and description before submitting." });
            }
            provider.Status = ProviderStatus.PendingReview;
        }

        await _context.SaveChangesAsync();

        return Ok(_mapper.Map<ProviderProfileResponse>(provider));
    }

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

    // Trust & Safety - Private S3 Uploads
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

    [HttpPost("submit-verification")]
    public async Task<IActionResult> SubmitForVerification()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var provider = await _context.Providers.FirstOrDefaultAsync(p => p.UserId == userId);
        if (provider == null) return NotFound();

        if (string.IsNullOrEmpty(provider.IdCardUrl) || string.IsNullOrEmpty(provider.PanCardUrl) || string.IsNullOrEmpty(provider.StudioImageUrl))
        {
            return BadRequest(new { message = "Please upload your Government ID, PAN Certificate, and Studio Image." });
        }



        provider.Status = ProviderStatus.PendingReview;
        provider.UpdatedAt = DateTime.UtcNow;
        
        await _context.SaveChangesAsync();

        // Notify Admins
        await _notificationService.NotifyRoleAsync("Admin", 
            "New Host Application", 
            $"{provider.BusinessName} has submitted their profile for verification.", 
            NotificationType.Info, 
            "/admin/pending-hosts");

        return Ok(new { message = "Profile submitted for review. Admin will verify shortly." });
    }

    [HttpGet("earnings")]
    public async Task<ActionResult<HostEarningsResponse>> GetEarnings()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var provider = await _context.Providers.FirstOrDefaultAsync(p => p.UserId == userId);
        
        if (provider == null) return NotFound("Provider profile not found");

        var bookings = await _context.Bookings
            .Include(b => b.WorkshopSchedule)
                .ThenInclude(s => s.Workshop)
            .Include(b => b.User)
            .Where(b => b.WorkshopSchedule.Workshop.ProviderId == provider.Id && 
                        (b.PaymentStatus == PaymentStatus.Paid || b.PaymentStatus == PaymentStatus.Refunded))
            .OrderByDescending(b => b.BookingDate)
            .ToListAsync();

        var totalEarnings = bookings.Where(b => b.PaymentStatus == PaymentStatus.Paid).Sum(b => b.HostEarnings);
        
        // "Pending" currently maps to funds in Escrow for the Host
        var pendingPayouts = bookings.Where(b => b.PayoutStatus == PayoutStatus.Escrow && b.PaymentStatus == PaymentStatus.Paid).Sum(b => b.HostEarnings);
        
        // "PaidOut" maps to what the platform has settled to the host bank
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
            WalletBalance = provider.WalletBalance,
            TotalEarnings = totalEarnings,
            PendingPayouts = pendingPayouts,
            PaidOut = paidOut,
            TotalBookings = bookings.Count,
            RecentTransactions = transactions
        };
    }

    [HttpGet("stats")]
    public async Task<ActionResult<HostStatsResponse>> GetStats()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var provider = await _context.Providers.FirstOrDefaultAsync(p => p.UserId == userId);
        
        if (provider == null) return NotFound("Provider profile not found");

        var bookings = await _context.Bookings
            .Include(b => b.WorkshopSchedule)
                .ThenInclude(s => s.Workshop)
            .Where(b => b.WorkshopSchedule.Workshop.ProviderId == provider.Id && 
                        (b.PaymentStatus == PaymentStatus.Paid || b.PaymentStatus == PaymentStatus.Refunded))
            .ToListAsync();

        var totalBookings = bookings.Count;
        var activeWorkshops = await _context.Workshops.CountAsync(w => w.ProviderId == provider.Id && w.Status == WorkshopStatus.Published);
        var totalRevenue = bookings.Where(b => b.PaymentStatus == PaymentStatus.Paid).Sum(b => b.HostEarnings);
        
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

public class HostStatsResponse
{
    public int TotalBookings { get; set; }
    public int ActiveWorkshops { get; set; }
    public decimal TotalRevenue { get; set; }
    public double AvgRating { get; set; }
}
