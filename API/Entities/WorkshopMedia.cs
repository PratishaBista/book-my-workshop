using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using API.Enums;

namespace API.Entities;

public class WorkshopMedia
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int WorkshopId { get; set; }

    [ForeignKey(nameof(WorkshopId))]
    public Workshop Workshop { get; set; } = null!;

    [Required]
    public MediaType MediaType { get; set; }

    [Required]
    public string Url { get; set; } = string.Empty; // Cloudinary URL

    public string? PublicId { get; set; } // Cloudinary public ID for deletion

    public bool IsPrimary { get; set; } = false; // Featured/thumbnail image

    public int StoryPodId { get; set; } // Groups media into "chapters" (1-5)

    public int DisplayOrder { get; set; }

    [MaxLength(20)]
    public string? AspectRatio { get; set; } // e.g., "9:16", "16:9"

    public long? FileSizeBytes { get; set; }

    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
}
