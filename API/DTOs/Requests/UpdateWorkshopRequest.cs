using System.ComponentModel.DataAnnotations;
using API.Enums;

namespace API.DTOs.Requests;

public class UpdateWorkshopRequest
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(300)]
    public string? Tagline { get; set; }

    [MaxLength(300)]
    public string? Subtitle { get; set; }

    [Required]
    public string Description { get; set; } = string.Empty;

    [Required]
    public WorkshopType WorkshopType { get; set; } = WorkshopType.PublicClass;

    [Required]
    public TimeSpan Duration { get; set; }

    [Required]
    [Range(1, 1000)]
    public int MaxCapacity { get; set; }

    [Range(0, 1000)]
    public int? MinCapacity { get; set; }

    [MaxLength(6)]
    public List<int> CategoryIds { get; set; } = new();

    [Required]
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

    public string? SafetyRequirements { get; set; }
    public string? WhatsIncluded { get; set; }

    // Pricing updates
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

    public List<WorkshopMediaRequest> Media { get; set; } = new();
}
