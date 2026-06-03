// auth controller handles all authentication operations: signup, login, email verification, password reset
// also manages google oauth login and superadmin multi-factor authentication (mfa)
// uses asp.net core identity as the membership system

using API.Data;
using API.DTOs.Requests.Auth;
using API.DTOs.Responses.Auth;
using API.Entities;
using API.Services;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

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
    private readonly IMemoryCache _cache; // used for storing mfa codes temporarily

    public AuthController(
        UserManager<ApplicationUser> userManager,
        TokenService tokenService,
        IConfiguration configuration,
        ApplicationDbContext context,
        IEmailService emailService,
        IMemoryCache cache)
    {
        _userManager = userManager;
        _tokenService = tokenService;
        _configuration = configuration;
        _context = context;
        _emailService = emailService;
        _cache = cache;
    }

    // registers a new host (provider) account or upgrades an existing customer account to host
    // flow:
    // - if email doesn't exist: create new user + provider role + provider profile
    // - if email exists and password matches: upgrade existing user to provider role
    // - if email exists and password wrong: reject
    // POST: api/auth/provider/signup
    [HttpPost("provider/signup")]
    public async Task<IActionResult> RegisterProvider([FromBody] ProviderRegisterRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var user = await _userManager.FindByEmailAsync(request.Email);
        bool isNewUser = (user == null);

        if (!isNewUser)
        {
            // existing user must provide correct password to upgrade to host
            var passwordValid = await _userManager.CheckPasswordAsync(user!, request.Password);
            if (!passwordValid)
                return BadRequest(new { message = "An account with this email already exists. Please use your existing password to upgrade to a host account." });

            // prevent admins from becoming hosts (separation of concerns)
            var roles = await _userManager.GetRolesAsync(user!);
            if (roles.Contains(API.Enums.UserRoles.Admin) || roles.Contains(API.Enums.UserRoles.SuperAdmin))
                return BadRequest(new { message = "Administrative accounts cannot be registered as host accounts. Please use a regular user account." });

            if (roles.Contains(API.Enums.UserRoles.Provider))
                return BadRequest(new { message = "You are already registered as a host. Please login to access your dashboard." });

            // upgrade existing customer to provider
            await _userManager.AddToRoleAsync(user!, API.Enums.UserRoles.Provider);
        }
        else
        {
            // brand new user registration
            user = new ApplicationUser
            {
                UserName = request.Email,
                Email = request.Email,
                FullName = request.ContactPerson,
                PhoneNumber = request.PhoneNumber
            };

            // check if provider profile already exists (defensive programming)
            var result = await _userManager.CreateAsync(user, request.Password);
            if (!result.Succeeded) return BadRequest(result.Errors);

            await _userManager.AddToRoleAsync(user, API.Enums.UserRoles.Provider);
        }

        var existingProfile = await _context.Providers.AnyAsync(p => p.UserId == user!.Id);
        if (existingProfile) return BadRequest(new { message = "Provider profile already exists for this account." });

        // create the provider entity linked to the user
        var provider = new Provider
        {
            BusinessName = request.BusinessName,
            PhoneNumber = request.PhoneNumber,
            State = request.State, // starts as incomplete until admin approval
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

        // send verification email only for new users or users whose email isn't confirmed yet
        if (isNewUser || !user!.EmailConfirmed)
        {
            var token = await _userManager.GenerateEmailConfirmationTokenAsync(user!);
            var encodedToken = System.Net.WebUtility.UrlEncode(token); // url encode because token contains special chars
            var verificationLink = $"http://localhost:4000/verify?token={encodedToken}&email={request.Email}";
            var emailBody = EmailTemplates.GetVerificationEmail(verificationLink);

            await _emailService.SendEmailAsync(request.Email, "Verify your host account - BookMyWorkshop", emailBody);

            return Ok(new { Message = "Host profile created! Please check your email to verify your account before logging in." });
        }

        return Ok(new { Message = "Your account has been successfully upgraded to a Host account! You can now login to your dashboard." });
    }

    // standard customer signup
    // creates a regular user account with the 'user' role
    // sends verification email before user can login
    // POST: api/auth/signup
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

        await _userManager.AddToRoleAsync(user, API.Enums.UserRoles.User);

        var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);

        // Encode token to be URL safe
        var encodedToken = System.Net.WebUtility.UrlEncode(token);
        var verificationLink = $"http://localhost:4000/verify?token={encodedToken}&email={request.Email}";

        var emailBody = EmailTemplates.GetVerificationEmail(verificationLink);

        await _emailService.SendEmailAsync(request.Email, "Verify your account - BookMyWorkshop", emailBody);

        return Ok(new { Message = "User registered successfully. Please check your email to verify." });
    }

    // confirms user's email address using the token from verification link
    // returns isProvider flag so frontend knows where to redirect (customer vs host dashboard)
    // POST: api/auth/verify-email
    [HttpPost("verify-email")]
    public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null) return BadRequest("Invalid request");

        var result = await _userManager.ConfirmEmailAsync(user, request.Token);

        if (!result.Succeeded) return BadRequest(new { message = "Email verification failed" });

        var roles = await _userManager.GetRolesAsync(user);
        bool isProvider = roles.Contains(API.Enums.UserRoles.Provider);

        return Ok(new { message = "Email verified successfully. You can now login.", isProvider = isProvider });
    }

    // authenticates a user and returns a jwt token
    // special handling for superadmin: requires mfa (multi-factor authentication)
    // for providers: checks approval status before allowing access
    // handles account reactivation if user was previously deactivated
    // POST: api/auth/login
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

        // superadmin requires additional mfa step
        if (roles.Contains(API.Enums.UserRoles.SuperAdmin))
        {
            // generate 6-digit mfa code
            var code = new Random().Next(100000, 999999).ToString();

            // store code in memory cache with 10 minute expiration
            var cacheKey = $"MFA_{user.Email}";
            _cache.Set(cacheKey, code, TimeSpan.FromMinutes(10));

            // Send Email
            var emailBody = EmailTemplates.GetSuperAdminMfaEmail(code);
            await _emailService.SendEmailAsync(user.Email!, "SuperAdmin Verification Code - BookMyWorkshop", emailBody);

            // logging is optional. wrapped in try-catch so login doesn't fail if logger is unavailable
            try
            {
                var logService = HttpContext.RequestServices.GetRequiredService<ISystemLogService>();
                await logService.LogInfoAsync("Auth", $"MFA verification code generated and sent to SuperAdmin {user.Email}.", user.Email);
            }
            catch { }

            // waits for mfa verification and does not issue token yet
            return Ok(new LoginResponse
            {
                RequiresMFA = true
            });
        }

        // determine primary role for token claims
        // priority: admin > provider > user

        string primaryRole = API.Enums.UserRoles.User;
        if (roles.Contains(API.Enums.UserRoles.Admin)) primaryRole = API.Enums.UserRoles.Admin;
        else if (roles.Contains(API.Enums.UserRoles.Provider)) primaryRole = API.Enums.UserRoles.Provider;

        bool isApproved = true;
        API.Enums.ProviderStatus? status = null;

        // for provider accounts, check approval status
        if (roles.Contains(API.Enums.UserRoles.Provider))
        {
            var provider = await _context.Providers.FirstOrDefaultAsync(p => p.UserId == user.Id);
            if (provider != null)
            {
                // auto-fix inconsistent state: approved status flag should match status enum
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

        // reactivate account if it was previously deactivated or scheduled for deletion
        bool isReactivated = false;
        if (user.IsDeactivated || user.DeletionScheduledAt != null)
        {
            user.IsDeactivated = false;
            user.DeletionScheduledAt = null;
            user.DeletionWarningSent = false;
            await _userManager.UpdateAsync(user);
            isReactivated = true;
        }

        try
        {
            var logService = HttpContext.RequestServices.GetRequiredService<ISystemLogService>();
            await logService.LogInfoAsync("Auth", $"User {user.Email} successfully logged in as {primaryRole}.", user.Email);
        }
        catch { }

        return Ok(new LoginResponse
        {
            Token = token,
            Expiry = expiry,
            IsApproved = isApproved,
            Status = status,
            HasCompletedOnboarding = user.HasCompletedOnboarding,
            RequiresMFA = false,
            IsReactivated = isReactivated
        });
    }

    // second step of superadmin login: verify the mfa code sent via email
    // validates code against cached value, issues jwt token if successful
    // POST: api/auth/verify-superadmin-mfa
    [HttpPost("verify-superadmin-mfa")]
    public async Task<ActionResult<LoginResponse>> VerifySuperAdminMfa([FromBody] VerifyMfaRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null) return Unauthorized("Invalid request");

        var roles = await _userManager.GetRolesAsync(user);
        if (!roles.Contains(API.Enums.UserRoles.SuperAdmin))
            return Unauthorized("Unauthorized role access");

        var cacheKey = $"MFA_{request.Email}";
        if (!_cache.TryGetValue(cacheKey, out string? storedCode))
            return BadRequest("Code expired or invalid. Please login again.");

        if (storedCode != request.Code)
        {
            try
            {
                var logService = HttpContext.RequestServices.GetRequiredService<ISystemLogService>();
                await logService.LogWarningAsync("Auth", $"Invalid MFA code entered for SuperAdmin {user.Email}.", user.Email);
            }
            catch { }
            return BadRequest("Invalid verification code.");
        }

        // consume the code, one-time use only
        _cache.Remove(cacheKey);

        var (token, expiry) = _tokenService.CreateToken(user, API.Enums.UserRoles.SuperAdmin);

        try
        {
            var logService = HttpContext.RequestServices.GetRequiredService<ISystemLogService>();
            await logService.LogInfoAsync("Auth", $"SuperAdmin {user.Email} successfully authenticated via MFA.", user.Email);
        }
        catch { }

        return Ok(new LoginResponse
        {
            Token = token,
            Expiry = expiry,
            IsApproved = true,
            RequiresMFA = false
        });
    }

    // initiates password reset flow
    // generates a reset token and emails a reset link to the user
    // POST: api/auth/forgot-password
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

    // actually resets the password using the token from email
    // POST: api/auth/reset-password
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

    // google oauth 2.0 login
    // validates the id_token from google and either creates a new user or logs in existing one
    // automatically confirms email since google already verified the user
    // POST: api/auth/google
    [HttpPost("google")]
    public async Task<ActionResult<LoginResponse>> GoogleLogin([FromBody] GoogleLoginRequest request)
    {
        try
        {
            // google's library validates the token signature, audience, and expiration
            var settings = new GoogleJsonWebSignature.ValidationSettings()
            {
                Audience = new List<string> { _configuration["Google:ClientId"]! } // Optional validation
            };

            var payload = await GoogleJsonWebSignature.ValidateAsync(request.IdToken, settings);

            var user = await _userManager.FindByEmailAsync(payload.Email);

            if (user == null)
            {
                // new user: create account with email already confirmed
                user = new ApplicationUser
                {
                    UserName = payload.Email,
                    Email = payload.Email,
                    FullName = payload.Name,
                    GoogleId = payload.Subject, // store google's unique user id for future reference
                    EmailConfirmed = true // google already verified the email
                };

                var result = await _userManager.CreateAsync(user);
                if (!result.Succeeded) return BadRequest(result.Errors);

                await _userManager.AddToRoleAsync(user, API.Enums.UserRoles.User);
            }
            else
            {
                // existing user: link google account if not already linked
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

            // ensure user has at least the basic 'user' role
            var roles = await _userManager.GetRolesAsync(user);
            if (!roles.Contains(API.Enums.UserRoles.Admin)
                && !roles.Contains(API.Enums.UserRoles.Provider)
                && !roles.Contains(API.Enums.UserRoles.SuperAdmin)
                && !roles.Contains(API.Enums.UserRoles.User))
            {
                await _userManager.AddToRoleAsync(user, API.Enums.UserRoles.User);
                roles = await _userManager.GetRolesAsync(user);
            }

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

            bool isReactivated = false;
            if (user.IsDeactivated || user.DeletionScheduledAt != null)
            {
                user.IsDeactivated = false;
                user.DeletionScheduledAt = null;
                user.DeletionWarningSent = false;
                await _userManager.UpdateAsync(user);
                isReactivated = true;
            }

            try
            {
                var logService = HttpContext.RequestServices.GetRequiredService<ISystemLogService>();
                await logService.LogInfoAsync("Auth", $"User {user.Email} successfully logged in via Google as {primaryRole}.", user.Email);
            }
            catch { }

            return Ok(new LoginResponse
            {
                Token = token,
                Expiry = expiry,
                IsApproved = isApproved,
                Status = status,
                HasCompletedOnboarding = user.HasCompletedOnboarding,
                IsReactivated = isReactivated
            });

        }
        catch (Exception ex)
        {
            return BadRequest("Invalid Google Token: " + ex.Message);
        }
    }
}
