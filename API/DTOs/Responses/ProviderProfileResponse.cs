using API.Enums;

namespace API.Dtos.Responses;

public class ProviderProfileResponse
{
    public int Id { get; set; }
    public string BusinessName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string? Website { get; set; }
    
    // New Branding Fields
    public string? Tagline { get; set; }
    public string? Description { get; set; }
    public string? Slug { get; set; }
    public string? LogoUrl { get; set; }
    public string? CoverImageUrl { get; set; }
    
    // Lifecycle Status
    public ProviderStatus Status { get; set; }
    public bool IsApproved { get; set; }

    public string ContactPerson { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}
