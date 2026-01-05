using API.Entities;
using API.Enums;
using API.Repositories;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/media")]
[Authorize(Roles = "Provider,Admin")]
public class MediaController : ControllerBase
{
    private readonly IMediaService _mediaService;
    private readonly IWorkshopRepository _workshopRepository;
    private readonly IGenericRepository<WorkshopMedia> _mediaRepository;
    private readonly IGenericRepository<Provider> _providerRepository;
    private readonly ILogger<MediaController> _logger;

    public MediaController(
        IMediaService mediaService,
        IWorkshopRepository workshopRepository,
        IGenericRepository<WorkshopMedia> mediaRepository,
        IGenericRepository<Provider> providerRepository,
        ILogger<MediaController> logger)
    {
        _mediaService = mediaService;
        _workshopRepository = workshopRepository;
        _mediaRepository = mediaRepository;
        _providerRepository = providerRepository;
        _logger = logger;
    }

    [HttpGet("ping")]
    [AllowAnonymous]
    public IActionResult Ping() => Ok("Media controller is alive");

    // POST: api/media/upload
    [HttpPost("/api/media/upload")]
    public async Task<IActionResult> UploadGeneralMedia([FromForm] IFormFile file)
    {
        try
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file provided." });

            var (url, publicId) = await _mediaService.UploadMediaAsync(file, "general");
            return Ok(new { url, publicId });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in general media upload");
            return StatusCode(500, new { message = "Upload failed." });
        }
    }

    // POST: api/workshop/{workshopId}/media
    [HttpPost("~/api/workshop/{workshopId}/media")]
    public async Task<IActionResult> UploadMedia(int workshopId, [FromForm] UploadMediaRequest request)
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

            // Verify workshop ownership
            var isOwner = await _workshopRepository.IsWorkshopOwnedByProviderAsync(workshopId, providerId.Value);
            if (!isOwner)
            {
                return Forbid("You do not have permission to upload media to this workshop.");
            }

            if (request.File == null || request.File.Length == 0)
            {
                return BadRequest(new { message = "No file provided." });
            }

            // Upload to Cloudinary
            var (url, publicId) = await _mediaService.UploadMediaAsync(request.File, "workshops");

            // Save to database
            var media = new WorkshopMedia
            {
                WorkshopId = workshopId,
                MediaType = request.MediaType,
                Url = url,
                PublicId = publicId,
                IsPrimary = request.IsPrimary,
                DisplayOrder = request.DisplayOrder,
                FileSizeBytes = request.File.Length,
                UploadedAt = DateTime.UtcNow
            };

            if (request.IsPrimary)
            {
                var existingPrimary = await _mediaRepository.FindAsync(m => m.WorkshopId == workshopId && m.IsPrimary);
                foreach (var existing in existingPrimary)
                {
                    existing.IsPrimary = false;
                    _mediaRepository.Update(existing);
                }
            }

            await _mediaRepository.AddAsync(media);
            await _mediaRepository.SaveChangesAsync();

            return CreatedAtAction(nameof(GetWorkshopMedia), new { workshopId }, new
            {
                id = media.Id,
                url = media.Url,
                mediaType = media.MediaType,
                isPrimary = media.IsPrimary,
                displayOrder = media.DisplayOrder
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error uploading media to workshop {workshopId}");
            return StatusCode(500, new { message = "An error occurred while uploading media." });
        }
    }

    // GET: api/workshop/{workshopId}/media
    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetWorkshopMedia(int workshopId)
    {
        try
        {
            var media = await _mediaRepository.FindAsync(m => m.WorkshopId == workshopId);
            var orderedMedia = media.OrderBy(m => m.DisplayOrder).Select(m => new
            {
                id = m.Id,
                url = m.Url,
                mediaType = m.MediaType,
                isPrimary = m.IsPrimary,
                displayOrder = m.DisplayOrder
            });

            return Ok(orderedMedia);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error getting media for workshop {workshopId}");
            return StatusCode(500, new { message = "An error occurred." });
        }
    }

    // DELETE: api/workshop/{workshopId}/media/{mediaId}
    [HttpDelete("{mediaId}")]
    public async Task<IActionResult> DeleteMedia(int workshopId, int mediaId)
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

            // Verify workshop ownership
            var isOwner = await _workshopRepository.IsWorkshopOwnedByProviderAsync(workshopId, providerId.Value);
            if (!isOwner)
            {
                return Forbid("You do not have permission to delete media from this workshop.");
            }

            var media = await _mediaRepository.GetByIdAsync(mediaId);
            if (media == null || media.WorkshopId != workshopId)
            {
                return NotFound();
            }

            // Delete from Cloudinary
            if (!string.IsNullOrEmpty(media.PublicId))
            {
                await _mediaService.DeleteMediaAsync(media.PublicId);
            }

            // Delete from database
            _mediaRepository.Delete(media);
            await _mediaRepository.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error deleting media {mediaId}");
            return StatusCode(500, new { message = "An error occurred while deleting media." });
        }
    }

    // PUT: api/workshop/{workshopId}/media/{mediaId}/order
    [HttpPut("{mediaId}/order")]
    public async Task<IActionResult> UpdateMediaOrder(int workshopId, int mediaId, [FromBody] UpdateMediaOrderRequest request)
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

            var isOwner = await _workshopRepository.IsWorkshopOwnedByProviderAsync(workshopId, providerId.Value);
            if (!isOwner)
            {
                return Forbid("You do not have permission to update this workshop.");
            }

            var media = await _mediaRepository.GetByIdAsync(mediaId);
            if (media == null || media.WorkshopId != workshopId)
            {
                return NotFound();
            }

            media.DisplayOrder = request.DisplayOrder;
            media.IsPrimary = request.IsPrimary;

            if (request.IsPrimary)
            {
                var existingPrimary = await _mediaRepository.FindAsync(m => m.WorkshopId == workshopId && m.IsPrimary && m.Id != mediaId);
                foreach (var existing in existingPrimary)
                {
                    existing.IsPrimary = false;
                    _mediaRepository.Update(existing);
                }
            }

            _mediaRepository.Update(media);
            await _mediaRepository.SaveChangesAsync();

            return Ok(new { message = "Media order updated successfully." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error updating media order {mediaId}");
            return StatusCode(500, new { message = "An error occurred." });
        }
    }

    private async Task<int?> GetProviderIdAsync(string userId)
    {
        var provider = await _providerRepository.FirstOrDefaultAsync(p => p.UserId == userId);
        return provider?.Id;
    }
}

public class UploadMediaRequest
{
    public IFormFile File { get; set; } = null!;
    public MediaType MediaType { get; set; }
    public bool IsPrimary { get; set; }
    public int DisplayOrder { get; set; }
}

public class UpdateMediaOrderRequest
{
    public int DisplayOrder { get; set; }
    public bool IsPrimary { get; set; }
}
