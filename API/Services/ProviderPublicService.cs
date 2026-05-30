using API.Data;
using API.DTOs.Responses;
using API.Enums;
using AutoMapper;
using Microsoft.EntityFrameworkCore;

namespace API.Services;

public interface IProviderPublicService
{
    Task<PublicHostProfileResponse?> GetPublicProfileAsync(string slugOrId);
}

public class ProviderPublicService : IProviderPublicService
{
    private readonly ApplicationDbContext _context;
    private readonly IWorkshopService _workshopService;
    private readonly IMapper _mapper;

    public ProviderPublicService(
        ApplicationDbContext context,
        IWorkshopService workshopService,
        IMapper mapper)
    {
        _context = context;
        _workshopService = workshopService;
        _mapper = mapper;
    }

    public async Task<PublicHostProfileResponse?> GetPublicProfileAsync(string slugOrId)
    {
        if (string.IsNullOrWhiteSpace(slugOrId))
            return null;

        var key = slugOrId.Trim().ToLowerInvariant();

        var provider = await _context.Providers
            .AsNoTracking()
            .FirstOrDefaultAsync(p =>
                p.IsApproved
                && p.Status == ProviderStatus.Approved
                && p.Slug != null
                && p.Slug.ToLower() == key);

        if (provider == null && int.TryParse(slugOrId, out var providerId))
        {
            provider = await _context.Providers
                .AsNoTracking()
                .FirstOrDefaultAsync(p =>
                    p.Id == providerId
                    && p.IsApproved
                    && p.Status == ProviderStatus.Approved);
        }

        if (provider == null)
            return null;

        var workshops = (await _workshopService.GetProviderWorkshopsAsync(provider.Id)).ToList();

        var reviewEntities = await _context.WorkshopReviews
            .AsNoTracking()
            .Where(r => !r.IsFlagged
                        && r.Workshop.ProviderId == provider.Id
                        && r.Workshop.Status == WorkshopStatus.Published
                        && r.Workshop.IsActive)
            .Include(r => r.User)
            .Include(r => r.Workshop)
                .ThenInclude(w => w.Media)
            .Include(r => r.Workshop)
                .ThenInclude(w => w.Provider)
            .OrderByDescending(r => r.CreatedAt)
            .Take(24)
            .ToListAsync();

        var reviews = _mapper.Map<List<ReviewResponse>>(reviewEntities);

        double? averageRating = null;
        var reviewCount = await _context.WorkshopReviews
            .AsNoTracking()
            .CountAsync(r => !r.IsFlagged
                             && r.Workshop.ProviderId == provider.Id
                             && r.Workshop.Status == WorkshopStatus.Published
                             && r.Workshop.IsActive);

        if (reviewCount > 0)
        {
            averageRating = await _context.WorkshopReviews
                .AsNoTracking()
                .Where(r => !r.IsFlagged
                            && r.Workshop.ProviderId == provider.Id
                            && r.Workshop.Status == WorkshopStatus.Published
                            && r.Workshop.IsActive)
                .AverageAsync(r => (double)r.Rating);
            averageRating = Math.Round(averageRating.Value, 1);
        }

        return new PublicHostProfileResponse
        {
            Id = provider.Id,
            BusinessName = provider.BusinessName,
            Slug = provider.Slug,
            Tagline = provider.Tagline,
            Description = provider.Description,
            LogoUrl = provider.LogoUrl,
            CoverImageUrl = provider.CoverImageUrl,
            StudioImageUrl = provider.StudioImageUrl,
            Address = provider.Address,
            State = provider.State,
            Website = provider.Website,
            AverageRating = averageRating,
            ReviewCount = reviewCount,
            WorkshopCount = workshops.Count,
            Workshops = workshops,
            Reviews = reviews,
        };
    }
}
