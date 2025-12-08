using API.Data;
using API.Entities;
using API.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = UserRoles.Admin)] // Secure: Only Admins can access
public class AdminController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AdminController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/admin/providers/pending
    [HttpGet("providers/pending")]
    public async Task<IActionResult> GetPendingProviders()
    {
        var pendingProviders = await _context.Providers
            .Include(p => p.User) // Include User details (Email, Name)
            .Where(p => !p.IsApproved)
            .Select(p => new
            {
                p.Id,
                p.BusinessName,
                p.PhoneNumber,
                ContactPerson = p.User.FullName,
                Email = p.User.Email,
                RegisteredAt = DateTime.Now 
            })
            .ToListAsync();

        return Ok(pendingProviders);
    }

    // PUT: api/admin/approve-provider/{id}
    [HttpPut("approve-provider/{id}")]
    public async Task<IActionResult> ApproveProvider(int id)
    {
        var provider = await _context.Providers.FindAsync(id);
        if (provider == null) return NotFound("Provider not found");

        if (provider.IsApproved) return BadRequest("Provider is already approved");

        provider.IsApproved = true;
        await _context.SaveChangesAsync();

        // Optional: Sending email notification to provider here (not implemented)

        return Ok(new { Message = $"Provider '{provider.BusinessName}' approved successfully." });
    }
}
