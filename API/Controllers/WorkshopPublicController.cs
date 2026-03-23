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

    // GET: api/workshops/public
    [HttpGet]
    public async Task<IActionResult> GetAllPublishedWorkshops()
    {
        var workshops = await _workshopService.GetAllPublishedWorkshopsAsync();
        return Ok(workshops);
    }

    // GET: api/workshops/public/{idOrSlug}
    [HttpGet("{idOrSlug}")]
    public async Task<IActionResult> GetWorkshopDetail(string idOrSlug)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

        if (int.TryParse(idOrSlug, out int id))
        {
             var workshopById = await _workshopService.GetWorkshopByIdAsync(id, userId);
             if (workshopById != null) return Ok(workshopById);
             return NotFound();
        }

        var workshop = await _workshopService.GetWorkshopBySlugAsync(idOrSlug, userId);
        if (workshop == null)
        {
            return NotFound();
        }
        return Ok(workshop);
    }

    // GET: api/workshops/public/category/{categoryId}
    [HttpGet("category/{categoryId}")]
    public async Task<IActionResult> GetWorkshopsByCategory(int categoryId)
    {
        var workshops = await _workshopService.GetWorkshopsByCategoryAsync(categoryId);
        return Ok(workshops);
    }

    // GET: api/workshops/public/search
    [HttpGet("search")]
    public async Task<IActionResult> SearchWorkshops([FromQuery] string? q, [FromQuery] int? categoryId, [FromQuery] string? location)
    {
        var workshops = await _workshopService.SearchWorkshopsAsync(q, categoryId, location);
        return Ok(workshops);
    }

    // GET: api/workshops/public/featured
    [HttpGet("featured")]
    public async Task<IActionResult> GetFeaturedWorkshops([FromQuery] int count = 6)
    {
        var workshops = await _workshopService.GetFeaturedWorkshopsAsync(count);
        return Ok(workshops);
    }

    // GET: api/workshops/public/provider/{providerId}
    [HttpGet("provider/{providerId}")]
    public async Task<IActionResult> GetWorkshopsByProvider(int providerId)
    {
        var workshops = await _workshopService.GetProviderWorkshopsAsync(providerId);
        return Ok(workshops);
    }

    // GET: api/workshops/public/recommendations
    [HttpGet("recommendations")]
    public async Task<IActionResult> GetRecommendations([FromQuery] int count = 6)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            // If guest, just return featured
            return Ok(await _workshopService.GetFeaturedWorkshopsAsync(count));
        }

        var recommendations = await _workshopService.GetRecommendedWorkshopsForUserAsync(userId, count);
        return Ok(recommendations);
    }
}
