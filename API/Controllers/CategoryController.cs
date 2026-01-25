using API.DTOs.Requests;
using API.DTOs.Responses;
using API.Repositories;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoryController : ControllerBase
{
    private readonly ICategoryRepository _categoryRepository;
    private readonly IMapper _mapper;

    public CategoryController(ICategoryRepository categoryRepository, IMapper mapper)
    {
        _categoryRepository = categoryRepository;
        _mapper = mapper;
    }

    // GET: api/category
    [HttpGet]
    public async Task<IActionResult> GetAllCategories()
    {
        // If it's an admin, show all categories with stats.
        if (User.IsInRole("Admin"))
        {
            var allCategories = await _categoryRepository.GetAllAsync();
            var response = allCategories.Select(c => new CategoryAdminResponse
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                IconUrl = c.IconUrl,
                IsActive = c.IsActive,
                CreatedAt = c.CreatedAt,
                WorkshopCount = c.Workshops.Count
            }).OrderBy(c => c.Name);
            
            return Ok(response);
        }

        var categories = await _categoryRepository.GetActiveCategoriesAsync();
        return Ok(categories.OrderBy(c => c.Name));
    }

    // POST: api/category (Admin only)
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryRequest request)
    {
        var isUnique = await _categoryRepository.IsCategoryNameUniqueAsync(request.Name);
        if (!isUnique)
        {
            return BadRequest(new { message = "Category name already exists." });
        }

        var category = _mapper.Map<Entities.WorkshopCategory>(request);
        await _categoryRepository.AddAsync(category);
        await _categoryRepository.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAllCategories), new { id = category.Id }, category);
    }

    // PUT: api/category/{id} (Admin only)
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateCategory(int id, [FromBody] UpdateCategoryRequest request)
    {
        var category = await _categoryRepository.GetByIdAsync(id);
        if (category == null) return NotFound();

        var isUnique = await _categoryRepository.IsCategoryNameUniqueAsync(request.Name, id);
        if (!isUnique)
        {
            return BadRequest(new { message = "Category name already exists." });
        }

        _mapper.Map(request, category);
        _categoryRepository.Update(category);
        await _categoryRepository.SaveChangesAsync();

        return Ok(category);
    }

    // DELETE: api/category/{id} (Admin only)
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        var category = await _categoryRepository.GetByIdAsync(id);
        if (category == null) return NotFound();

        _categoryRepository.Delete(category);
        await _categoryRepository.SaveChangesAsync();

        return NoContent();
    }
}
