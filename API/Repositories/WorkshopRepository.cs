using API.Data;
using API.Entities;
using API.Enums;
using Microsoft.EntityFrameworkCore;

namespace API.Repositories;

/// <summary>
/// Workshop repository implementation.
/// Provides efficient database queries with proper eager loading.
/// </summary>
public class WorkshopRepository : GenericRepository<Workshop>, IWorkshopRepository
{
    public WorkshopRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Workshop>> GetPublishedWorkshopsAsync()
    {
        return await _dbSet
            .Include(w => w.Categories)
            .Include(w => w.Provider)
            .Include(w => w.Pricing)
            .Include(w => w.Venue)
            .Include(w => w.Media.OrderBy(m => m.DisplayOrder))
            .Where(w => w.Status == WorkshopStatus.Published && w.IsActive)
            .OrderByDescending(w => w.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Workshop>> GetWorkshopsByCategoryAsync(int categoryId)
    {
        return await _dbSet
            .Include(w => w.Categories)
            .Include(w => w.Provider)
            .Include(w => w.Pricing)
            .Include(w => w.Venue)
            .Include(w => w.Media.OrderBy(m => m.DisplayOrder))
            .Where(w => w.Categories.Any(c => c.Id == categoryId) 
                     && w.Status == WorkshopStatus.Published 
                     && w.IsActive)
            .OrderByDescending(w => w.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Workshop>> GetWorkshopsByProviderAsync(int providerId)
    {
        return await _dbSet
            .Include(w => w.Categories)
            .Include(w => w.Pricing)
            .Include(w => w.Venue)
            .Include(w => w.Media.OrderBy(m => m.DisplayOrder))
            .Include(w => w.Schedules)
            .Where(w => w.ProviderId == providerId && w.IsActive)
            .OrderByDescending(w => w.CreatedAt)
            .ToListAsync();
    }

    public async Task<Workshop?> GetWorkshopWithDetailsAsync(int id)
    {
        return await _dbSet
            .Include(w => w.Categories)
            .Include(w => w.Provider)
                .ThenInclude(p => p.User)
            .Include(w => w.Pricing)
            .Include(w => w.Venue)
            .Include(w => w.Media.OrderBy(m => m.DisplayOrder))
            .Include(w => w.Schedules.Where(s => s.Status != ScheduleStatus.Cancelled))
            .Include(w => w.Reviews)
                .ThenInclude(r => r.User)
            .FirstOrDefaultAsync(w => w.Id == id && w.IsActive);
    }

    public async Task<IEnumerable<Workshop>> SearchWorkshopsAsync(
        string searchTerm, 
        int? categoryId = null, 
        string? location = null)
    {
        var query = _dbSet
            .Include(w => w.Categories)
            .Include(w => w.Provider)
            .Include(w => w.Pricing)
            .Include(w => w.Venue)
            .Include(w => w.Media.OrderBy(m => m.DisplayOrder))
            .Where(w => w.Status == WorkshopStatus.Published && w.IsActive);

        // Search in title, tagline, subtitle, and description
        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            searchTerm = searchTerm.ToLower();
            query = query.Where(w => 
                w.Title.ToLower().Contains(searchTerm) ||
                (w.Tagline != null && w.Tagline.ToLower().Contains(searchTerm)) ||
                (w.Subtitle != null && w.Subtitle.ToLower().Contains(searchTerm)) ||
                w.Description.ToLower().Contains(searchTerm));
        }

        // Filter by category
        if (categoryId.HasValue)
        {
            query = query.Where(w => w.Categories.Any(c => c.Id == categoryId.Value));
        }

        // Filter by location
        if (!string.IsNullOrWhiteSpace(location))
        {
            location = location.ToLower();
            query = query.Where(w => w.LocationAddress.ToLower().Contains(location));
        }

        return await query
            .OrderByDescending(w => w.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Workshop>> GetFeaturedWorkshopsAsync(int count = 6)
    {
        // Featured workshops: published, has upcoming schedules, sorted by rating
        return await _dbSet
            .Include(w => w.Categories)
            .Include(w => w.Provider)
            .Include(w => w.Pricing)
            .Include(w => w.Media.OrderBy(m => m.DisplayOrder))
            .Include(w => w.Reviews)
            .Include(w => w.Schedules)
            .Where(w => w.Status == WorkshopStatus.Published 
                     && w.IsActive
                     && w.Schedules.Any(s => s.StartDateTime > DateTime.UtcNow 
                                          && s.Status == ScheduleStatus.Upcoming
                                          && !s.IsSoldOut))
            .OrderByDescending(w => w.Reviews.Average(r => (double?)r.Rating) ?? 0)
            .ThenByDescending(w => w.CreatedAt)
            .Take(count)
            .ToListAsync();
    }

    public async Task<bool> IsWorkshopOwnedByProviderAsync(int workshopId, int providerId)
    {
        return await _dbSet.AnyAsync(w => w.Id == workshopId && w.ProviderId == providerId);
    }
}
