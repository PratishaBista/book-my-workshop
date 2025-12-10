using API.Entities;
using API.Enums;

namespace API.Repositories;

/// <summary>
/// Workshop-specific repository interface.
/// Extends generic repository with custom workshop queries.
/// Follows Interface Segregation Principle (SOLID).
/// </summary>
public interface IWorkshopRepository : IGenericRepository<Workshop>
{
    // Custom workshop queries
    Task<IEnumerable<Workshop>> GetPublishedWorkshopsAsync();
    Task<IEnumerable<Workshop>> GetWorkshopsByCategoryAsync(int categoryId);
    Task<IEnumerable<Workshop>> GetWorkshopsByProviderAsync(int providerId);
    Task<Workshop?> GetWorkshopWithDetailsAsync(int id);
    Task<IEnumerable<Workshop>> SearchWorkshopsAsync(string searchTerm, int? categoryId = null, string? location = null);
    Task<IEnumerable<Workshop>> GetFeaturedWorkshopsAsync(int count = 6);
    Task<bool> IsWorkshopOwnedByProviderAsync(int workshopId, int providerId);
}
