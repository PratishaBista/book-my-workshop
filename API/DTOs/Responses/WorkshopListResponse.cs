using API.Enums;

namespace API.DTOs.Responses;

public class WorkshopListResponse
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Tagline { get; set; }
    public string? Subtitle { get; set; }
    public WorkshopType WorkshopType { get; set; }
    public TimeSpan Duration { get; set; }
    public int MaxCapacity { get; set; }
    public string LocationAddress { get; set; } = string.Empty;
    public string? LocationName { get; set; }
    public WorkshopStatus Status { get; set; }
    
    // Categories
    public List<CategoryResponse> Categories { get; set; } = new();
    
    // Provider
    public int ProviderId { get; set; }
    public string ProviderBusinessName { get; set; } = string.Empty;
    
    // Pricing
    public decimal BasePrice { get; set; }
    public string Currency { get; set; } = "NPR";
    
    // Media
    public string? PrimaryImageUrl { get; set; }
    
    // Stats
    public double? AverageRating { get; set; }
    public int ReviewCount { get; set; }
    
    // Availability
    public bool HasUpcomingSchedules { get; set; }
    public DateTime? NextScheduleDate { get; set; }
    
    public DateTime CreatedAt { get; set; }
    public double? RecommendationScore { get; set; }
}
