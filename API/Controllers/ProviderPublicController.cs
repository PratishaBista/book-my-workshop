// provider public controller serves public-facing host profile information
// no authentication required - accessible to anyone browsing the marketplace
// returns limited data compared to the authenticated provider controller

using API.Services;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/providers/public")]
public class ProviderPublicController : ControllerBase
{
    private readonly IProviderPublicService _providerPublicService;

    public ProviderPublicController(IProviderPublicService providerPublicService)
    {
        _providerPublicService = providerPublicService;
    }

    // retrieves public host profile information using either slug or id
    // slug is the url-friendly business name (e.g., "pottery-studio-kathmandu")
    // numeric id also works for backward compatibility
    // returns limited fields: business name, logo, description, location, etc.
    // does not expose sensitive data like email, phone, or verification docs
    // GET: api/providers/public/{slugOrId}
    [HttpGet("{slugOrId}")]
    public async Task<IActionResult> GetPublicProfile(string slugOrId)
    {
        var profile = await _providerPublicService.GetPublicProfileAsync(slugOrId);
        if (profile == null)
            return NotFound(new { message = "Host not found." });

        return Ok(profile);
    }
}
