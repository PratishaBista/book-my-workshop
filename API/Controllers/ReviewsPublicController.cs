// reviews public controller serves public review feed and top-rated host data
// no authentication required - accessible to all website visitors
// excludes flagged (offensive) reviews and unpublished workshops

using API.Data;
using API.DTOs.Responses;
using API.Enums;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[ApiController]
[Route("api/reviews")]
public class ReviewsPublicController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<ReviewsPublicController> _logger;

    public ReviewsPublicController(
        ApplicationDbContext context,
        IMapper mapper,
        ILogger<ReviewsPublicController> logger)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }


    // returns recent public reviews with pagination and top-rated hosts
    // used for homepage review carousel and testimonials section
    // excludes flagged reviews and only shows reviews from published, active workshops
    // GET: api/reviews?page=1&pageSize=20
    [HttpGet]
    public async Task<IActionResult> GetReviewsFeed([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        try
        {
            // sanitize pagination parameters
            page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 1, 50); // max 50 per page to prevent abuse

            // build query for public reviews (non-flagged, from published workshops)
            var reviewsQuery = _context.WorkshopReviews
                .AsNoTracking()  // read-only optimization
                .Where(r => !r.IsFlagged) // exclude offensive content
                .Include(r => r.User)
                .Include(r => r.Workshop)
                    .ThenInclude(w => w.Provider)
                .Include(r => r.Workshop)
                    .ThenInclude(w => w.Media)
                .Where(r => r.Workshop.Status == WorkshopStatus.Published && r.Workshop.IsActive);

            var totalReviews = await reviewsQuery.CountAsync();

            // get paginated reviews ordered newest first
            var reviews = await reviewsQuery
                .OrderByDescending(r => r.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            // get top 6 rated hosts for sidebar widget
            var topHosts = await GetTopRatedHostsAsync(6);

            return Ok(new ReviewsFeedResponse
            {
                Reviews = _mapper.Map<List<ReviewResponse>>(reviews),
                TopHosts = topHosts,
                TotalReviews = totalReviews
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error loading reviews feed");
            return StatusCode(500, new { message = "An error occurred while retrieving reviews." });
        }
    }

    // returns top-rated hosts based on average review score and review count
    // used for "best hosts" leaderboard on homepage
    // GET: api/reviews/top-hosts?count=6
    [HttpGet("top-hosts")]
    public async Task<IActionResult> GetTopHosts([FromQuery] int count = 6)
    {
        count = Math.Clamp(count, 1, 20);
        var hosts = await GetTopRatedHostsAsync(count);
        return Ok(hosts);
    }

    // calculates top-rated hosts using aggregate query
    // requirements: at least 2 reviews, average rating >= 4.0
    // ordered by highest rating first, then by review count
    private async Task<List<TopRatedHostResponse>> GetTopRatedHostsAsync(int count)
    {
        // complex linq query aggregating reviews by provider
        var hostStats = await (
            from r in _context.WorkshopReviews.AsNoTracking()
            join w in _context.Workshops on r.WorkshopId equals w.Id
            join p in _context.Providers on w.ProviderId equals p.Id
            where !r.IsFlagged // exclude offensive reviews
                  && w.Status == WorkshopStatus.Published // only active workshops
                  && w.IsActive
                  && p.Status == ProviderStatus.Approved // only approved hosts
            group r by new { p.Id, p.BusinessName, p.LogoUrl, p.Slug } into g
            select new
            {
                ProviderId = g.Key.Id,
                g.Key.BusinessName,
                g.Key.LogoUrl,
                g.Key.Slug,
                AverageRating = g.Average(x => (double)x.Rating),
                ReviewCount = g.Count()
            })
            .Where(x => x.ReviewCount >= 2 && x.AverageRating >= 4.0) // minimum quality threshold
            .OrderByDescending(x => x.AverageRating)
            .ThenByDescending(x => x.ReviewCount)
            .Take(count)
            .ToListAsync();

        // map to response dto with rounded rating
        return hostStats.Select(h => new TopRatedHostResponse
        {
            ProviderId = h.ProviderId,
            BusinessName = h.BusinessName,
            LogoUrl = h.LogoUrl,
            Slug = h.Slug,
            AverageRating = Math.Round(h.AverageRating, 1), // one decimal place
            ReviewCount = h.ReviewCount
        }).ToList();
    }
}
