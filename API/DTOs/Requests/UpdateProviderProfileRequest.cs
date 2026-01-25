using System.ComponentModel.DataAnnotations;

namespace API.DTOs.Requests;

public class UpdateProviderProfileRequest
{
    [Required]
    public string BusinessName { get; set; } = string.Empty;

    [Required]
    public string PhoneNumber { get; set; } = string.Empty;

    public string Address { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string? VenueName { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }

    public string? Website { get; set; }

    // Branding Fields
    public string? Tagline { get; set; }
    public string? Description { get; set; }
    
    [Required]
    public string Slug { get; set; } = string.Empty;
    
    public string? LogoUrl { get; set; }
    public string? CoverImageUrl { get; set; }

    // Flag to submit for review
    public bool SubmitForReview { get; set; }
}
