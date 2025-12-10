using System.Linq.Expressions;

namespace API.Repositories;

/// <summary>
/// Generic repository interface following Repository Pattern.
/// Provides common CRUD operations for all entities.
/// Follows DRY principle - reusable across all entity types.
/// </summary>
public interface IGenericRepository<T> where T : class
{
    // Read Operations
    Task<T?> GetByIdAsync(int id);
    Task<IEnumerable<T>> GetAllAsync();
    Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate);
    Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate);
    Task<bool> ExistsAsync(Expression<Func<T, bool>> predicate);
    Task<int> CountAsync(Expression<Func<T, bool>>? predicate = null);

    // Write Operations
    Task<T> AddAsync(T entity);
    Task AddRangeAsync(IEnumerable<T> entities);
    void Update(T entity);
    void Delete(T entity);
    void DeleteRange(IEnumerable<T> entities);

    // Save Changes
    Task<int> SaveChangesAsync();
}
