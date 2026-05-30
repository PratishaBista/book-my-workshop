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
    private readonly IReviewModerationService _reviewModeration;
    private readonly IMediaService _mediaService;
    private readonly ILogger<ReviewController> _logger;

    private const int MaxReviewImages = 3;

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

    // POST: api/workshop/{workshopId}/review (multipart: rating, comment, bookingId, images)
    [HttpPost]
    [Authorize]
    [RequestSizeLimit(15_000_000)]
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

            if (rating < 1 || rating > 5)
            {
                return BadRequest(new { message = "Rating must be between 1 and 5." });
            }

            if (string.IsNullOrWhiteSpace(comment))
            {
                return BadRequest(new { message = "Comment is required." });
            }

            if (comment.Length > 2000)
            {
                return BadRequest(new { message = "Comment cannot exceed 2000 characters." });
            }

            var workshop = await _workshopRepository.GetByIdAsync(workshopId);
            if (workshop == null)
            {
                return NotFound(new { message = "Workshop not found." });
            }

            var booking = await _bookingRepository.GetBookingWithDetailsAsync(bookingId);
            if (booking == null)
            {
                return NotFound(new { message = "Booking not found." });
            }

            if (booking.UserId != userId)
            {
                return Forbid("You can only review workshops you have attended.");
            }

            if (booking.WorkshopSchedule.WorkshopId != workshopId)
            {
                return BadRequest(new { message = "This booking is not for the specified workshop." });
            }

            if (booking.BookingStatus != BookingStatus.Confirmed)
            {
                return BadRequest(new { message = "You can only review confirmed bookings." });
            }

            if (booking.WorkshopSchedule.Status != ScheduleStatus.Completed)
            {
                return BadRequest(new { message = "You can only review workshops after the session has been completed by the host." });
            }

            if (booking.AttendanceStatus != AttendanceStatus.CheckedIn)
            {
                return BadRequest(new { message = "You can only review after your attendance has been confirmed at the venue." });
            }

            var existingReview = await _reviewRepository.FirstOrDefaultAsync(r => r.BookingId == bookingId);
            if (existingReview != null)
            {
                return BadRequest(new { message = "You have already reviewed this workshop." });
            }

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

            var (isFlagged, offensiveScore, _) = await _reviewModeration.AnalyzeAsync(comment);

            var review = new WorkshopReview
            {
                WorkshopId = workshopId,
                UserId = userId,
                BookingId = bookingId,
                Rating = rating,
                Comment = comment.Trim(),
                ImageUrls = imageUrls,
                IsFlagged = isFlagged,
                OffensiveScore = offensiveScore,
                CreatedAt = DateTime.UtcNow
            };

            await _reviewRepository.AddAsync(review);
            await _reviewRepository.SaveChangesAsync();

            var loaded = await GetReviewWithIncludesAsync(review.Id);
            var reviewResponse = _mapper.Map<ReviewResponse>(loaded);

            return CreatedAtAction(nameof(GetWorkshopReviews), new { workshopId }, reviewResponse);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding review to workshop {WorkshopId}", workshopId);
            return StatusCode(500, new { message = "An error occurred while adding the review." });
        }
    }

    // POST JSON fallback for clients not sending multipart
    [HttpPost("json")]
    [Authorize]
    public async Task<IActionResult> AddReviewJson(int workshopId, [FromBody] AddReviewRequest request)
    {
        return await AddReview(workshopId, request.BookingId, request.Rating, request.Comment, null);
    }

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

    private IQueryable<WorkshopReview> QueryPublicReviews()
    {
        return _context.WorkshopReviews
            .AsNoTracking()
            .Where(r => !r.IsFlagged)
            .Include(r => r.User)
            .Include(r => r.Workshop)
                .ThenInclude(w => w.Provider)
            .Include(r => r.Workshop)
                .ThenInclude(w => w.Media);
    }

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
