using System.ComponentModel.DataAnnotations;

namespace API.DTOs.Requests;

public class CreateWorkshopRequest
{
    [Required(ErrorMessage = "Title is required")]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(300)]
    public string? Tagline { get; set; }

    [Required(ErrorMessage = "Description is required")]
    public string Description { get; set; } = string.Empty;

    [Required(ErrorMessage = "Duration is required")]
    public TimeSpan Duration { get; set; }

    [Required]
    [Range(1, 1000)]
    public int MaxCapacity { get; set; }

    [Range(0, 1000)]
    public int? MinCapacity { get; set; }

    [Required(ErrorMessage = "Category is required")]
    public int CategoryId { get; set; }

    [Required(ErrorMessage = "Location address is required")]
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

    // Pricing
    [Required]
    [Range(0, double.MaxValue)]
    public decimal BasePrice { get; set; }

    public decimal? GroupDiscountPercentage { get; set; }
    public int? GroupDiscountMinSize { get; set; }
    public string? ExtraCharges { get; set; }
    [MaxLength(1000)]
    public string? PriceExplanation { get; set; }

    // Media
    public List<WorkshopMediaRequest> Media { get; set; } = new();
}
