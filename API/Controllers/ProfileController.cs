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

namespace API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ProfileController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IMediaService _mediaService;
    private readonly IUserService _userService;
    private readonly ApplicationDbContext _context;

    public ProfileController(UserManager<ApplicationUser> userManager, IMediaService mediaService, IUserService userService, ApplicationDbContext context)
    {
        _userManager = userManager;
        _mediaService = mediaService;
        _userService = userService;
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
            PhoneNumber = user.PhoneNumber,
            GoogleId = user.GoogleId,
            EmailConfirmed = user.EmailConfirmed,
            IsDeactivated = user.IsDeactivated,
            DeletionScheduledAt = user.DeletionScheduledAt,
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
            PhoneNumber = user.PhoneNumber,
            GoogleId = user.GoogleId,
            EmailConfirmed = user.EmailConfirmed,
            IsDeactivated = user.IsDeactivated,
            DeletionScheduledAt = user.DeletionScheduledAt,
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
        user.PhoneNumber = request.PhoneNumber;

        if (!string.IsNullOrEmpty(request.Email) && request.Email != user.Email)
        {
             user.Email = request.Email;
             user.UserName = request.Email;
             user.NormalizedEmail = request.Email.ToUpper();
             user.NormalizedUserName = request.Email.ToUpper();
        }

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
            PhoneNumber = user.PhoneNumber,
            GoogleId = user.GoogleId,
            EmailConfirmed = user.EmailConfirmed,
            IsDeactivated = user.IsDeactivated,
            DeletionScheduledAt = user.DeletionScheduledAt,
            CreatedAt = user.CreatedAt
        };
    }

    [HttpPut("deactivate")]
    public async Task<ActionResult> DeactivateAccount()
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        if (email == null) return Unauthorized();

        var user = await _userManager.FindByEmailAsync(email);
        if (user == null) return NotFound();

        user.IsDeactivated = true;
        await _userManager.UpdateAsync(user);

        return Ok(new { message = "Account deactivated successfully. You can reactivate by logging in anytime." });
    }

    [HttpDelete("delete")]
    public async Task<ActionResult> RequestAccountDeletion()
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        if (email == null) return Unauthorized();

        var user = await _userManager.FindByEmailAsync(email);
        if (user == null) return NotFound();

        user.IsDeactivated = true;
        user.DeletionScheduledAt = DateTime.UtcNow;
        await _userManager.UpdateAsync(user);

        return Ok(new { message = "Deletion scheduled. Your data will be permanently removed in 30 days. Log in to cancel this request." });
    }

    [HttpPost("reactivate")]
    public async Task<ActionResult> ReactivateAccount()
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        if (email == null) return Unauthorized();

        var user = await _userManager.FindByEmailAsync(email);
        if (user == null) return NotFound();

        user.IsDeactivated = false;
        user.DeletionScheduledAt = null;
        await _userManager.UpdateAsync(user);

        return Ok(new { message = "Welcome back! Your account has been reactivated." });
    }

    [ApiExplorerSettings(IgnoreApi = true)]
    [HttpDelete("hard-delete-internal/{userId}")]
    public async Task<ActionResult> HardDeleteInternal(string userId)
    {
        var success = await _userService.HardDeleteUserAsync(userId);
        if (!success) return BadRequest(new { message = "Failed to hard delete user" });
        return Ok(new { message = "User purged successfully" });
    }
}
