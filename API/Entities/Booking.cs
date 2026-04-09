using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using API.Enums;

namespace API.Entities;

public class Booking
{
    [Key]
    public int Id { get; set; }

    // User who made the booking
    [Required]
    public string UserId { get; set; } = string.Empty;

    [ForeignKey(nameof(UserId))]
    public ApplicationUser User { get; set; } = null!;

    // Specific workshop schedule
    [Required]
    public int WorkshopScheduleId { get; set; }

    [ForeignKey(nameof(WorkshopScheduleId))]
    public WorkshopSchedule WorkshopSchedule { get; set; } = null!;

    // Booking Details
    [Required]
    [Range(1, 100)]
    public int NumberOfSeats { get; set; } = 1;

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalAmount { get; set; }

    // Status
    public BookingStatus BookingStatus { get; set; } = BookingStatus.Pending;
    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;

    // Payment Details (for future eSewa integration)
    [MaxLength(50)]
    public string? PaymentGateway { get; set; } // "eSewa", "Khalti", etc.

    [MaxLength(200)]
    public string? TransactionId { get; set; } // eSewa transaction ID

    [MaxLength(200)]
    public string? PaymentReference { get; set; } // eSewa reference code

    public DateTime? PaymentCompletedAt { get; set; }

    // Confirmation
    [MaxLength(100)]
    public string ConfirmationCode { get; set; } = string.Empty; // Unique code

    // Cancellation
    public DateTime? CancelledAt { get; set; }

    [MaxLength(1000)]
    public string? CancellationReason { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? RefundAmount { get; set; }

    public int? RefundPercentage { get; set; } // 0, 50, or 100

    public string? CancelledBy { get; set; } // "User", "Host", "Admin"

    // Audit
    public DateTime BookingDate { get; set; } = DateTime.UtcNow;

    // Navigation Property
    public WorkshopReview? Review { get; set; }

    // --- Financials ---
    [Column(TypeName = "decimal(18,2)")]
    public decimal PlatformFee { get; set; } // The commission taken by the platform

    [Column(TypeName = "decimal(18,2)")]
    public decimal HostEarnings { get; set; } // The amount the host receives (Total - Fee)

    public PayoutStatus PayoutStatus { get; set; } = PayoutStatus.Escrow; // Escrow -> Ready -> Paid
}
