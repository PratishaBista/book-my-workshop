using System.Security.Claims;
using API.Data;
using API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class PreferencesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public PreferencesController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await _context.WorkshopCategories
            .Where(c => c.IsActive)
            .Select(c => new { c.Id, c.Name, c.IconUrl })
            .ToListAsync();
        return Ok(categories);
    }

    [HttpGet("my")]
    public async Task<IActionResult> GetMyPreferences()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var prefs = await _context.UserPreferences
            .Where(up => up.UserId == userId)
            .Select(up => new { up.CategoryId })
            .ToListAsync();

        return Ok(prefs);
    }

    [HttpPost("save")]
    public async Task<IActionResult> SavePreferences([FromBody] List<int> categoryIds)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        if (categoryIds == null || categoryIds.Count < 3)
        {
            return BadRequest(new { message = "Please select at least 3 interests." });
        }

        var user = await _context.Users
            .Include(u => u.Preferences)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null) return NotFound();

        // Clear existing and add new
        _context.UserPreferences.RemoveRange(user.Preferences);

        foreach (var id in categoryIds)
        {
            user.Preferences.Add(new UserPreference
            {
                UserId = userId,
                CategoryId = id
            });
        }

        user.HasCompletedOnboarding = true;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Preferences saved successfully!" });
    }
}
