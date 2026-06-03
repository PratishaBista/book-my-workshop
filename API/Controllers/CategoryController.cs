// category controller manages workshop categories for the platform
// public endpoints for browsing categories, admin endpoints for crud operations
// uses memory caching to reduce database load for frequently accessed public category lists

using API.DTOs.Requests;
using API.DTOs.Responses;
using API.Repositories;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoryController : ControllerBase
{
    private readonly ICategoryRepository _categoryRepository;
    private readonly IMapper _mapper; // automapper for dto <-> entity conversions
    private readonly IMemoryCache _cache; // in-memory cache for performance

    public CategoryController(ICategoryRepository categoryRepository, IMapper mapper, IMemoryCache cache)
    {
        _categoryRepository = categoryRepository;
        _mapper = mapper;
        _cache = cache;
    }

    // returns all categories
    // response varies based on user role:
    // - admin: gets all categories with workshop counts for management
    // - public: gets only active categories (isactive = true) from cache
    // GET: api/category
    [HttpGet]
    public async Task<IActionResult> GetAllCategories()
    {
        // check if current user has admin role using claims-based authorization
        // user.isinrole works because of the [authorize] attribute at controller level
        if (User.IsInRole("Admin"))
        {
            // admin view includes workshop count for each category
            // helpful for understanding which categories are popular
            var allCategories = await _categoryRepository.GetAllAsync();
            var response = allCategories.Select(c => new CategoryAdminResponse
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                IconUrl = c.IconUrl,
                IsActive = c.IsActive,
                CreatedAt = c.CreatedAt,
                WorkshopCount = c.Workshops.Count // count of workshops in this category
            }).OrderBy(c => c.Name);

            return Ok(response);
        }

        // public users get only active categories, cached for 1 hour
        // cache key pattern: prefix describing what's being cached
        if (_cache.TryGetValue("CacheKey_PublicCategories", out IEnumerable<Entities.WorkshopCategory>? cachedCategories))
        {
            return Ok(cachedCategories!.OrderBy(c => c.Name));
        }

        var categories = await _categoryRepository.GetActiveCategoriesAsync();
        _cache.Set("CacheKey_PublicCategories", categories, TimeSpan.FromHours(1));

        return Ok(categories.OrderBy(c => c.Name));
    }

    // creates a new category
    // category name must be unique across the system
    // only accessible by admin users
    // POST: api/category
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryRequest request)
    {
        // validate uniqueness before creating
        var isUnique = await _categoryRepository.IsCategoryNameUniqueAsync(request.Name);
        if (!isUnique)
        {
            return BadRequest(new { message = "Category name already exists." });
        }

        var category = _mapper.Map<Entities.WorkshopCategory>(request);
        await _categoryRepository.AddAsync(category);
        await _categoryRepository.SaveChangesAsync();

        // invalidate cache so public users see the new category immediately
        _cache.Remove("CacheKey_PublicCategories");

        // returns 201 created with location header pointing to getallcategories
        return CreatedAtAction(nameof(GetAllCategories), new { id = category.Id }, category);
    }

    // updates an existing category
    // checks name uniqueness excluding the current category being updated
    // only accessible by admin users
    // PUT: api/category/{id}
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateCategory(int id, [FromBody] UpdateCategoryRequest request)
    {
        var category = await _categoryRepository.GetByIdAsync(id);
        if (category == null) return NotFound();

        // exclude current category when checking name uniqueness
        // otherwise updating a category with its own name would fail
        var isUnique = await _categoryRepository.IsCategoryNameUniqueAsync(request.Name, id);
        if (!isUnique)
        {
            return BadRequest(new { message = "Category name already exists." });
        }

        // automapper maps request properties to existing category entity
        _mapper.Map(request, category);
        _categoryRepository.Update(category);
        await _categoryRepository.SaveChangesAsync();

        // clear cache so updated category appears
        _cache.Remove("CacheKey_PublicCategories");

        return Ok(category);
    }

    // categories with workshops may have cascade behavior defined
    // only accessible by admin users
    // DELETE: api/category/{id}
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        var category = await _categoryRepository.GetByIdAsync(id);
        if (category == null) return NotFound();

        _categoryRepository.Delete(category);
        await _categoryRepository.SaveChangesAsync();

        // clear cache after deletion
        _cache.Remove("CacheKey_PublicCategories");

        return NoContent(); // 204 no content (standard rest convention for delete)
    }
}
