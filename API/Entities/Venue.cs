using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.Entities;

public class Venue
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int ProviderId { get; set; }

    [ForeignKey(nameof(ProviderId))]
    public Provider Provider { get; set; } = null!;

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string Address { get; set; } = string.Empty;

    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }

    [MaxLength(1000)]
    public string? Description { get; set; } 
    public bool IsDefault { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<Workshop> Workshops { get; set; } = new List<Workshop>();
}
