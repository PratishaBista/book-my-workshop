using API.Entities;

namespace API.Repositories;

/// <summary>
/// Category repository interface.
/// Simple interface for category-specific operations.
/// </summary>
public interface ICategoryRepository : IGenericRepository<WorkshopCategory>
{
    Task<IEnumerable<WorkshopCategory>> GetActiveCategoriesAsync();
    Task<bool> IsCategoryNameUniqueAsync(string name, int? excludeId = null);
}
