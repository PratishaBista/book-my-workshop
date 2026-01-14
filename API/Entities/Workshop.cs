using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using API.Enums;

namespace API.Entities;

public class Workshop
{
    [Key]
    public int Id { get; set; }

    // Relationship to Provider
    [Required]
    public int ProviderId { get; set; }

    [ForeignKey(nameof(ProviderId))]
    public Provider Provider { get; set; } = null!;

    // Basic Info
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(300)]
    public string? Tagline { get; set; }

    [MaxLength(300)]
    public string? Subtitle { get; set; }

    [Required]
    [MaxLength(500)]
    public string Slug { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty; // HTML content or Rich Text

    // Workshop Type
    [Required]
    public WorkshopType WorkshopType { get; set; } = WorkshopType.PublicClass;

    // Duration
    [Required]
    public TimeSpan Duration { get; set; } // e.g., 02:30:00 for 2h 30min

    // Capacity
    [Required]
    [Range(1, 1000)]
    public int MaxCapacity { get; set; }

    [Range(0, 1000)]
    public int? MinCapacity { get; set; }

    // Categories (Many-to-Many)
    public ICollection<WorkshopCategory> Categories { get; set; } = new List<WorkshopCategory>();

    // Location (simple for now, will enhance with maps later)
    [Required]
    [MaxLength(500)]
    public string LocationAddress { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? LocationName { get; set; } // e.g., "Pottery Studio Thamel"

    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }

    [MaxLength(1000)]
    public string? LocationDetails { get; set; } // "2nd floor, red building"

    public string? VenueDescription { get; set; } // Human description of the place

    // Status
    public WorkshopStatus Status { get; set; } = WorkshopStatus.Draft;

    public bool IsActive { get; set; } = true;

    // Additional Details
    public string? WhatToBring { get; set; } // Structured list or detailed string
    public string? SkillLevel { get; set; } // "Beginner", "Advanced", etc.
    public string? Suitability { get; set; } // "Age 18+", "Suitable for kids", etc.
    public string? CancellationPolicy { get; set; }
    public int BookingCutoffHours { get; set; } = 2; // Default: Book at least 2 hours in advance

    // Legacy fields (keeping for compatibility or migration if needed, but moving to new structure)
    public string? SafetyRequirements { get; set; } 
    public string? WhatsIncluded { get; set; } 

    // Audit Fields
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation Properties
    public WorkshopPricing? Pricing { get; set; }
    public ICollection<WorkshopMedia> Media { get; set; } = new List<WorkshopMedia>();
    public ICollection<WorkshopSchedule> Schedules { get; set; } = new List<WorkshopSchedule>();
    public ICollection<WorkshopReview> Reviews { get; set; } = new List<WorkshopReview>();
}
