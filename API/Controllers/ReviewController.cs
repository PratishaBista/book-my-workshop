using API.DTOs.Requests;
using API.DTOs.Responses;
using API.Entities;
using API.Enums;
using API.Repositories;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/workshop/{workshopId}/[controller]")]
public class ReviewController : ControllerBase
{
    private readonly IGenericRepository<WorkshopReview> _reviewRepository;
    private readonly IBookingRepository _bookingRepository;
    private readonly IWorkshopRepository _workshopRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<ReviewController> _logger;

    public ReviewController(
        IGenericRepository<WorkshopReview> reviewRepository,
        IBookingRepository bookingRepository,
        IWorkshopRepository workshopRepository,
        IMapper mapper,
        ILogger<ReviewController> logger)
    {
        _reviewRepository = reviewRepository;
        _bookingRepository = bookingRepository;
        _workshopRepository = workshopRepository;
        _mapper = mapper;
        _logger = logger;
    }

    // POST: api/workshop/{workshopId}/review
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> AddReview(int workshopId, [FromBody] AddReviewRequest request)
    {
        try
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            // Verify workshop exists
            var workshop = await _workshopRepository.GetByIdAsync(workshopId);
            if (workshop == null)
            {
                return NotFound(new { message = "Workshop not found." });
            }

            // Verify booking exists and belongs to user
            var booking = await _bookingRepository.GetBookingWithDetailsAsync(request.BookingId);
            if (booking == null)
            {
                return NotFound(new { message = "Booking not found." });
            }

            if (booking.UserId != userId)
            {
                return Forbid("You can only review workshops you have attended.");
            }

            // Verify booking is for this workshop
            if (booking.WorkshopSchedule.WorkshopId != workshopId)
            {
                return BadRequest(new { message = "This booking is not for the specified workshop." });
            }

            // Verify booking is confirmed and workshop is completed
            if (booking.BookingStatus != BookingStatus.Confirmed)
            {
                return BadRequest(new { message = "You can only review confirmed bookings." });
            }

            if (booking.WorkshopSchedule.Status != ScheduleStatus.Completed)
            {
                return BadRequest(new { message = "You can only review workshops that have been completed." });
            }

            // Check if user already reviewed this workshop
            var existingReview = await _reviewRepository.FirstOrDefaultAsync(
                r => r.BookingId == request.BookingId);
            
            if (existingReview != null)
            {
                return BadRequest(new { message = "You have already reviewed this workshop." });
            }

            // Create review
            var review = _mapper.Map<WorkshopReview>(request);
            review.WorkshopId = workshopId;
            review.UserId = userId;
            review.CreatedAt = DateTime.UtcNow;

            await _reviewRepository.AddAsync(review);
            await _reviewRepository.SaveChangesAsync();

            // Return created review
            var reviewResponse = _mapper.Map<ReviewResponse>(review);
            return CreatedAtAction(nameof(GetWorkshopReviews), new { workshopId }, reviewResponse);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error adding review to workshop {workshopId}");
            return StatusCode(500, new { message = "An error occurred while adding the review." });
        }
    }

    // GET: api/workshop/{workshopId}/review
    [HttpGet]
    public async Task<IActionResult> GetWorkshopReviews(int workshopId)
    {
        try
        {
            var reviews = await _reviewRepository.FindAsync(r => r.WorkshopId == workshopId);
            
            // Order by most recent first
            var orderedReviews = reviews.OrderByDescending(r => r.CreatedAt);
            
            var reviewResponses = _mapper.Map<IEnumerable<ReviewResponse>>(orderedReviews);
            
            // Calculate average rating
            var averageRating = reviews.Any() ? reviews.Average(r => r.Rating) : 0;
            
            return Ok(new
            {
                reviews = reviewResponses,
                averageRating = Math.Round(averageRating, 1),
                totalReviews = reviews.Count()
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error getting reviews for workshop {workshopId}");
            return StatusCode(500, new { message = "An error occurred while retrieving reviews." });
        }
    }

    // GET: api/workshop/{workshopId}/review/can-review
    [HttpGet("can-review")]
    [Authorize]
    public async Task<IActionResult> CanUserReview(int workshopId)
    {
        try
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var canReview = await _bookingRepository.CanUserReviewWorkshopAsync(userId, workshopId);
            
            // Check if already reviewed
            var hasReviewed = await _reviewRepository.ExistsAsync(
                r => r.WorkshopId == workshopId && r.UserId == userId);

            return Ok(new
            {
                canReview = canReview && !hasReviewed,
                hasReviewed = hasReviewed,
                message = canReview && !hasReviewed 
                    ? "You can review this workshop." 
                    : hasReviewed 
                        ? "You have already reviewed this workshop."
                        : "You must complete a confirmed booking to review this workshop."
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error checking review eligibility for workshop {workshopId}");
            return StatusCode(500, new { message = "An error occurred." });
        }
    }

    // DELETE: api/workshop/{workshopId}/review/{reviewId} (User can delete their own review)
    [HttpDelete("{reviewId}")]
    [Authorize]
    public async Task<IActionResult> DeleteReview(int workshopId, int reviewId)
    {
        try
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var review = await _reviewRepository.GetByIdAsync(reviewId);
            if (review == null || review.WorkshopId != workshopId)
            {
                return NotFound();
            }

            // Check if user owns this review or is admin
            var isAdmin = User.IsInRole("Admin");
            if (review.UserId != userId && !isAdmin)
            {
                return Forbid("You can only delete your own reviews.");
            }

            _reviewRepository.Delete(review);
            await _reviewRepository.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error deleting review {reviewId}");
            return StatusCode(500, new { message = "An error occurred while deleting the review." });
        }
    }
}
