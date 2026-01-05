using System.Security.Claims;
using API.Data;
using API.Dtos.Requests;
using API.Dtos.Responses;
using API.Entities;
using API.Enums;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[Authorize(Roles = "Provider,Admin")]
[ApiController]
[Route("api/[controller]")]
public class ProviderController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IMediaService _mediaService;

    public ProviderController(ApplicationDbContext context, UserManager<ApplicationUser> userManager, IMediaService mediaService)
    {
        _context = context;
        _userManager = userManager;
        _mediaService = mediaService;
    }

    [HttpGet("profile")]
    public async Task<ActionResult<ProviderProfileResponse>> GetProviderProfile()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var provider = await _context.Providers
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.UserId == userId);

        if (provider == null) return NotFound("Provider profile not found");

        if (provider.Status == ProviderStatus.Approved && !provider.IsApproved)
        {
            provider.IsApproved = true;
            await _context.SaveChangesAsync();
        }

        return new ProviderProfileResponse
        {
            Id = provider.Id,
            BusinessName = provider.BusinessName,
            PhoneNumber = provider.PhoneNumber,
            Address = provider.Address,
            State = provider.State,
            Website = provider.Website,
            Tagline = provider.Tagline,
            Description = provider.Description,
            Slug = provider.Slug,
            LogoUrl = provider.LogoUrl,
            CoverImageUrl = provider.CoverImageUrl,
            Status = provider.Status,
            IsApproved = provider.IsApproved,
            ContactPerson = provider.User.FullName,
            Email = provider.User.Email!
        };
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

        return Ok(new ProviderProfileResponse
        {
            Id = provider.Id,
            BusinessName = provider.BusinessName,
            PhoneNumber = provider.PhoneNumber,
            Address = provider.Address,
            State = provider.State,
            Website = provider.Website,
            Tagline = provider.Tagline,
            Description = provider.Description,
            Slug = provider.Slug,
            LogoUrl = provider.LogoUrl,
            CoverImageUrl = provider.CoverImageUrl,
            Status = provider.Status,
            IsApproved = provider.IsApproved,
            ContactPerson = provider.User.FullName,
            Email = provider.User.Email!
        });
    }

    [HttpPost("upload-logo")]
    public async Task<IActionResult> UploadLogo(IFormFile file)
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
    public async Task<IActionResult> UploadBanner(IFormFile file)
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
}
