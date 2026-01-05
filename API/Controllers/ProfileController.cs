using System.Security.Claims;
using API.Dtos.Requests;
using API.Dtos.Responses;
using API.Entities;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ProfileController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IMediaService _mediaService;

    public ProfileController(UserManager<ApplicationUser> userManager, IMediaService mediaService)
    {
        _userManager = userManager;
        _mediaService = mediaService;
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
            FirstName = user.FirstName,
            Surname = user.Surname,
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
            FirstName = user.FirstName,
            Surname = user.Surname,
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

        user.FirstName = request.FirstName;
        user.Surname = request.Surname;
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

        user.FullName = string.Join(" ", new[] { request.FirstName, request.Surname }.Where(s => !string.IsNullOrEmpty(s)));

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded) return BadRequest(result.Errors);

        return new ProfileResponse
        {
            Email = user.Email!,
            FirstName = user.FirstName,
            Surname = user.Surname,
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
}
