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

    /// <summary>Recent public reviews (non-flagged) and top-rated hosts.</summary>
    [HttpGet]
    public async Task<IActionResult> GetReviewsFeed([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        try
        {
            page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 1, 50);

            var reviewsQuery = _context.WorkshopReviews
                .AsNoTracking()
                .Where(r => !r.IsFlagged)
                .Include(r => r.User)
                .Include(r => r.Workshop)
                    .ThenInclude(w => w.Provider)
                .Include(r => r.Workshop)
                    .ThenInclude(w => w.Media)
                .Where(r => r.Workshop.Status == WorkshopStatus.Published && r.Workshop.IsActive);

            var totalReviews = await reviewsQuery.CountAsync();

            var reviews = await reviewsQuery
                .OrderByDescending(r => r.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

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

    [HttpGet("top-hosts")]
    public async Task<IActionResult> GetTopHosts([FromQuery] int count = 6)
    {
        count = Math.Clamp(count, 1, 20);
        var hosts = await GetTopRatedHostsAsync(count);
        return Ok(hosts);
    }

    private async Task<List<TopRatedHostResponse>> GetTopRatedHostsAsync(int count)
    {
        var hostStats = await (
            from r in _context.WorkshopReviews.AsNoTracking()
            join w in _context.Workshops on r.WorkshopId equals w.Id
            join p in _context.Providers on w.ProviderId equals p.Id
            where !r.IsFlagged
                  && w.Status == WorkshopStatus.Published
                  && w.IsActive
                  && p.Status == ProviderStatus.Approved
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
            .Where(x => x.ReviewCount >= 2 && x.AverageRating >= 4.0)
            .OrderByDescending(x => x.AverageRating)
            .ThenByDescending(x => x.ReviewCount)
            .Take(count)
            .ToListAsync();

        return hostStats.Select(h => new TopRatedHostResponse
        {
            ProviderId = h.ProviderId,
            BusinessName = h.BusinessName,
            LogoUrl = h.LogoUrl,
            Slug = h.Slug,
            AverageRating = Math.Round(h.AverageRating, 1),
            ReviewCount = h.ReviewCount
        }).ToList();
    }
}
