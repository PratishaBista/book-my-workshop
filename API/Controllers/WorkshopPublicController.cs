// workshop public controller serves public-facing workshop data
// all endpoints are public (no authentication required) except recommendations which uses auth if available
// includes browsing, searching, filtering by category/location, and workshop details

using API.Services;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/workshops/public")]
public class WorkshopPublicController : ControllerBase
{
    private readonly IWorkshopService _workshopService;

    public WorkshopPublicController(IWorkshopService workshopService)
    {
        _workshopService = workshopService;
    }

    // returns all published workshops (paginated in service)
    // used for homepage browse and explore pages
    // GET: api/workshops/public
    [HttpGet]
    public async Task<IActionResult> GetAllPublishedWorkshops()
    {
        var workshops = await _workshopService.GetAllPublishedWorkshopsAsync();
        return Ok(workshops);
    }

    // returns single workshop detail by either id (numeric) or slug (url-friendly string)
    // accepts userid parameter for personalized data (favorite status, booking eligibility)
    // GET: api/workshops/public/{idOrSlug}
    [HttpGet("{idOrSlug}")]
    public async Task<IActionResult> GetWorkshopDetail(string idOrSlug)
    {
        // get userId from claims if authenticated (may be null for guests)
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

        // try parsing as integer id first
        if (int.TryParse(idOrSlug, out int id))
        {
            var workshopById = await _workshopService.GetWorkshopByIdAsync(id, userId);
            if (workshopById != null) return Ok(workshopById);
            return NotFound();
        }

        // fallback to slug lookup
        var workshop = await _workshopService.GetWorkshopBySlugAsync(idOrSlug, userId);
        if (workshop == null)
        {
            return NotFound();
        }
        return Ok(workshop);
    }

    // returns all workshops belonging to a specific category
    // useful for category landing pages
    // GET: api/workshops/public/category/{categoryId}
    [HttpGet("category/{categoryId}")]
    public async Task<IActionResult> GetWorkshopsByCategory(int categoryId)
    {
        var workshops = await _workshopService.GetWorkshopsByCategoryAsync(categoryId);
        return Ok(workshops);
    }

    // search workshops with optional filters
    // q = search term (title, description, tagline)
    // categoryId = filter by category
    // location = filter by city/region
    // GET: api/workshops/public/search?q=pottery&categoryId=1&location=kathmandu
    [HttpGet("search")]
    public async Task<IActionResult> SearchWorkshops([FromQuery] string? q, [FromQuery] int? categoryId, [FromQuery] string? location)
    {
        var workshops = await _workshopService.SearchWorkshopsAsync(q, categoryId, location);
        return Ok(workshops);
    }

    // returns featured workshops for homepage carousel
    // count parameter controls how many to return (default 6)
    // GET: api/workshops/public/featured?count=6
    [HttpGet("featured")]
    public async Task<IActionResult> GetFeaturedWorkshops([FromQuery] int count = 6)
    {
        var workshops = await _workshopService.GetFeaturedWorkshopsAsync(count);
        return Ok(workshops);
    }

    // returns all workshops for a specific provider (host)
    // used for host profile pages
    // GET: api/workshops/public/provider/{providerId}
    [HttpGet("provider/{providerId}")]
    public async Task<IActionResult> GetWorkshopsByProvider(int providerId)
    {
        var workshops = await _workshopService.GetProviderWorkshopsAsync(providerId);
        return Ok(workshops);
    }

    // returns personalized workshop recommendations based on user's preferences and booking history
    // uses collaborative filtering or content-based recommendation algorithm
    // falls back to featured workshops for guest users
    // GET: api/workshops/public/recommendations?count=6
    [HttpGet("recommendations")]
    public async Task<IActionResult> GetRecommendations([FromQuery] int count = 6)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        // guest users get featured workshops instead of recommendations
        if (string.IsNullOrEmpty(userId))
        {
            // If guest, just return featured
            return Ok(await _workshopService.GetFeaturedWorkshopsAsync(count));
        }

        var recommendations = await _workshopService.GetRecommendedWorkshopsForUserAsync(userId, count);
        return Ok(recommendations);
    }
}
