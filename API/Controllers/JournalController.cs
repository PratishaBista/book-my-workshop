// journal controller manages blog/articles for the platform's content marketing
// public endpoints for reading published articles, admin endpoints for crud
// slugs are auto-generated from titles for seo-friendly urls

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

    // returns all published articles for public readers
    // ordered by publish date descending (newest first)
    // uses asnotracking for read-only performance optimization
    // GET: api/journal
    [HttpGet]
    [AllowAnonymous] // no authentication required for reading articles
    public async Task<IActionResult> GetPublishedArticles()
    {
        var articles = await _context.JournalArticles
            .AsNoTracking() // improves performance since we're not updating these entities
            .Where(a => a.Status == ArticleStatus.Published)
            .OrderByDescending(a => a.PublishedAt)
            .ToListAsync();

        return Ok(articles);
    }

    // retrieves a single article by its slug (seo-friendly url identifier)
    // slugs look like "how-to-host-a-workshop-in-kathmandu"
    // returns 404 if article doesn't exist or is not published
    // GET: api/journal/{slug}
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

    // superadmin endpoint to get all articles regardless of status
    // includes drafts and unpublished articles for editing
    // GET: api/journal/admin
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

    // dto for creating/updating articles
    // separate from entity to avoid over-posting attacks
    public class ArticleCreateDto
    {
        public string Title { get; set; } = string.Empty;
        public string Excerpt { get; set; } = string.Empty; // short summary shown in article cards
        public string ContentHtml { get; set; } = string.Empty; // rich text content from wysiwyg editor
        public string Category { get; set; } = string.Empty; // e.g., "tips", "news", "host-spotlight"
        public string CoverImageUrl { get; set; } = string.Empty;
        public bool PublishNow { get; set; } // if true, sets status to published and sets publishedat
    }

    // creates a new article (draft or published)
    // slug is auto-generated from title with duplicate handling
    // POST: api/journal/admin
    [HttpPost("admin")]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<IActionResult> CreateArticle([FromBody] ArticleCreateDto dto)
    {
        // generate slug: lowercase, remove special chars, replace spaces with hyphens
        var slug = Regex.Replace(dto.Title.ToLower(), @"[^a-z0-9\s-]", "");
        slug = Regex.Replace(slug, @"\s+", "-").Trim('-');

        // handle duplicate slugs by appending a number
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
            AuthorName = "The Editorial Team" // could be extended to support multiple authors
        };

        _context.JournalArticles.Add(article);
        await _context.SaveChangesAsync();

        return Ok(article);
    }

    // updates an existing article
    // regenerates slug if title changed
    // handles status transitions between draft and published
    // PUT: api/journal/admin/{id}
    [HttpPut("admin/{id}")]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<IActionResult> UpdateArticle(int id, [FromBody] ArticleCreateDto dto)
    {
        var article = await _context.JournalArticles.FindAsync(id);
        if (article == null) return NotFound();

        // regenerate slug only if title actually changed
        if (article.Title != dto.Title)
        {
            var slug = Regex.Replace(dto.Title.ToLower(), @"[^a-z0-9\s-]", "");
            slug = Regex.Replace(slug, @"\s+", "-").Trim('-');

            // exclude current article when checking for duplicates
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

        // handle status change from draft to published
        if (article.Status == ArticleStatus.Draft && dto.PublishNow)
        {
            article.Status = ArticleStatus.Published;
            article.PublishedAt = DateTime.UtcNow;
        }

        // handle unpublishing a previously published article
        else if (article.Status == ArticleStatus.Published && !dto.PublishNow)
        {
            article.Status = ArticleStatus.Draft;
            // publishedat remains for historical reference but article is no longer public
        }

        await _context.SaveChangesAsync();
        return Ok(article);
    }

    // permanently removes an article from the database
    // DELETE: api/journal/admin/{id}
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
