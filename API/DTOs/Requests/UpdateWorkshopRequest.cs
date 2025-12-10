using System.ComponentModel.DataAnnotations;

namespace API.DTOs.Requests;

public class UpdateWorkshopRequest
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(300)]
    public string? Tagline { get; set; }

    [Required]
    public string Description { get; set; } = string.Empty;

    [Required]
    public TimeSpan Duration { get; set; }

    [Required]
    [Range(1, 1000)]
    public int MaxCapacity { get; set; }

    [Range(0, 1000)]
    public int? MinCapacity { get; set; }

    [Required]
    public int CategoryId { get; set; }

    [Required]
    [MaxLength(500)]
    public string LocationAddress { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? LocationName { get; set; }

    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }

    [MaxLength(1000)]
    public string? LocationDetails { get; set; }

    public string? SafetyRequirements { get; set; }
    public string? WhatsIncluded { get; set; }

    // Pricing updates
    [Required]
    [Range(0, double.MaxValue)]
    public decimal BasePrice { get; set; }

    public decimal? GroupDiscountPercentage { get; set; }
    public int? GroupDiscountMinSize { get; set; }
    public string? ExtraCharges { get; set; }
    [MaxLength(1000)]
    public string? PriceExplanation { get; set; }
}
