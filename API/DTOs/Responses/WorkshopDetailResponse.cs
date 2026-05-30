using API.Enums;

namespace API.DTOs.Responses;

public class WorkshopDetailResponse
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Tagline { get; set; }
    public string? Subtitle { get; set; }
    public string Description { get; set; } = string.Empty;
    public TimeSpan Duration { get; set; }
    public int MaxCapacity { get; set; }
    public int? MinCapacity { get; set; }
    public WorkshopStatus Status { get; set; }
    
    // Location
    public string LocationAddress { get; set; } = string.Empty;
    public string? LocationName { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public string? LocationDetails { get; set; }
    public string? VenueDescription { get; set; }
    
    public VenueResponse? Venue { get; set; }
    
    // Categories
    public List<CategoryResponse> Categories { get; set; } = new();
    
    // Provider
    public ProviderResponse Provider { get; set; } = null!;
    
    // Pricing
    public PricingResponse Pricing { get; set; } = null!;
    
    // Media
    public List<MediaResponse> Media { get; set; } = new();
    
    // Schedules
    public List<ScheduleResponse> UpcomingSchedules { get; set; } = new();
    
    // Reviews
    public List<ReviewResponse> Reviews { get; set; } = new();
    public double? AverageRating { get; set; }
    public int ReviewCount { get; set; }
    
    // Additional sections
    public string? WhatToBring { get; set; }
    public string? SkillLevel { get; set; }
    public string? Suitability { get; set; }
    public string? CancellationPolicy { get; set; }
    public int BookingCutoffHours { get; set; }

    public string? SafetyRequirements { get; set; }
    public string? WhatsIncluded { get; set; }
    
    // Rejection and modification tracking
    public string? RejectionReason { get; set; }
    public DateTime? RejectedAt { get; set; }
    public bool HasPendingModifications { get; set; }
    public List<int> BookedScheduleIds { get; set; } = new();
    /// <summary>Schedules with an unpaid pending booking — user can complete payment.</summary>
    public List<int> PendingPaymentScheduleIds { get; set; } = new();
    
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CategoryResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? IconUrl { get; set; }
}

public class ProviderResponse
{
    public int Id { get; set; }
    public string BusinessName { get; set; } = string.Empty;
    public string? Slug { get; set; }
    public string? Tagline { get; set; }
    public string? Description { get; set; }
    public string? Address { get; set; }
    public string? LogoUrl { get; set; }
    public string? CoverImageUrl { get; set; }
}

public class PricingResponse
{
    public PricingType PricingType { get; set; }
    public decimal BasePrice { get; set; }
    public string Currency { get; set; } = "NPR";
    public decimal? GroupDiscountPercentage { get; set; }
    public int? GroupDiscountMinSize { get; set; }
    public string? ExtraCharges { get; set; }
    public string? PriceExplanation { get; set; }
}

public class MediaResponse
{
    public int Id { get; set; }
    public MediaType MediaType { get; set; }
    public string Url { get; set; } = string.Empty;
    public bool IsPrimary { get; set; }
    public int StoryPodId { get; set; }
    public int DisplayOrder { get; set; }
    public string? AspectRatio { get; set; }
}

public class ScheduleResponse
{
    public int Id { get; set; }
    public int WorkshopId { get; set; }
    public string WorkshopTitle { get; set; } = string.Empty;
    public decimal BasePrice { get; set; }
    public DateTime StartDateTime { get; set; }
    public DateTime EndDateTime { get; set; }
    public int MaxCapacity { get; set; }
    public int AvailableSeats { get; set; }
    public bool IsSoldOut { get; set; }
    public ScheduleStatus Status { get; set; }
}

