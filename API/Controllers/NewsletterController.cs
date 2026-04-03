using API.Data;
using API.DTOs.Requests.Public;
using API.Entities;
using API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NewsletterController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IEmailService _emailService;

    public NewsletterController(ApplicationDbContext context, IEmailService emailService)
    {
        _context = context;
        _emailService = emailService;
    }

    [HttpPost("subscribe")]
    public async Task<IActionResult> Subscribe([FromBody] NewsletterSubscribeRequest request)
    {
        if (string.IsNullOrEmpty(request.Email))
            return BadRequest(new { Message = "Email is required." });

        var existing = await _context.NewsletterSubscriptions
            .FirstOrDefaultAsync(s => s.Email == request.Email);

        if (existing != null)
        {
            return Ok(new { Message = "You're subscribed!" });
        }

        var subscription = new NewsletterSubscription
        {
            Email = request.Email,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        _context.NewsletterSubscriptions.Add(subscription);
        await _context.SaveChangesAsync();

        // Send Welcome Email
        var emailBody = EmailTemplates.GetNewsletterWelcomeEmail();
        await _emailService.SendEmailAsync(request.Email, "Welcome to BookMyWorkshop!", emailBody);

        return Ok(new { Message = "You're subscribed!" });
    }
}
