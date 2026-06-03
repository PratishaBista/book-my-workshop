// review controller handles customer reviews for workshops
// includes posting reviews with images, viewing reviews, checking eligibility, and deletion
// uses moderation service to flag offensive content automatically

using API.Data;
using API.DTOs.Requests;
using API.DTOs.Responses;
using API.Entities;
using API.Enums;
using API.Repositories;
using API.Services;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[ApiController]
[Route("api/workshop/{workshopId}/[controller]")]
public class ReviewController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IGenericRepository<WorkshopReview> _reviewRepository;
    private readonly IBookingRepository _bookingRepository;
    private readonly IWorkshopRepository _workshopRepository;
    private readonly IMapper _mapper;
    private readonly IReviewModerationService _reviewModeration; // flags offensive content
    private readonly IMediaService _mediaService;
    private readonly ILogger<ReviewController> _logger;

    private const int MaxReviewImages = 3; // limit to prevent abuse and storage costs

    public ReviewController(
        ApplicationDbContext context,
        IGenericRepository<WorkshopReview> reviewRepository,
        IBookingRepository bookingRepository,
        IWorkshopRepository workshopRepository,
        IMapper mapper,
        IReviewModerationService reviewModeration,
        IMediaService mediaService,
        ILogger<ReviewController> logger)
    {
        _context = context;
        _reviewRepository = reviewRepository;
        _bookingRepository = bookingRepository;
        _workshopRepository = workshopRepository;
        _mapper = mapper;
        _reviewModeration = reviewModeration;
        _mediaService = mediaService;
        _logger = logger;
    }

    // adds a new review for a workshop
    // multipart form allows image uploads alongside review data
    // only users who attended the workshop and were checked in can review
    // POST: api/workshop/{workshopId}/review
    [HttpPost]
    [Authorize]
    [RequestSizeLimit(15_000_000)] // ~15mb max request size for images
    public async Task<IActionResult> AddReview(
        int workshopId,
        [FromForm] int bookingId,
        [FromForm] int rating,
        [FromForm] string comment,
        [FromForm] List<IFormFile>? images)
    {
        try
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            // validate rating range
            if (rating < 1 || rating > 5)
            {
                return BadRequest(new { message = "Rating must be between 1 and 5." });
            }

            // validate comment not empty
            if (string.IsNullOrWhiteSpace(comment))
            {
                return BadRequest(new { message = "Comment is required." });
            }

            // prevent excessively long reviews
            if (comment.Length > 2000)
            {
                return BadRequest(new { message = "Comment cannot exceed 2000 characters." });
            }

            // verify workshop exists
            var workshop = await _workshopRepository.GetByIdAsync(workshopId);
            if (workshop == null)
            {
                return NotFound(new { message = "Workshop not found." });
            }

            // verify booking exists and belongs to user
            var booking = await _bookingRepository.GetBookingWithDetailsAsync(bookingId);
            if (booking == null)
            {
                return NotFound(new { message = "Booking not found." });
            }

            if (booking.UserId != userId)
            {
                return Forbid("You can only review workshops you have attended.");
            }

            // ensure booking matches the workshop being reviewed
            if (booking.WorkshopSchedule.WorkshopId != workshopId)
            {
                return BadRequest(new { message = "This booking is not for the specified workshop." });
            }

            // only confirmed bookings can be reviewed
            if (booking.BookingStatus != BookingStatus.Confirmed)
            {
                return BadRequest(new { message = "You can only review confirmed bookings." });
            }

            // workshop must be completed before review is allowed
            if (booking.WorkshopSchedule.Status != ScheduleStatus.Completed)
            {
                return BadRequest(new { message = "You can only review workshops after the session has been completed by the host." });
            }

            // host must have checked in the customer
            if (booking.AttendanceStatus != AttendanceStatus.CheckedIn)
            {
                return BadRequest(new { message = "You can only review after your attendance has been confirmed at the venue." });
            }

            // prevent duplicate reviews for the same booking
            var existingReview = await _reviewRepository.FirstOrDefaultAsync(r => r.BookingId == bookingId);
            if (existingReview != null)
            {
                return BadRequest(new { message = "You have already reviewed this workshop." });
            }

            // upload images if any
            var imageUrls = new List<string>();
            if (images != null && images.Count > 0)
            {
                if (images.Count > MaxReviewImages)
                {
                    return BadRequest(new { message = $"You can upload at most {MaxReviewImages} images per review." });
                }

                foreach (var file in images)
                {
                    if (file.Length == 0) continue;
                    var (url, _) = await _mediaService.UploadMediaAsync(file, "reviews");
                    imageUrls.Add(url);
                }
            }

            // run moderation on comment to detect offensive content
            var (isFlagged, offensiveScore, _) = await _reviewModeration.AnalyzeAsync(comment);

            var review = new WorkshopReview
            {
                WorkshopId = workshopId,
                UserId = userId,
                BookingId = bookingId,
                Rating = rating,
                Comment = comment.Trim(),
                ImageUrls = imageUrls,
                IsFlagged = isFlagged, // flagged reviews hidden from public view
                OffensiveScore = offensiveScore, // score for admin review
                CreatedAt = DateTime.UtcNow
            };

            await _reviewRepository.AddAsync(review);
            await _reviewRepository.SaveChangesAsync();

            // load full review with includes for response
            var loaded = await GetReviewWithIncludesAsync(review.Id);
            var reviewResponse = _mapper.Map<ReviewResponse>(loaded);

            // returns 201 with location header
            return CreatedAtAction(nameof(GetWorkshopReviews), new { workshopId }, reviewResponse);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding review to workshop {WorkshopId}", workshopId);
            return StatusCode(500, new { message = "An error occurred while adding the review." });
        }
    }

    // json fallback endpoint for clients that can't send multipart
    // POST: api/workshop/{workshopId}/review/json
    [HttpPost("json")]
    [Authorize]
    public async Task<IActionResult> AddReviewJson(int workshopId, [FromBody] AddReviewRequest request)
    {
        // reuse the main method with null images
        return await AddReview(workshopId, request.BookingId, request.Rating, request.Comment, null);
    }

    // returns all public (non-flagged) reviews for a workshop
    // includes average rating calculation
    // GET: api/workshop/{workshopId}/review
    [HttpGet]
    public async Task<IActionResult> GetWorkshopReviews(int workshopId)
    {
        try
        {
            var reviews = await QueryPublicReviews()
                .Where(r => r.WorkshopId == workshopId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            var reviewResponses = _mapper.Map<IEnumerable<ReviewResponse>>(reviews);
            var averageRating = reviews.Any() ? reviews.Average(r => r.Rating) : 0;

            return Ok(new
            {
                reviews = reviewResponses,
                averageRating = Math.Round(averageRating, 1),
                totalReviews = reviews.Count
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting reviews for workshop {WorkshopId}", workshopId);
            return StatusCode(500, new { message = "An error occurred while retrieving reviews." });
        }
    }

    // checks if the current user can review a workshop
    // returns eligibility status and reason
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
            var hasReviewed = await _reviewRepository.ExistsAsync(
                r => r.WorkshopId == workshopId && r.UserId == userId);

            return Ok(new
            {
                canReview = canReview && !hasReviewed,
                hasReviewed,
                message = canReview && !hasReviewed
                    ? "You can review this workshop."
                    : hasReviewed
                        ? "You have already reviewed this workshop."
                        : "Reviews unlock after your host checks you in and marks the session complete."
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking review eligibility for workshop {WorkshopId}", workshopId);
            return StatusCode(500, new { message = "An error occurred." });
        }
    }

    // deletes a review (users can delete their own, admins can delete any)
    // DELETE: api/workshop/{workshopId}/review/{reviewId}
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

            var isAdmin = User.IsInRole("Admin");
            // users can only delete their own reviews, admins can delete any
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
            _logger.LogError(ex, "Error deleting review {ReviewId}", reviewId);
            return StatusCode(500, new { message = "An error occurred while deleting the review." });
        }
    }

    // returns query for public reviews (excludes flagged content)
    // eager loads user, workshop, provider, and media data
    private IQueryable<WorkshopReview> QueryPublicReviews()
    {
        return _context.WorkshopReviews
            .AsNoTracking() // read-only optimization
            .Where(r => !r.IsFlagged) // filter out offensive reviews
            .Include(r => r.User)
            .Include(r => r.Workshop)
                .ThenInclude(w => w.Provider)
            .Include(r => r.Workshop)
                .ThenInclude(w => w.Media);
    }

    // helper method to fetch review with all navigation properties populated
    private async Task<WorkshopReview?> GetReviewWithIncludesAsync(int reviewId)
    {
        return await _context.WorkshopReviews
            .AsNoTracking()
            .Include(r => r.User)
            .Include(r => r.Workshop)
                .ThenInclude(w => w.Provider)
            .Include(r => r.Workshop)
                .ThenInclude(w => w.Media)
            .FirstOrDefaultAsync(r => r.Id == reviewId);
    }
}
