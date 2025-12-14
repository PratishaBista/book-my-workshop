using API.Data;
using API.DTOs.Requests.Auth;
using API.DTOs.Responses.Auth;
using API.Entities;
using API.Services;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly TokenService _tokenService;
    private readonly IConfiguration _configuration;
    private readonly ApplicationDbContext _context;

    public AuthController(UserManager<ApplicationUser> userManager, TokenService tokenService, IConfiguration configuration, ApplicationDbContext context)
    {
        _userManager = userManager;
        _tokenService = tokenService;
        _configuration = configuration;
        _context = context;
    }

    [HttpPost("provider/signup")]
    public async Task<IActionResult> RegisterProvider([FromBody] ProviderRegisterRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser != null) return BadRequest("Email already exists");

        // 1. Create User
        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            FullName = request.ContactPerson,
            PhoneNumber = request.PhoneNumber
        };

        var result = await _userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded) return BadRequest(result.Errors);

        // 2. Assign Role
        await _userManager.AddToRoleAsync(user, API.Enums.UserRoles.Provider);

        // 3. Create Provider Profile
        var provider = new Provider
        {
            BusinessName = request.BusinessName,
            PhoneNumber = request.PhoneNumber,
            State = request.State,
            Address = request.State, // Initially set Address as State
            Website = request.Website,
            ReferralSource = request.ReferralSource,
            UserId = user.Id,
            IsApproved = false // Default to pending
        };

        _context.Providers.Add(provider);
        await _context.SaveChangesAsync();

        // Generate email confirmation token
        var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);

        return Ok(new { Message = "Provider account created. Pending admin approval. Please verify your email.", Token = token });
    }

    [HttpPost("signup")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser != null) return BadRequest("Email already exists");

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            FullName = request.FullName
        };

        var result = await _userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded)
        {
            return BadRequest(result.Errors);
        }

        // Assign default User role
        await _userManager.AddToRoleAsync(user, API.Enums.UserRoles.User);

        // Generate email confirmation token
        var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        
        return Ok(new { Message = "User registered successfully. Please verify your email.", Token = token });
    }

    [HttpPost("verify-email")]
    public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null) return BadRequest("Invalid request");

        var result = await _userManager.ConfirmEmailAsync(user, request.Token);

        if (!result.Succeeded) return BadRequest("Email verification failed");

        return Ok("Email verified successfully. You can now login.");
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null) return Unauthorized("Invalid credentials");

        if (!await _userManager.CheckPasswordAsync(user, request.Password))
            return Unauthorized("Invalid credentials");

        if (!await _userManager.IsEmailConfirmedAsync(user))
            return Unauthorized("Email not confirmed. Please check your inbox.");

        var roles = await _userManager.GetRolesAsync(user);
        var role = roles.FirstOrDefault() ?? "User"; // Default to User if no role found

        bool isApproved = true;
        if (role == "Provider")
        {
            var provider = await _context.Providers.FirstOrDefaultAsync(p => p.UserId == user.Id);
            if (provider != null)
            {
                isApproved = provider.IsApproved;
            }
        }

        var (token, expiry) = _tokenService.CreateToken(user, role);

        return Ok(new LoginResponse { Token = token, Expiry = expiry, IsApproved = isApproved });
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null) return BadRequest("User not found"); 

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        
        return Ok(new { Token = token });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null) return BadRequest("Invalid request");

        var result = await _userManager.ResetPasswordAsync(user, request.Token, request.NewPassword);

        if (!result.Succeeded) return BadRequest(result.Errors);

        return Ok("Password reset successfully");
    }

    [HttpPost("google")]
    public async Task<ActionResult<LoginResponse>> GoogleLogin([FromBody] GoogleLoginRequest request)
    {
        try
        {
            var settings = new GoogleJsonWebSignature.ValidationSettings()
            {
               // Audience = new List<string> { _configuration["Google:ClientId"] } // Optional validation
            };
            
            var payload = await GoogleJsonWebSignature.ValidateAsync(request.IdToken, settings);
            
            var user = await _userManager.FindByEmailAsync(payload.Email);
            
            if (user == null)
            {
                user = new ApplicationUser
                {
                    UserName = payload.Email,
                    Email = payload.Email,
                    GoogleId = payload.Subject,
                    EmailConfirmed = true
                };
                
                var result = await _userManager.CreateAsync(user); 
                if (!result.Succeeded) return BadRequest(result.Errors);
            }
            else if (string.IsNullOrEmpty(user.GoogleId))
            {
                user.GoogleId = payload.Subject;
                user.EmailConfirmed = true; 
                await _userManager.UpdateAsync(user);
            }
            
            var roles = await _userManager.GetRolesAsync(user);
            var role = roles.FirstOrDefault() ?? "User";

            var (token, expiry) = _tokenService.CreateToken(user, role);
            return Ok(new LoginResponse { Token = token, Expiry = expiry });

        }
        catch (Exception ex)
        {
            return BadRequest("Invalid Google Token: " + ex.Message);
        }
    }
}