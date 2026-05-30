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

    /// <summary>Public host profile by slug (e.g. studio-name) or numeric id.</summary>
    [HttpGet("{slugOrId}")]
    public async Task<IActionResult> GetPublicProfile(string slugOrId)
    {
        var profile = await _providerPublicService.GetPublicProfileAsync(slugOrId);
        if (profile == null)
            return NotFound(new { message = "Host not found." });

        return Ok(profile);
    }
}
