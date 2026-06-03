// preferences controller manages user category interests and onboarding
// users select workshop categories they're interested in during signup
// used for personalized recommendations and email notifications
// most endpoints require authentication except public category list

using System.Security.Claims;
using API.Data;
using API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[Authorize] // preference operations require authenticated user
[ApiController]
[Route("api/[controller]")]
public class PreferencesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public PreferencesController(ApplicationDbContext context)
    {
        _context = context;
    }

    // returns all active workshop categories for the preferences selection screen
    // public endpoint (called during signup before user is authenticated)
    // GET: api/preferences/categories
    [AllowAnonymous] // overrides controller-level authorize for this endpoint only
    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await _context.WorkshopCategories
            .Where(c => c.IsActive) // only show active categories
            .Select(c => new { c.Id, c.Name, c.IconUrl })
            .ToListAsync();
        return Ok(categories);
    }

    // retrieves the current user's selected category preferences
    // returns list of category ids that the user follows
    // GET: api/preferences/my
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

    // saves or updates user's category preferences
    // replaces existing preferences entirely (not incremental)
    // also marks onboarding as completed after first save
    // POST: api/preferences/save
    [HttpPost("save")]
    public async Task<IActionResult> SavePreferences([FromBody] List<int> categoryIds)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        // validation: user must select at least one category
        if (categoryIds == null || categoryIds.Count < 1)
        {
            return BadRequest(new { message = "Please select at least 1 interest." });
        }

        // load user with existing preferences for efficient removal
        var user = await _context.Users
            .Include(u => u.Preferences)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null) return NotFound();

        // clear all existing preferences (replace approach)
        // simpler than diffing old vs new lists
        _context.UserPreferences.RemoveRange(user.Preferences);

        // add new preferences
        foreach (var id in categoryIds)
        {
            user.Preferences.Add(new UserPreference
            {
                UserId = userId,
                CategoryId = id
            });
        }

        // mark onboarding as complete so user doesn't see performance screen again
        user.HasCompletedOnboarding = true;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Preferences saved successfully!" });
    }
}
