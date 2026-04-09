using API.Data;
using API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class JournalController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public JournalController(ApplicationDbContext context)
    {
        _context = context;
    }

    // Public Endpoint: Get all published articles
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetPublishedArticles()
    {
        var articles = await _context.JournalArticles
            .AsNoTracking()
            .Where(a => a.Status == ArticleStatus.Published)
            .OrderByDescending(a => a.PublishedAt)
            .ToListAsync();
            
        return Ok(articles);
    }

    // Public Endpoint: Get highly specific article by slug
    [HttpGet("{slug}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetArticleBySlug(string slug)
    {
        var article = await _context.JournalArticles
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Slug == slug && a.Status == ArticleStatus.Published);
            
        if (article == null) return NotFound(new { message = "Article not found." });
        
        return Ok(article);
    }

    // SuperAdmin Endpoints
    [HttpGet("admin")]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<IActionResult> GetAllArticlesForAdmin()
    {
        var articles = await _context.JournalArticles
            .AsNoTracking()
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();
            
        return Ok(articles);
    }

    public class ArticleCreateDto
    {
        public string Title { get; set; } = string.Empty;
        public string Excerpt { get; set; } = string.Empty;
        public string ContentHtml { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string CoverImageUrl { get; set; } = string.Empty;
        public bool PublishNow { get; set; }
    }

    [HttpPost("admin")]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<IActionResult> CreateArticle([FromBody] ArticleCreateDto dto)
    {
        var slug = Regex.Replace(dto.Title.ToLower(), @"[^a-z0-9\s-]", "");
        slug = Regex.Replace(slug, @"\s+", "-").Trim('-');

        // Handle duplicates
        var count = await _context.JournalArticles.CountAsync(a => a.Slug.StartsWith(slug));
        if (count > 0) slug = $"{slug}-{count + 1}";

        var article = new JournalArticle
        {
            Title = dto.Title,
            Slug = slug,
            Excerpt = dto.Excerpt,
            ContentHtml = dto.ContentHtml,
            Category = dto.Category,
            CoverImageUrl = dto.CoverImageUrl,
            Status = dto.PublishNow ? ArticleStatus.Published : ArticleStatus.Draft,
            PublishedAt = dto.PublishNow ? DateTime.UtcNow : null,
            AuthorName = "The Editorial Team"
        };

        _context.JournalArticles.Add(article);
        await _context.SaveChangesAsync();

        return Ok(article);
    }

    [HttpPut("admin/{id}")]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<IActionResult> UpdateArticle(int id, [FromBody] ArticleCreateDto dto)
    {
        var article = await _context.JournalArticles.FindAsync(id);
        if (article == null) return NotFound();

        // Regenerate slug if title changed
        if (article.Title != dto.Title)
        {
            var slug = Regex.Replace(dto.Title.ToLower(), @"[^a-z0-9\s-]", "");
            slug = Regex.Replace(slug, @"\s+", "-").Trim('-');
            
            var count = await _context.JournalArticles.CountAsync(a => a.Slug.StartsWith(slug) && a.Id != id);
            if (count > 0) slug = $"{slug}-{count + 1}";
            article.Slug = slug;
        }

        article.Title = dto.Title;
        article.Excerpt = dto.Excerpt;
        article.ContentHtml = dto.ContentHtml;
        article.Category = dto.Category;
        article.CoverImageUrl = dto.CoverImageUrl;
        article.UpdatedAt = DateTime.UtcNow;

        // If previously draft and now publishing
        if (article.Status == ArticleStatus.Draft && dto.PublishNow)
        {
            article.Status = ArticleStatus.Published;
            article.PublishedAt = DateTime.UtcNow;
        }
        // If unpublishing
        else if (article.Status == ArticleStatus.Published && !dto.PublishNow)
        {
            article.Status = ArticleStatus.Draft;
        }

        await _context.SaveChangesAsync();
        return Ok(article);
    }

    [HttpDelete("admin/{id}")]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<IActionResult> DeleteArticle(int id)
    {
        var article = await _context.JournalArticles.FindAsync(id);
        if (article == null) return NotFound();

        _context.JournalArticles.Remove(article);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Article deleted successfully." });
    }
}
