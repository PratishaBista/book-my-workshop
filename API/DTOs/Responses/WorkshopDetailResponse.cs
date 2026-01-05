using API.Enums;

namespace API.DTOs.Responses;

public class WorkshopDetailResponse
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Tagline { get; set; }
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
    
    // Category
    public CategoryResponse Category { get; set; } = null!;
    
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
    
    // Optional sections
    public string? SafetyRequirements { get; set; }
    public string? WhatsIncluded { get; set; }
    
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
    public string? Address { get; set; }
    public string? LogoUrl { get; set; }
    public string? CoverImageUrl { get; set; }
}

public class PricingResponse
{
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
    public int DisplayOrder { get; set; }
}

public class ScheduleResponse
{
    public int Id { get; set; }
    public DateTime StartDateTime { get; set; }
    public DateTime EndDateTime { get; set; }
    public int AvailableSeats { get; set; }
    public bool IsSoldOut { get; set; }
    public ScheduleStatus Status { get; set; }
}

public class ReviewResponse
{
    public int Id { get; set; }
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public bool IsVerifiedAttendee { get; set; }
    public DateTime CreatedAt { get; set; }
}
