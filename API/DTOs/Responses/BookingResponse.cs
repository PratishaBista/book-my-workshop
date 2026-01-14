using API.Enums;

namespace API.DTOs.Responses;

public class BookingResponse
{
    public int Id { get; set; }
    public int NumberOfSeats { get; set; }
    public decimal TotalAmount { get; set; }
    public BookingStatus BookingStatus { get; set; }
    public PaymentStatus PaymentStatus { get; set; }
    public string ConfirmationCode { get; set; } = string.Empty;
    public DateTime BookingDate { get; set; }
    
    // Workshop Schedule Info
    public ScheduleInfoResponse Schedule { get; set; } = null!;
    
    // Workshop Info
    public WorkshopInfoResponse Workshop { get; set; } = null!;
    
    // Payment Info (for future eSewa integration)
    public string? PaymentGateway { get; set; }
    public string? TransactionId { get; set; }
    public DateTime? PaymentCompletedAt { get; set; }
    
    // Cancellation
    public DateTime? CancelledAt { get; set; }
    public string? CancellationReason { get; set; }
    
    // Review status
    public bool CanReview { get; set; }
    public bool HasReviewed { get; set; }
}

public class ScheduleInfoResponse
{
    public int Id { get; set; }
    public DateTime StartDateTime { get; set; }
    public DateTime EndDateTime { get; set; }
    public ScheduleStatus Status { get; set; }
}

public class WorkshopInfoResponse
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Tagline { get; set; }
    public string LocationAddress { get; set; } = string.Empty;
    public List<CategoryResponse> Categories { get; set; } = new();
    public string? PrimaryImageUrl { get; set; }
}
