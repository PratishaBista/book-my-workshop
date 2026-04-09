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
    private readonly IConfiguration _config;

    public ContactController(ApplicationDbContext context, IEmailService emailService, IConfiguration config)
    {
        _context = context;
        _emailService = emailService;
        _config = config;
    }

    [HttpPost]
    public async Task<IActionResult> SendMessage([FromBody] ContactRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var message = new ContactMessage
        {
            Name = request.Name,
            Email = request.Email,
            Message = request.Message,
            CreatedAt = DateTime.UtcNow
        };

        _context.ContactMessages.Add(message);
        await _context.SaveChangesAsync();

        // Send notification email to admin
        var adminEmail = _config["EmailSettings:SupportEmail"] ?? "support@bookmyworkshop.com";
        var emailBody = EmailTemplates.GetContactNotificationEmail(request.Name, request.Email, request.Message);
        
        try 
        {
            await _emailService.SendEmailAsync(adminEmail, $"New Contact Message from {request.Name}", emailBody);
        }
        catch (Exception ex)
        {
            // Log error but don't fail the request since database save succeeded
            Console.WriteLine($"Failed to send contact notification email: {ex.Message}");
        }

        return Ok(new { Message = "Your message has been sent successfully. We will get back to you soon." });
    }
}
