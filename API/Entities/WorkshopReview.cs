using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.Entities;

public class WorkshopReview
{
    [Key]
    public int Id { get; set; }

    // Workshop being reviewed
    [Required]
    public int WorkshopId { get; set; }

    [ForeignKey(nameof(WorkshopId))]
    public Workshop Workshop { get; set; } = null!;

    // User who wrote the review
    [Required]
    public string UserId { get; set; } = string.Empty;

    [ForeignKey(nameof(UserId))]
    public ApplicationUser User { get; set; } = null!;

    // Link to booking (ensures only attendees can review)
    [Required]
    public int BookingId { get; set; }

    [ForeignKey(nameof(BookingId))]
    public Booking Booking { get; set; } = null!;

    // Review Content
    [Required]
    [Range(1, 5)]
    public int Rating { get; set; } // 1-5 stars

    [Required]
    [MaxLength(2000)]
    public string Comment { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Computed property - indicates this is from a verified attendee
    [NotMapped]
    public bool IsVerifiedAttendee => BookingId > 0;
}
