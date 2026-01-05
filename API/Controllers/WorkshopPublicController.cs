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

    // GET: api/workshops/public/{id}
    // GET: api/workshops/public/{idOrSlug}
    [HttpGet("{idOrSlug}")]
    public async Task<IActionResult> GetWorkshopDetail(string idOrSlug)
    {
        if (int.TryParse(idOrSlug, out int id))
        {
             var workshopById = await _workshopService.GetWorkshopByIdAsync(id);
             if (workshopById != null) return Ok(workshopById);
             return NotFound();
        }

        var workshop = await _workshopService.GetWorkshopBySlugAsync(idOrSlug);
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
}
