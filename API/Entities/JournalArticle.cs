using System.ComponentModel.DataAnnotations;

namespace API.Entities;

public enum ArticleStatus
{
    Draft = 0,
    Published = 1,
    Archived = 2
}

public class JournalArticle
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    public string Slug { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string Excerpt { get; set; } = string.Empty;

    [Required]
    public string ContentHtml { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Category { get; set; } = string.Empty;

    [Required]
    public string CoverImageUrl { get; set; } = string.Empty;

    [Required]
    public ArticleStatus Status { get; set; } = ArticleStatus.Draft;

    [MaxLength(100)]
    public string? AuthorName { get; set; }

    public DateTime? PublishedAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
