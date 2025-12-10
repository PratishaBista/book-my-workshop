using API.DTOs.Requests;
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
        var categories = await _categoryRepository.GetActiveCategoriesAsync();
        return Ok(categories);
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
}
