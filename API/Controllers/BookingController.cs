// booking controller handles all booking-related operations for customers
// includes creating bookings, viewing bookings, cancellation, and ticket generation
// all endpoints require authentication (authorize attribute at controller level)
using API.DTOs.Requests;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // all actions require authentication unless overridden
public class BookingController : ControllerBase
{
    private readonly IBookingService _bookingService;
    private readonly ILogger<BookingController> _logger; // structured logging for debugging and monitoring

    public BookingController(IBookingService bookingService, ILogger<BookingController> logger)
    {
        _bookingService = bookingService;
        _logger = logger;
    }

    // creates a new booking for a workshop
    // expects workshop id, participant details, and payment info in request body
    // returns 201 created with the booking object on success
    // POST: api/booking
    [HttpPost]
    public async Task<IActionResult> CreateBooking([FromBody] CreateBookingRequest request)
    {
        try
        {
            // extract user id from jwt token claims
            // claimtypes.nameidentifier maps to the 'sub' claim which stores the user id
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var booking = await _bookingService.CreateBookingAsync(userId, request);
            // createdataction generates a location header pointing to the getbooking endpoint
            return CreatedAtAction(nameof(GetBooking), new { id = booking.Id }, booking);
        }
        catch (KeyNotFoundException ex)
        {
            // workshop doesn't exist or is not available
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            // business logic violation: capacity full, workshop cancelled, etc.
            return BadRequest(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            // invalid input: negative quantity, invalid date, etc.
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            // unexpected error, log details for debugging but return generic message to client
            _logger.LogError(ex, "Error creating booking");
            return StatusCode(500, new { message = "An error occurred while creating the booking." });
        }
    }

    // retrieves a single booking by id
    // user can only see their own bookings (service layer enforces this)
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

    // returns all bookings for the currently authenticated user
    // ordered by creation date descending (most recent first)
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

    // cancels an existing booking
    // cancellation may be subject to refund rules based on how close to workshop start time
    // refund percentage is calculated based on cancellation policy configured for the workshop
    // PUT: api/booking/{id}/cancel
    [HttpPut("{id}/cancel")]
    public async Task<IActionResult> CancelBooking(int id, [FromBody] CancelBookingRequest? request)
    {
        try
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            // request can be null if user doesn't provide a reason - that's allowed
            var result = await _bookingService.CancelBookingAsync(id, userId, request?.Reason);

            // return detailed cancellation info including refund calculation
            return Ok(new
            {
                message = result.Message,
                refundPercentage = result.RefundPercentage,
                refundAmount = result.RefundAmount,
                hoursNotice = Math.Round(result.HoursNotice, 1) // how many hours before workshop they cancelled
            });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            // booking already cancelled, already started, etc.
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error cancelling booking {id}");
            return StatusCode(500, new { message = "An error occurred." });
        }
    }

    // retrieves ticket details using a unique ticket code (qr code identifier)
    // ticket codes are generated when booking is confirmed
    // host uses this to scan tickets at workshop entrance
    // GET: api/booking/ticket/{code}
    [HttpGet("ticket/{code}")]
    public async Task<IActionResult> GetBookingTicketByCode(string code)
    {
        try
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var ticket = await _bookingService.GetBookingTicketByCodeAsync(code, userId);
            if (ticket == null)
                return NotFound(new { message = "Ticket not found." });

            return Ok(ticket);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting ticket by code {Code}", code);
            return StatusCode(500, new { message = "An error occurred." });
        }
    }

    // retrieves ticket for a specific booking id
    // alternative to using ticket code when user is logged in
    // GET: api/booking/{id}/ticket
    [HttpGet("{id}/ticket")]
    public async Task<IActionResult> GetBookingTicket(int id)
    {
        try
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var ticket = await _bookingService.GetBookingTicketAsync(id, userId);
            if (ticket == null)
                return NotFound(new { message = "Ticket not found or booking is not confirmed." });

            return Ok(ticket);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting ticket for booking {BookingId}", id);
            return StatusCode(500, new { message = "An error occurred." });
        }
    }

    // finds a booking by its human-readable confirmation code (e.g., "BMC-12345")
    // confirmation codes are shorter and easier for customer support to reference
    // GET: api/booking/confirmation/{code}
    [HttpGet("confirmation/{code}")]
    public async Task<IActionResult> GetBookingByConfirmation(string code)
    {
        try
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var booking = await _bookingService.GetBookingByConfirmationCodeAsync(code, userId);
            if (booking == null)
                return NotFound();

            return Ok(booking);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error getting booking by confirmation {code}");
            return StatusCode(500, new { message = "An error occurred." });
        }
    }
}

// simple dto for cancellation request (reason is optional but helpful for analytics)
public class CancelBookingRequest
{
    public string? Reason { get; set; }
}
