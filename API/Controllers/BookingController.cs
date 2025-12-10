using API.DTOs.Requests;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BookingController : ControllerBase
{
    private readonly IBookingService _bookingService;
    private readonly ILogger<BookingController> _logger;

    public BookingController(IBookingService bookingService, ILogger<BookingController> logger)
    {
        _bookingService = bookingService;
        _logger = logger;
    }

    // POST: api/booking
    [HttpPost]
    public async Task<IActionResult> CreateBooking([FromBody] CreateBookingRequest request)
    {
        try
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var booking = await _bookingService.CreateBookingAsync(userId, request);
            return CreatedAtAction(nameof(GetBooking), new { id = booking.Id }, booking);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating booking");
            return StatusCode(500, new { message = "An error occurred while creating the booking." });
        }
    }

    // GET: api/booking/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetBooking(int id)
    {
        try
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var booking = await _bookingService.GetBookingByIdAsync(id, userId);
            if (booking == null)
            {
                return NotFound();
            }

            return Ok(booking);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error getting booking {id}");
            return StatusCode(500, new { message = "An error occurred." });
        }
    }

    // GET: api/booking/my-bookings
    [HttpGet("my-bookings")]
    public async Task<IActionResult> GetMyBookings()
    {
        try
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var bookings = await _bookingService.GetUserBookingsAsync(userId);
            return Ok(bookings);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user bookings");
            return StatusCode(500, new { message = "An error occurred." });
        }
    }

    // PUT: api/booking/{id}/cancel
    [HttpPut("{id}/cancel")]
    public async Task<IActionResult> CancelBooking(int id, [FromBody] CancelBookingRequest? request)
    {
        try
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var result = await _bookingService.CancelBookingAsync(id, userId, request?.Reason);
            if (!result)
            {
                return NotFound();
            }

            return Ok(new { message = "Booking cancelled successfully." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error cancelling booking {id}");
            return StatusCode(500, new { message = "An error occurred." });
        }
    }

    // GET: api/booking/confirmation/{code}
    [HttpGet("confirmation/{code}")]
    public async Task<IActionResult> GetBookingByConfirmation(string code)
    {
        try
        {
            var booking = await _bookingService.GetBookingByConfirmationCodeAsync(code);
            if (booking == null)
            {
                return NotFound();
            }

            return Ok(booking);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error getting booking by confirmation {code}");
            return StatusCode(500, new { message = "An error occurred." });
        }
    }
}

public class CancelBookingRequest
{
    public string? Reason { get; set; }
}
