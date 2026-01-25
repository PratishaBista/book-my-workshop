using System.ComponentModel.DataAnnotations;
using API.Enums;

namespace API.DTOs.Requests;

public class CreateWorkshopRequest
{
    [Required(ErrorMessage = "Title is required")]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(300)]
    public string? Tagline { get; set; }

    [MaxLength(300)]
    public string? Subtitle { get; set; }

    [Required(ErrorMessage = "Description is required")]
    public string Description { get; set; } = string.Empty;

    [Required(ErrorMessage = "Workshop type is required")]
    public WorkshopType WorkshopType { get; set; } = WorkshopType.PublicClass;

    [Required(ErrorMessage = "Duration is required")]
    public TimeSpan Duration { get; set; }

    [Required]
    [Range(1, 1000)]
    public int MaxCapacity { get; set; }

    [Range(0, 1000)]
    public int? MinCapacity { get; set; }

    [MaxLength(6, ErrorMessage = "You can select up to 6 categories")]
    public List<int> CategoryIds { get; set; } = new();

    [Required(ErrorMessage = "Location address is required")]
    [MaxLength(500)]
    public string LocationAddress { get; set; } = string.Empty;

    public int? VenueId { get; set; }

    [MaxLength(200)]
    public string? LocationName { get; set; }

    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }

    public string? VenueDescription { get; set; }

    [MaxLength(1000)]
    public string? LocationDetails { get; set; }

    public string? WhatToBring { get; set; }
    public string? SkillLevel { get; set; }
    public string? Suitability { get; set; }
    public string? CancellationPolicy { get; set; }
    public int BookingCutoffHours { get; set; } = 2;

    // Legacy fields
    public string? SafetyRequirements { get; set; }
    public string? WhatsIncluded { get; set; }

    // Pricing
    [Required]
    public PricingType PricingType { get; set; } = PricingType.PerPerson;

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
