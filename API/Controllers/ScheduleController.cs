using API.DTOs.Requests;
using API.Entities;
using API.Repositories;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/workshop/{workshopId}/[controller]")]
[Authorize(Roles = "Provider,Admin")]
public class ScheduleController : ControllerBase
{
    private readonly IWorkshopService _workshopService;
    private readonly IBookingService _bookingService;
    private readonly IGenericRepository<Provider> _providerRepository;
    private readonly ILogger<ScheduleController> _logger;

    public ScheduleController(
        IWorkshopService workshopService,
        IBookingService bookingService,
        IGenericRepository<Provider> providerRepository,
        ILogger<ScheduleController> logger)
    {
        _workshopService = workshopService;
        _bookingService = bookingService;
        _providerRepository = providerRepository;
        _logger = logger;
    }

    // POST: api/workshop/{workshopId}/schedule
    [HttpPost]
    public async Task<IActionResult> AddSchedule(int workshopId, [FromBody] AddScheduleRequest request)
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

            var schedule = await _workshopService.AddScheduleAsync(workshopId, providerId.Value, request);
            return CreatedAtAction(nameof(GetWorkshopSchedules), new { workshopId }, schedule);
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
            _logger.LogError(ex, $"Error adding schedule to workshop {workshopId}");
            return StatusCode(500, new { message = "An error occurred while adding the schedule." });
        }
    }

    // POST: api/workshop/{workshopId}/schedule/bulk
    [HttpPost("bulk")]
    public async Task<IActionResult> BulkAddSchedules(int workshopId, [FromBody] IEnumerable<AddScheduleRequest> requests)
    {
        try
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var providerId = await GetProviderIdAsync(userId);
            if (providerId == null) return BadRequest(new { message = "Provider profile not found." });

            var result = await _workshopService.AddSchedulesBulkAsync(workshopId, providerId.Value, requests);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
        catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error bulk adding schedules to workshop {workshopId}");
            return StatusCode(500, new { message = "An error occurred while adding schedules." });
        }
    }

    // PUT: api/workshop/{workshopId}/schedule/{scheduleId}
    [HttpPut("{scheduleId}")]
    public async Task<IActionResult> UpdateSchedule(int workshopId, int scheduleId, [FromBody] AddScheduleRequest request)
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

            var schedule = await _workshopService.UpdateScheduleAsync(workshopId, scheduleId, providerId.Value, request);
            return Ok(schedule);
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
            _logger.LogError(ex, $"Error updating schedule {scheduleId}");
            return StatusCode(500, new { message = "An error occurred while updating the schedule." });
        }
    }

    // DELETE: api/workshop/{workshopId}/schedule/{scheduleId}
    [HttpDelete("{scheduleId}")]
    public async Task<IActionResult> DeleteSchedule(int workshopId, int scheduleId)
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

            var result = await _workshopService.DeleteScheduleAsync(workshopId, scheduleId, providerId.Value);
            if (!result)
            {
                return NotFound();
            }

            // Refund any existing bookings to wallets
            await _bookingService.CancelScheduleBookingsAsync(scheduleId);

            return NoContent();
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error deleting schedule {scheduleId}");
            return StatusCode(500, new { message = "An error occurred while deleting the schedule." });
        }
    }

    // GET: api/workshop/{workshopId}/schedule
    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetWorkshopSchedules(int workshopId)
    {
        try
        {
            var schedules = await _workshopService.GetWorkshopSchedulesAsync(workshopId);
            return Ok(schedules);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error getting schedules for workshop {workshopId}");
            return StatusCode(500, new { message = "An error occurred while retrieving schedules." });
        }
    }

    // GET: api/provider/schedule
    [HttpGet("~/api/provider/schedule")]
    public async Task<IActionResult> GetProviderSchedules()
    {
        try
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var providerId = await GetProviderIdAsync(userId);
            if (providerId == null) return BadRequest(new { message = "Provider profile not found." });

            var schedules = await _workshopService.GetProviderSchedulesAsync(providerId.Value);
            return Ok(schedules);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting provider schedules");
            return StatusCode(500, new { message = "An error occurred while retrieving schedules." });
        }
    }

    // GET: api/provider/schedule/with-bookings
    [HttpGet("~/api/provider/schedule/with-bookings")]
    public async Task<IActionResult> GetProviderSchedulesWithBookings()
    {
        try
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var providerId = await GetProviderIdAsync(userId);
            if (providerId == null) return BadRequest(new { message = "Provider profile not found." });

            var schedules = await _workshopService.GetProviderSchedulesWithBookingsAsync(providerId.Value);
            return Ok(schedules);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting provider schedules with bookings");
            return StatusCode(500, new { message = "An error occurred while retrieving schedules." });
        }
    }

    // PUT: api/provider/booking/check-in
    [HttpPut("~/api/provider/booking/check-in")]
    public async Task<IActionResult> CheckInBooking([FromBody] CheckInBookingRequest request)
    {
        try
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var providerId = await GetProviderIdAsync(userId);
            if (providerId == null) return BadRequest(new { message = "Provider profile not found." });

            if (string.IsNullOrWhiteSpace(request.ConfirmationCode))
                return BadRequest(new { message = "Confirmation code is required." });

            var result = await _bookingService.CheckInBookingAsync(providerId.Value, request.ConfirmationCode.Trim());
            if (result == null)
                return NotFound(new { message = "Booking not found for this code." });

            return Ok(new { message = "Participant checked in successfully.", booking = result });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking in booking");
            return StatusCode(500, new { message = "An error occurred during check-in." });
        }
    }

    // PUT: api/provider/booking/{bookingId}/no-show
    [HttpPut("~/api/provider/booking/{bookingId}/no-show")]
    public async Task<IActionResult> MarkNoShow(int bookingId)
    {
        try
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var providerId = await GetProviderIdAsync(userId);
            if (providerId == null) return BadRequest(new { message = "Provider profile not found." });

            var result = await _bookingService.MarkBookingNoShowAsync(providerId.Value, bookingId);
            if (result == null)
                return NotFound(new { message = "Booking not found." });

            return Ok(new { message = "Marked as no-show.", booking = result });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error marking no-show for booking {BookingId}", bookingId);
            return StatusCode(500, new { message = "An error occurred." });
        }
    }

    // PUT: api/provider/schedule/{scheduleId}/complete
    [HttpPut("~/api/provider/schedule/{scheduleId}/complete")]
    public async Task<IActionResult> CompleteSchedule(int scheduleId)
    {
        try
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var providerId = await GetProviderIdAsync(userId);
            if (providerId == null) return BadRequest(new { message = "Provider profile not found." });

            var result = await _workshopService.MarkScheduleCompleteAsync(providerId.Value, scheduleId);
            if (!result) return NotFound(new { message = "Schedule not found." });

            return Ok(new { message = "Workshop marked as complete." });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error marking schedule {scheduleId} as complete");
            return StatusCode(500, new { message = "An error occurred." });
        }
    }

    private async Task<int?> GetProviderIdAsync(string userId)
    {
        var provider = await _providerRepository.FirstOrDefaultAsync(p => p.UserId == userId);
        return provider?.Id;
    }
}
