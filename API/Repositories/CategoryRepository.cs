using API.Data;
using API.Entities;
using Microsoft.EntityFrameworkCore;

namespace API.Repositories;

/// <summary>
/// Category repository implementation.
/// Handles category data access with validation logic.
/// </summary>
public class CategoryRepository : GenericRepository<WorkshopCategory>, ICategoryRepository
{
    public CategoryRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<WorkshopCategory>> GetActiveCategoriesAsync()
    {
        return await _dbSet
            .Where(c => c.IsActive)
            .OrderBy(c => c.DisplayOrder)
            .ToListAsync();
    }

    public async Task<bool> IsCategoryNameUniqueAsync(string name, int? excludeId = null)
    {
        var query = _dbSet.Where(c => c.Name.ToLower() == name.ToLower());
        
        if (excludeId.HasValue)
        {
            query = query.Where(c => c.Id != excludeId.Value);
        }

        return !await query.AnyAsync();
    }
}
