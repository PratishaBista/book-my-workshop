using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;

namespace API.Entities;

public class WorkshopReview
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int WorkshopId { get; set; }

    [ForeignKey(nameof(WorkshopId))]
    public Workshop Workshop { get; set; } = null!;

    [Required]
    public string UserId { get; set; } = string.Empty;

    [ForeignKey(nameof(UserId))]
    public ApplicationUser User { get; set; } = null!;

    [Required]
    public int BookingId { get; set; }

    [ForeignKey(nameof(BookingId))]
    public Booking Booking { get; set; } = null!;

    [Required]
    [Range(1, 5)]
    public int Rating { get; set; }

    [Required]
    [MaxLength(2000)]
    public string Comment { get; set; } = string.Empty;

    /// <summary>JSON array of up to 3 image URLs (Cloudinary).</summary>
    public string? ImageUrlsJson { get; set; }

    public bool IsFlagged { get; set; }

    public float OffensiveScore { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [NotMapped]
    public bool IsVerifiedAttendee => BookingId > 0;

    [NotMapped]
    public List<string> ImageUrls
    {
        get
        {
            if (string.IsNullOrWhiteSpace(ImageUrlsJson))
                return new List<string>();
            try
            {
                return JsonSerializer.Deserialize<List<string>>(ImageUrlsJson) ?? new List<string>();
            }
            catch
            {
                return new List<string>();
            }
        }
        set => ImageUrlsJson = value.Count == 0 ? null : JsonSerializer.Serialize(value);
    }
}
