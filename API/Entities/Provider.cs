using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using API.Enums;

namespace API.Entities;

public class Provider
{
    [Key]
    public int Id { get; set; }

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
    public string? ReferralSource { get; set; }

    // Business Branding Fields
    public string? Tagline { get; set; }
    public string? Description { get; set; }
    public string? Slug { get; set; } 
    public string? LogoUrl { get; set; }
    public string? CoverImageUrl { get; set; }

    // Trust & Safety Fields
    public string? IdCardUrl { get; set; } // Path to Identity Document in S3 (Private)
    public string? PanCardUrl { get; set; } // Path to PAN Certificate in S3 (Private)
    public string? IdFileName { get; set; } // Original file name for reference
    public string? PanFileName { get; set; } // Original file name for reference
    public string? ExtractedPanNumber { get; set; } // Set by AI OCR Simulation
    public string? ExtractedIdName { get; set; } // Set by AI OCR Simulation
    
    // Verification Status
    public bool IsIdVerified { get; set; } = false;
    public bool IsPanVerified { get; set; } = false;
    public DateTime? DocumentsReviewedAt { get; set; }
    public string? ReviewNotes { get; set; }

    public float TrustScore { get; set; } = 0.0f; // Calculated based on consistency (0-100)
    public string? TrustAnalysisJson { get; set; } // Raw results from NLP Consistency Check
    public bool IsManuallyVerified { get; set; } = false;

    // Lifecycle Status
    public ProviderStatus Status { get; set; } = ProviderStatus.Incomplete;
    
    // Persistent approval flag
    public bool IsApproved { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Venue> Venues { get; set; } = new List<Venue>();

    // Financials
    [Column(TypeName = "decimal(18,2)")]
    public decimal WalletBalance { get; set; } = 0.0m; // Amount the platform owes the host

    // Foreign Key to ApplicationUser
    [Required]
    public string UserId { get; set; } = string.Empty;

    [ForeignKey("UserId")]
    public ApplicationUser User { get; set; } = null!;
}
