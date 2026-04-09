using API.DTOs.Requests;
using API.Entities;
using API.Enums;
using API.Repositories;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/workshop")]
public class WorkshopController : ControllerBase
{
    private readonly IWorkshopService _workshopService;
    private readonly IMediaService _mediaService;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IGenericRepository<Provider> _providerRepository;
    private readonly ILogger<WorkshopController> _logger;

    public WorkshopController(
        IWorkshopService workshopService,
        IMediaService mediaService,
        UserManager<ApplicationUser> userManager,
        IGenericRepository<Provider> providerRepository,
        ILogger<WorkshopController> logger)
    {
        _workshopService = workshopService;
        _mediaService = mediaService;
        _userManager = userManager;
        _providerRepository = providerRepository;
        _logger = logger;
    }

    // POST: api/workshop
    [Authorize(Roles = "Provider,Admin")]
    [HttpPost]
    public async Task<IActionResult> CreateWorkshop([FromBody] CreateWorkshopRequest request)
    {
        try
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            // Get provider ID from user
            var providerId = await GetProviderIdAsync(userId);
            if (providerId == null)
            {
                return BadRequest(new { message = "Provider profile not found." });
            }

            var result = await _workshopService.CreateWorkshopAsync(providerId.Value, request);
            return CreatedAtAction(nameof(GetWorkshop), new { id = result.Id }, result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating workshop");
            return StatusCode(500, new { message = "An error occurred while creating the workshop." });
        }
    }

    // PUT: api/workshop/{id}
    [Authorize(Roles = "Provider,Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateWorkshop(int id, [FromBody] UpdateWorkshopRequest request)
    {
        try
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var providerId = await GetProviderIdAsync(userId);
            if (providerId == null)
            {
                return BadRequest(new { message = "Provider profile not found." });
            }

            var result = await _workshopService.UpdateWorkshopAsync(id, providerId.Value, request);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error updating workshop {id}");
            return StatusCode(500, new { message = "An error occurred while updating the workshop." });
        }
    }

    // DELETE: api/workshop/{id}
    [Authorize(Roles = "Provider,Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteWorkshop(int id)
    {
        try
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var providerId = await GetProviderIdAsync(userId);
            if (providerId == null)
            {
                return BadRequest(new { message = "Provider profile not found." });
            }

            var result = await _workshopService.DeleteWorkshopAsync(id, providerId.Value);
            if (!result)
            {
                return NotFound();
            }

            return NoContent();
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error deleting workshop {id}");
            return StatusCode(500, new { message = "An error occurred while deleting the workshop." });
        }
    }

    // GET: api/workshop/my-workshops
    [Authorize(Roles = "Provider,Admin")]
    [HttpGet("my-workshops")]
    public async Task<IActionResult> GetMyWorkshops()
    {
        try
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var providerId = await GetProviderIdAsync(userId);
            if (providerId == null)
            {
                return Ok(new List<object>()); // Return empty list if not a provider
            }

            var workshops = await _workshopService.GetProviderWorkshopsAsync(providerId.Value);
            return Ok(workshops);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting provider workshops");
            return StatusCode(500, new { message = "An error occurred while retrieving workshops." });
        }
    }

    // GET: api/workshop/{id}
    [AllowAnonymous]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetWorkshop(int id)
    {
        try
        {
            var workshop = await _workshopService.GetWorkshopByIdAsync(id);
            if (workshop == null)
            {
                return NotFound();
            }

            return Ok(workshop);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error getting workshop {id}");
            return StatusCode(500, new { message = "An error occurred while retrieving the workshop." });
        }
    }

    [AllowAnonymous]
    [HttpGet("{id}/recommendations")]
    public async Task<IActionResult> GetRelatedWorkshops(int id)
    {
        try
        {
            var recommendations = await _workshopService.GetRelatedWorkshopsAsync(id);
            return Ok(recommendations);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error getting recommendations for workshop {id}");
            return StatusCode(500, new { message = "An error occurred while fetching recommendations." });
        }
    }

    // POST: api/workshop/{id}/publish
    [Authorize(Roles = "Provider,Admin")]
    [HttpPost("{id}/publish")]
    public async Task<IActionResult> PublishWorkshop(int id)
    {
        try
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var providerId = await GetProviderIdAsync(userId);
            if (providerId == null)
            {
                return BadRequest(new { message = "Provider profile not found." });
            }

            var result = await _workshopService.PublishWorkshopAsync(id, providerId.Value);
            if (!result)
            {
                return NotFound();
            }

            return Ok(new { message = "Workshop published successfully." });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error publishing workshop {id}");
            return StatusCode(500, new { message = "An error occurred while publishing the workshop." });
        }
    }

    // POST: api/workshop/{id}/unpublish
    [Authorize(Roles = "Provider,Admin")]
    [HttpPost("{id}/unpublish")]
    public async Task<IActionResult> UnpublishWorkshop(int id)
    {
        try
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var providerId = await GetProviderIdAsync(userId);
            if (providerId == null)
            {
                return BadRequest(new { message = "Provider profile not found." });
            }

            var result = await _workshopService.UnpublishWorkshopAsync(id, providerId.Value);
            if (!result)
            {
                return NotFound();
            }

            return Ok(new { message = "Workshop unpublished successfully." });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error unpublishing workshop {id}");
            return StatusCode(500, new { message = "An error occurred while unpublishing the workshop." });
        }
    }

    // Helper method to get provider ID
    private async Task<int?> GetProviderIdAsync(string userId)
    {
        var provider = await _providerRepository.FirstOrDefaultAsync(p => p.UserId == userId);
        return provider?.Id;
    }
}
