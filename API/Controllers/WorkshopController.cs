// workshop controller handles crud operations for workshops (host side)
// includes creating, updating, deleting, publishing/unpublishing workshops
// accessible by providers and admins only

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

    // creates a new workshop (draft by default)
    // provider must have an approved profile
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

            // get the provider id associated with this user account
            var providerId = await GetProviderIdAsync(userId);
            if (providerId == null)
            {
                return BadRequest(new { message = "Provider profile not found." });
            }

            var result = await _workshopService.CreateWorkshopAsync(providerId.Value, request);
            // returns 201 with location header pointing to getworkshop endpoint
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

    // updates an existing workshop
    // only the owning provider or admin can update
    // if workshop is published, changes go to pending modifications queue
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

    // soft deletes a workshop (sets status to archived)
    // prevents new bookings but preserves history
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

            return NoContent();  // 204 (standard rest delete response)
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

    // returns all workshops owned by the current provider
    // used for host dashboard workshop management
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
                return Ok(new List<object>());  // user is admin or not a provider (return empty list)
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

    // returns single workshop by id (public endpoint)
    // used for workshop details page
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

    // returns related workshop recommendations based on category and tags
    // public endpoint for "you might also like" section
    // GET: api/workshop/{id}/recommendations
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

    // submits workshop for admin review and publishing
    // changes status from draft to pendingreview
    // admin must approve before workshop goes live
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

    // takes a live workshop offline (sets status to draft)
    // workshop disappears from marketplace but retains data
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

    // helper method to get provider id from user id
    // returns null if user doesn't have a provider profile
    private async Task<int?> GetProviderIdAsync(string userId)
    {
        var provider = await _providerRepository.FirstOrDefaultAsync(p => p.UserId == userId);
        return provider?.Id;
    }
}
