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
    private readonly IEmailService _emailService;

    public AuthController(UserManager<ApplicationUser> userManager, TokenService tokenService, IConfiguration configuration, ApplicationDbContext context, IEmailService emailService)
    {
        _userManager = userManager;
        _tokenService = tokenService;
        _configuration = configuration;
        _context = context;
        _emailService = emailService;
    }

    [HttpPost("provider/signup")]
    public async Task<IActionResult> RegisterProvider([FromBody] ProviderRegisterRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var user = await _userManager.FindByEmailAsync(request.Email);
        bool isNewUser = (user == null);

        if (!isNewUser)
        {
            // Verify password for existing user
            var passwordValid = await _userManager.CheckPasswordAsync(user!, request.Password);
            if (!passwordValid) 
                return BadRequest(new { message = "An account with this email already exists. Please use your existing password to upgrade to a host account." });

            // Check if already a provider
            var roles = await _userManager.GetRolesAsync(user!);
            if (roles.Contains(API.Enums.UserRoles.Provider))
                return BadRequest(new { message = "You are already registered as a host. Please login to access your dashboard." });
            
            // Upgrade existing user: add Provider role
            await _userManager.AddToRoleAsync(user!, API.Enums.UserRoles.Provider);
        }
        else
        {
            // 1. Create New User
            user = new ApplicationUser
            {
                UserName = request.Email,
                Email = request.Email,
                FullName = request.ContactPerson,
                PhoneNumber = request.PhoneNumber
            };

            var result = await _userManager.CreateAsync(user, request.Password);
            if (!result.Succeeded) return BadRequest(result.Errors);

            // 2. Assign Host Role Only
            await _userManager.AddToRoleAsync(user, API.Enums.UserRoles.Provider);
        }

        // 3. Create Provider Profile
        var existingProfile = await _context.Providers.AnyAsync(p => p.UserId == user!.Id);
        if (existingProfile) return BadRequest(new { message = "Provider profile already exists for this account." });

        var provider = new Provider
        {
            BusinessName = request.BusinessName,
            PhoneNumber = request.PhoneNumber,
            State = request.State,
            Address = request.State,
            Website = request.Website,
            ReferralSource = request.ReferralSource,
            UserId = user!.Id,
            Status = API.Enums.ProviderStatus.Incomplete,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Providers.Add(provider);
        await _context.SaveChangesAsync();

        // 4. Handle Verification for NO-AUTH users
        if (isNewUser || !user!.EmailConfirmed)
        {
            var token = await _userManager.GenerateEmailConfirmationTokenAsync(user!);
            var encodedToken = System.Net.WebUtility.UrlEncode(token);
            var verificationLink = $"http://localhost:4000/verify?token={encodedToken}&email={request.Email}";
            var emailBody = EmailTemplates.GetVerificationEmail(verificationLink);

            await _emailService.SendEmailAsync(request.Email, "Verify your host account - BookMyWorkshop", emailBody);
            
            return Ok(new { Message = "Host profile created! Please check your email to verify your account before logging in." });
        }

        return Ok(new { Message = "Your account has been successfully upgraded to a Host account! You can now login to your dashboard." });
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

        // Encode token to be URL safe
        var encodedToken = System.Net.WebUtility.UrlEncode(token);
        var verificationLink = $"http://localhost:4000/verify?token={encodedToken}&email={request.Email}";

         var emailBody = EmailTemplates.GetVerificationEmail(verificationLink);
        
        await _emailService.SendEmailAsync(request.Email, "Verify your account - BookMyWorkshop", emailBody);
        
        return Ok(new { Message = "User registered successfully. Please check your email to verify." });
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
        
        // Prioritize the role for the response DTO
        string primaryRole = API.Enums.UserRoles.User;
        if (roles.Contains(API.Enums.UserRoles.Admin)) primaryRole = API.Enums.UserRoles.Admin;
        else if (roles.Contains(API.Enums.UserRoles.Provider)) primaryRole = API.Enums.UserRoles.Provider;

        bool isApproved = true;
        API.Enums.ProviderStatus? status = null;

        if (roles.Contains(API.Enums.UserRoles.Provider))
        {
            var provider = await _context.Providers.FirstOrDefaultAsync(p => p.UserId == user.Id);
            if (provider != null)
            {
                if (provider.Status == API.Enums.ProviderStatus.Approved && !provider.IsApproved)
                {
                    provider.IsApproved = true;
                    await _context.SaveChangesAsync();
                }
                
                isApproved = provider.IsApproved;
                status = provider.Status;
            }
        }

        var (token, expiry) = _tokenService.CreateToken(user, primaryRole);

        return Ok(new LoginResponse { Token = token, Expiry = expiry, IsApproved = isApproved, Status = status });
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null) return BadRequest("User not found"); 

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        var encodedToken = System.Net.WebUtility.UrlEncode(token);
        var resetLink = $"http://localhost:4000/reset-password?token={encodedToken}&email={request.Email}";

        var emailBody = EmailTemplates.GetPasswordResetEmail(resetLink);
        await _emailService.SendEmailAsync(request.Email, "Reset your password - BookMyWorkshop", emailBody);
        
        return Ok(new { Message = "Password reset link has been sent to your email." });
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
                Audience = new List<string> { _configuration["Google:ClientId"]! } // Optional validation
            };
            
            var payload = await GoogleJsonWebSignature.ValidateAsync(request.IdToken, settings);
            
            var user = await _userManager.FindByEmailAsync(payload.Email);
            
            if (user == null)
            {
                user = new ApplicationUser
                {
                    UserName = payload.Email,
                    Email = payload.Email,
                    FullName = payload.Name, 
                    GoogleId = payload.Subject,
                    EmailConfirmed = true
                };
                
                var result = await _userManager.CreateAsync(user); 
                if (!result.Succeeded) return BadRequest(result.Errors);
            }
            else 
            {
                bool updated = false;
                if (string.IsNullOrEmpty(user.GoogleId))
                {
                    user.GoogleId = payload.Subject;
                    user.EmailConfirmed = true; 
                    updated = true;
                }
                
                if (string.IsNullOrEmpty(user.FullName) || user.FullName == user.Email)
                {
                    user.FullName = payload.Name;
                    updated = true;
                }

                if (updated)
                {
                    await _userManager.UpdateAsync(user);
                }
            }
            
            var roles = await _userManager.GetRolesAsync(user);
            string primaryRole = roles.Contains(API.Enums.UserRoles.Admin) ? API.Enums.UserRoles.Admin :
                               (roles.Contains(API.Enums.UserRoles.Provider) ? API.Enums.UserRoles.Provider : API.Enums.UserRoles.User);

            bool isApproved = true;
            API.Enums.ProviderStatus? status = null;

            if (roles.Contains(API.Enums.UserRoles.Provider))
            {
                var provider = await _context.Providers.FirstOrDefaultAsync(p => p.UserId == user.Id);
                if (provider != null)
                {
                    if (provider.Status == API.Enums.ProviderStatus.Approved && !provider.IsApproved)
                    {
                        provider.IsApproved = true;
                        await _context.SaveChangesAsync();
                    }
                    
                    isApproved = provider.IsApproved;
                    status = provider.Status;
                }
            }

            var (token, expiry) = _tokenService.CreateToken(user, primaryRole);
            return Ok(new LoginResponse { Token = token, Expiry = expiry, IsApproved = isApproved, Status = status });

        }
        catch (Exception ex)
        {
            return BadRequest("Invalid Google Token: " + ex.Message);
        }
    }
}
