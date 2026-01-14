using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using API.Enums;

namespace API.Entities;

public class WorkshopPricing
{
    [Key]
    public int Id { get; set; }

    // One-to-One with Workshop
    [Required]
    public int WorkshopId { get; set; }

    [ForeignKey(nameof(WorkshopId))]
    public Workshop Workshop { get; set; } = null!;

    [Required]
    public PricingType PricingType { get; set; } = PricingType.PerPerson;

    // Base Pricing
    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal BasePrice { get; set; }

    [MaxLength(10)]
    public string Currency { get; set; } = "NPR";

    // Group Discount (optional)
    [Column(TypeName = "decimal(5,2)")]
    public decimal? GroupDiscountPercentage { get; set; } // e.g., 10.00 for 10%

    public int? GroupDiscountMinSize { get; set; } // e.g., 3 people

    // Extra Charges (stored as JSON or text)
    public string? ExtraCharges { get; set; } // e.g., "Tool rental: NPR 200"

    // Price Explanation
    [MaxLength(1000)]
    public string? PriceExplanation { get; set; } // "$25 per person, includes materials"

    // Tiered Pricing (for future enhancement, stored as JSON)
    public string? TieredPricing { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
