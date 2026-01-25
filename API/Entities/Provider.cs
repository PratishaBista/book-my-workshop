using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using API.Enums;

namespace API.Entities;

public class Provider
{
    [Key]
    public int Id { get; set; }

    [Required]
    public string BusinessName { get; set; } = string.Empty;

    [Required]
    public string PhoneNumber { get; set; } = string.Empty;

    public string Address { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string? VenueName { get; set; } 
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }

    public string? Website { get; set; }
    public string? ReferralSource { get; set; }

    // Business Branding Fields
    public string? Tagline { get; set; }
    public string? Description { get; set; }
    public string? Slug { get; set; } 
    public string? LogoUrl { get; set; }
    public string? CoverImageUrl { get; set; }

    // Lifecycle Status
    public ProviderStatus Status { get; set; } = ProviderStatus.Incomplete;
    
    // Persistent approval flag
    public bool IsApproved { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Venue> Venues { get; set; } = new List<Venue>();

    // Foreign Key to ApplicationUser
    [Required]
    public string UserId { get; set; } = string.Empty;

    [ForeignKey("UserId")]
    public ApplicationUser User { get; set; } = null!;
}
