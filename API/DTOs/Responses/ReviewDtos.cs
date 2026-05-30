namespace API.DTOs.Responses;

public class ReviewResponse
{
    public int Id { get; set; }
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public bool IsVerifiedAttendee { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<string> ImageUrls { get; set; } = new();
    public int WorkshopId { get; set; }
    public string WorkshopTitle { get; set; } = string.Empty;
    public string? WorkshopSlug { get; set; }
    public string? WorkshopImageUrl { get; set; }
    public int? ProviderId { get; set; }
    public string? ProviderName { get; set; }
}

public class FlaggedReviewResponse
{
    public int Id { get; set; }
    public int WorkshopId { get; set; }
    public string WorkshopTitle { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
    public List<string> ImageUrls { get; set; } = new();
    public float OffensiveScore { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>Review row for admin moderation (all reviews or flagged subset).</summary>
public class AdminReviewResponse
{
    public int Id { get; set; }
    public int WorkshopId { get; set; }
    public string WorkshopTitle { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
    public List<string> ImageUrls { get; set; } = new();
    public bool IsFlagged { get; set; }
    public float OffensiveScore { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class TopRatedHostResponse
{
    public int ProviderId { get; set; }
    public string BusinessName { get; set; } = string.Empty;
    public string? LogoUrl { get; set; }
    public string? Slug { get; set; }
    public double AverageRating { get; set; }
    public int ReviewCount { get; set; }
}

public class ReviewsFeedResponse
{
    public List<ReviewResponse> Reviews { get; set; } = new();
    public List<TopRatedHostResponse> TopHosts { get; set; } = new();
    public int TotalReviews { get; set; }
}
