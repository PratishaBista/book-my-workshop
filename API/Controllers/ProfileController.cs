using System.Security.Claims;
using API.DTOs.Requests;
using API.DTOs.Responses;
using API.Entities;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using API.Data;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ProfileController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IMediaService _mediaService;
    private readonly ApplicationDbContext _context;

    public ProfileController(UserManager<ApplicationUser> userManager, IMediaService mediaService, ApplicationDbContext context)
    {
        _userManager = userManager;
        _mediaService = mediaService;
        _context = context;
    }

    [HttpPost("upload-avatar")]
    public async Task<ActionResult> UploadAvatar([FromForm] IFormFile file)
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        if (email == null) return Unauthorized();

        var user = await _userManager.FindByEmailAsync(email);
        if (user == null) return NotFound();

        if (file == null || file.Length == 0)
        {
            return BadRequest(new { message = "No file uploaded or file is empty." });
        }

        try
        {
            var url = await _mediaService.UploadImageAsync(file, "profiles/avatars");
            user.ProfilePictureUrl = url;
            await _userManager.UpdateAsync(user);
            return Ok(new { url });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("upload-cover")]
    public async Task<ActionResult> UploadCover([FromForm] IFormFile file)
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        if (email == null) return Unauthorized();

        var user = await _userManager.FindByEmailAsync(email);
        if (user == null) return NotFound();

        if (file == null || file.Length == 0)
        {
            return BadRequest(new { message = "No file uploaded or file is empty." });
        }

        try
        {
            var url = await _mediaService.UploadImageAsync(file, "profiles/covers");
            user.CoverImageUrl = url;
            await _userManager.UpdateAsync(user);
            return Ok(new { url });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet]
    public async Task<ActionResult<ProfileResponse>> GetProfile()
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        if (email == null) return Unauthorized();

        var user = await _userManager.FindByEmailAsync(email);
        if (user == null) return NotFound();

        return new ProfileResponse
        {
            Email = user.Email!,
            FullName = user.FullName,
            Bio = user.Bio,
            Pronouns = user.Pronouns,
            ProfilePictureUrl = user.ProfilePictureUrl,
            CoverImageUrl = user.CoverImageUrl,
            Location = user.Location,
            Website = user.Website,
            FunFact = user.FunFact,
            ProfileUsername = user.ProfileUsername,
            CreatedAt = user.CreatedAt
        };
    }

    [AllowAnonymous]
    [HttpGet("u/{username}")]
    public async Task<ActionResult<ProfileResponse>> GetProfileByUsername(string username)
    {
        var user = await _userManager.Users.FirstOrDefaultAsync(u => u.ProfileUsername == username);
        if (user == null) return NotFound(new { message = "User not found" });

        return new ProfileResponse
        {
            Email = user.Email!,
            FullName = user.FullName,
            Bio = user.Bio,
            Pronouns = user.Pronouns,
            ProfilePictureUrl = user.ProfilePictureUrl,
            CoverImageUrl = user.CoverImageUrl,
            Location = user.Location,
            Website = user.Website,
            FunFact = user.FunFact,
            ProfileUsername = user.ProfileUsername,
            CreatedAt = user.CreatedAt
        };
    }

    [HttpPut]
    public async Task<ActionResult<ProfileResponse>> UpdateProfile(UpdateProfileRequest request)
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        if (email == null) return Unauthorized();

        var user = await _userManager.FindByEmailAsync(email);
        if (user == null) return NotFound();

        user.FullName = request.FullName ?? string.Empty;

        user.Bio = request.Bio;
        user.Pronouns = request.Pronouns;
        user.Location = request.Location;
        user.Website = request.Website;
        user.FunFact = request.FunFact;
        user.ProfilePictureUrl = request.ProfilePictureUrl;
        user.CoverImageUrl = request.CoverImageUrl;

        if (!string.IsNullOrEmpty(request.ProfileUsername) && request.ProfileUsername != user.ProfileUsername)
        {
            var existing = await _userManager.Users.AnyAsync(u => u.ProfileUsername == request.ProfileUsername);
            if (existing) return BadRequest(new { message = "Username is already taken" });
            user.ProfileUsername = request.ProfileUsername;
        }

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded) return BadRequest(result.Errors);

        return new ProfileResponse
        {
            Email = user.Email!,
            FullName = user.FullName,
            Bio = user.Bio,
            Pronouns = user.Pronouns,
            ProfilePictureUrl = user.ProfilePictureUrl,
            CoverImageUrl = user.CoverImageUrl,
            Location = user.Location,
            Website = user.Website,
            FunFact = user.FunFact,
            ProfileUsername = user.ProfileUsername,
            CreatedAt = user.CreatedAt
        };
    }

    [HttpDelete("delete")]
    public async Task<ActionResult> DeleteAccount()
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        if (email == null) return Unauthorized();

        var user = await _userManager.FindByEmailAsync(email);
        if (user == null) return NotFound();

        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            var reviews = await _context.WorkshopReviews
                .Where(r => r.UserId == user.Id)
                .ToListAsync();
            
            if (reviews.Any())
            {
                _context.WorkshopReviews.RemoveRange(reviews);
            }

            var bookings = await _context.Bookings
                .Where(b => b.UserId == user.Id)
                .ToListAsync();

            if (bookings.Any())
            {
                var bookingIds = bookings.Select(b => b.Id).ToList();
                var reviewsOnBookings = await _context.WorkshopReviews
                    .Where(r => bookingIds.Contains(r.BookingId))
                    .ToListAsync();
                
                if (reviewsOnBookings.Any())
                {
                    _context.WorkshopReviews.RemoveRange(reviewsOnBookings);
                }

                _context.Bookings.RemoveRange(bookings);
            }
            
            var provider = await _context.Providers.FirstOrDefaultAsync(p => p.UserId == user.Id);
            if (provider != null)
            {
                var workshops = await _context.Workshops
                    .Include(w => w.Schedules)
                    .Where(w => w.ProviderId == provider.Id)
                    .ToListAsync();

                foreach (var workshop in workshops)
                {
                    foreach (var schedule in workshop.Schedules)
                    {
                        var scheduleBookings = await _context.Bookings
                            .Where(b => b.WorkshopScheduleId == schedule.Id)
                            .ToListAsync();

                        if (scheduleBookings.Any())
                        {
                            var sBookingIds = scheduleBookings.Select(b => b.Id).ToList();
                            var sReviews = await _context.WorkshopReviews
                                .Where(r => sBookingIds.Contains(r.BookingId))
                                .ToListAsync();

                            if (sReviews.Any()) _context.WorkshopReviews.RemoveRange(sReviews);

                            _context.Bookings.RemoveRange(scheduleBookings);
                        }
                    }
                    
                     _context.Workshops.Remove(workshop);
                }

                _context.Providers.Remove(provider);
            }

            await _context.SaveChangesAsync();

            var result = await _userManager.DeleteAsync(user);
            if (!result.Succeeded)
            {
                throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));
            }

            await transaction.CommitAsync();

            return Ok(new { message = "Account deleted successfully" });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return BadRequest(new { message = "Failed to delete account", error = ex.Message });
        }
    }
}
