// newsletter controller handles email subscription for marketing communications
// stores subscribers in database and sends welcome email on signup
// public endpoint (no authentication required)

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

    // adds an email address to the newsletter mailing list
    // idempotent: multiple subscriptions from same email return success without duplicate
    // sends welcome email after successful subscription
    // POST: api/newsletter/subscribe
    [HttpPost("subscribe")]
    public async Task<IActionResult> Subscribe([FromBody] NewsletterSubscribeRequest request)
    {
        // basic validation (modelstate could also be used but manual check is fine here)
        if (string.IsNullOrEmpty(request.Email))
            return BadRequest(new { Message = "Email is required." });

        // check if email already exists (avoid duplicates)
        var existing = await _context.NewsletterSubscriptions
            .FirstOrDefaultAsync(s => s.Email == request.Email);

        if (existing != null)
        {
            // return same success message even if already subscribed
            // prevents email enumeration attacks and provides good ux
            return Ok(new { Message = "You're subscribed!" });
        }

        // create new subscription record
        var subscription = new NewsletterSubscription
        {
            Email = request.Email,
            CreatedAt = DateTime.UtcNow,
            IsActive = true // can be toggled false if user unsubscribes
        };

        _context.NewsletterSubscriptions.Add(subscription);
        await _context.SaveChangesAsync();

        // send welcome email asynchronously
        // email failure shouldn't prevent database save but we're not catching here
        // in production, we will consider background job or queue for email sending
        var emailBody = EmailTemplates.GetNewsletterWelcomeEmail();
        await _emailService.SendEmailAsync(request.Email, "Welcome to BookMyWorkshop!", emailBody);

        return Ok(new { Message = "You're subscribed!" });
    }
}
