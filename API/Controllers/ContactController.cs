// contact controller handles public contact form submissions
// stores messages in database and forwards them to admin via email
// no authentication required (open endpoint for website visitors)

using API.Data;
using API.DTOs.Requests.Public;
using API.Entities;
using API.Services;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContactController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _config; // access to app settings

    public ContactController(ApplicationDbContext context, IEmailService emailService, IConfiguration config)
    {
        _context = context;
        _emailService = emailService;
        _config = config;
    }

    // submits a contact message from the website's contact form
    // saves message to database for audit/history
    // also sends an email notification to platform admins
    // POST: api/contact
    [HttpPost]
    public async Task<IActionResult> SendMessage([FromBody] ContactRequest request)
    {
        // modelstate validation ensures name, email, message are present and valid format
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // create entity for persistence
        // utcnow ensures consistent timestamps across different timezones
        var message = new ContactMessage
        {
            Name = request.Name,
            Email = request.Email,
            Message = request.Message,
            CreatedAt = DateTime.UtcNow
        };

        _context.ContactMessages.Add(message);
        await _context.SaveChangesAsync();

        // send email notification to admin/support team
        // support email is configurable via appsettings.json
        var adminEmail = _config["EmailSettings:SupportEmail"] ?? "support@bookmyworkshop.com";
        var emailBody = EmailTemplates.GetContactNotificationEmail(request.Name, request.Email, request.Message);

        try
        {
            await _emailService.SendEmailAsync(adminEmail, $"New Contact Message from {request.Name}", emailBody);
        }
        catch (Exception ex)
        {
            // email failure should not block the user's request
            // database record already saved, admin can still see it
            // log to console for debugging
            Console.WriteLine($"Failed to send contact notification email: {ex.Message}");
        }

        return Ok(new { Message = "Your message has been sent successfully. We will get back to you soon." });
    }
}
