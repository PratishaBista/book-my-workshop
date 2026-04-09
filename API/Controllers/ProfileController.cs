using System.Security.Claims;
using API.DTOs.Requests;
using API.DTOs.Responses;
using API.DTOs.Requests.Auth;
using API.Entities;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using API.Data;
using Google.Apis.Auth;

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
    private readonly IConfiguration _configuration;

    public ProfileController(UserManager<ApplicationUser> userManager, IMediaService mediaService, IUserService userService, ApplicationDbContext context, IConfiguration configuration)
    {
        _userManager = userManager;
        _mediaService = mediaService;
        _userService = userService;
        _context = context;
        _configuration = configuration;
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
            HasPassword = await _userManager.HasPasswordAsync(user),
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
            HasPassword = await _userManager.HasPasswordAsync(user),
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
            HasPassword = await _userManager.HasPasswordAsync(user),
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
    public async Task<ActionResult> DeleteAccountNow()
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        if (email == null) return Unauthorized();

        var user = await _userManager.FindByEmailAsync(email);
        if (user == null) return NotFound();

        // 1. Identity Scrubbing (PII Removal)
        string randomId = Guid.NewGuid().ToString().Substring(0, 8);
        string oldEmail = user.Email!;
        
        // Change identity fields to anonymous values to free up the email for new accounts
        user.Email = $"deleted_{randomId}@bookmyworkshop.com";
        user.NormalizedEmail = user.Email.ToUpper();
        user.UserName = $"deleted_{randomId}";
        user.NormalizedUserName = user.UserName.ToUpper();
        user.FullName = "Deleted User";
        user.PhoneNumber = null;
        user.GoogleId = null;
        user.Bio = null;
        user.ProfilePictureUrl = null;
        user.CoverImageUrl = null;
        user.IsDeactivated = true;
        user.DeletionScheduledAt = DateTime.UtcNow; // Log when the purge happened

        // 2. Remove non-essential references
        var prefs = await _context.UserPreferences.Where(p => p.UserId == user.Id).ToListAsync();
        _context.UserPreferences.RemoveRange(prefs);

        // 3. Handle Provider Status if applicable
        var provider = await _context.Providers.FirstOrDefaultAsync(p => p.UserId == user.Id);
        if (provider != null)
        {
            provider.BusinessName = "Former Provider (Closed)";
            provider.Status = API.Enums.ProviderStatus.Suspended;
            provider.IsApproved = false;
            
            // Unpublish all their workshops
            var workshops = await _context.Workshops.Where(w => w.ProviderId == provider.Id).ToListAsync();
            foreach (var w in workshops)
            {
                w.IsActive = false;
                w.Status = API.Enums.WorkshopStatus.Archived;
            }
        }

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded) return BadRequest(result.Errors);

        await _context.SaveChangesAsync();

        return Ok(new { message = "Your account has been permanently deleted and all personal data has been removed." });
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

    [HttpPost("set-password")]
    public async Task<ActionResult> SetPassword(SetPasswordRequest request)
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        if (email == null) return Unauthorized();

        var user = await _userManager.FindByEmailAsync(email);
        if (user == null) return NotFound();

        var hasPassword = await _userManager.HasPasswordAsync(user);
        IdentityResult result;

        if (hasPassword)
        {
            if (string.IsNullOrEmpty(request.CurrentPassword))
                return BadRequest(new { message = "Current password is required to change password" });
            
            result = await _userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
        }
        else
        {
            result = await _userManager.AddPasswordAsync(user, request.NewPassword);
        }

        if (!result.Succeeded) return BadRequest(result.Errors);

        return Ok(new { message = "Password set successfully" });
    }

    [HttpPost("disconnect-google")]
    public async Task<ActionResult> DisconnectGoogle()
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        if (email == null) return Unauthorized();

        var user = await _userManager.FindByEmailAsync(email);
        if (user == null) return NotFound();

        var hasPassword = await _userManager.HasPasswordAsync(user);
        if (!hasPassword)
        {
            return BadRequest(new { message = "You must set a password before disconnecting your Google account to avoid being locked out." });
        }

        user.GoogleId = null;
        var result = await _userManager.UpdateAsync(user);

        if (!result.Succeeded) return BadRequest(result.Errors);

        return Ok(new { message = "Google account disconnected successfully." });
    }

    [HttpPost("link-google")]
    public async Task<ActionResult> LinkGoogle([FromBody] GoogleLoginRequest request)
    {
        try
        {
            var settings = new GoogleJsonWebSignature.ValidationSettings()
            {
                Audience = new List<string> { _configuration["Google:ClientId"]! }
            };
            
            var payload = await GoogleJsonWebSignature.ValidateAsync(request.IdToken, settings);
            
            var email = User.FindFirstValue(ClaimTypes.Email);
            var currentUser = await _userManager.FindByEmailAsync(email!);
            
            if (currentUser == null) return NotFound();

            if (!string.Equals(payload.Email, currentUser.Email, StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new { message = $"You can only link the Google account associated with your current email ({currentUser.Email})." });
            }
            
            // Check if this Google ID is already linked to another user
            var existingWithGoogle = await _userManager.Users.FirstOrDefaultAsync(u => u.GoogleId == payload.Subject);
            if (existingWithGoogle != null && existingWithGoogle.Id != currentUser!.Id)
            {
                return BadRequest(new { message = "This Google account is already linked to another BookMyWorkshop account." });
            }

            currentUser!.GoogleId = payload.Subject;
            currentUser.EmailConfirmed = true; 

            var result = await _userManager.UpdateAsync(currentUser);
            if (!result.Succeeded) return BadRequest(result.Errors);

            return Ok(new { message = "Google account linked successfully." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "Invalid Google Token: " + ex.Message });
        }
    }
}
