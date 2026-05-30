namespace API.DTOs.Responses;

public class PublicHostProfileResponse
{
    public int Id { get; set; }
    public string BusinessName { get; set; } = string.Empty;
    public string? Slug { get; set; }
    public string? Tagline { get; set; }
    public string? Description { get; set; }
    public string? LogoUrl { get; set; }
    public string? CoverImageUrl { get; set; }
    public string? StudioImageUrl { get; set; }
    public string? Address { get; set; }
    public string? State { get; set; }
    public string? Website { get; set; }
    public double? AverageRating { get; set; }
    public int ReviewCount { get; set; }
    public int WorkshopCount { get; set; }
    public List<WorkshopListResponse> Workshops { get; set; } = new();
    public List<ReviewResponse> Reviews { get; set; } = new();
}
