using API.DTOs.Requests;
using API.DTOs.Responses;

namespace API.Services;

/// <summary>
/// Booking service interface.
/// Handles booking creation, cancellation, and seat management.
/// </summary>
public interface IBookingService
{
    Task<BookingResponse> CreateBookingAsync(string userId, CreateBookingRequest request);
    /// <summary>Reuses an unpaid pending booking when possible; otherwise creates a new booking.</summary>
    Task<BookingResponse> GetOrCreateBookingForPaymentAsync(string userId, CreateBookingRequest request);
    Task<BookingResponse?> GetBookingByIdAsync(int bookingId, string userId);
    Task<BookingResponse?> GetBookingByConfirmationCodeAsync(string confirmationCode, string userId);
    Task<BookingTicketResponse?> GetBookingTicketByCodeAsync(string confirmationCode, string userId);
    Task<IEnumerable<BookingResponse>> GetUserBookingsAsync(string userId);
    Task<CancellationResult> CancelBookingAsync(int bookingId, string userId, string? reason = null);
    Task<bool> CanUserReviewWorkshopAsync(string userId, int workshopId);
    Task<bool> ConfirmBookingPaymentAsync(int bookingId, string transactionUuid);
    Task<BookingTicketResponse?> GetBookingTicketAsync(int bookingId, string userId);
    Task<BookingAttendeeResponse?> CheckInBookingAsync(int providerId, string confirmationCode);
    Task<BookingAttendeeResponse?> MarkBookingNoShowAsync(int providerId, int bookingId);
    Task<int> CancelScheduleBookingsAsync(int scheduleId);
}

/// <summary>
/// Carries the outcome of a cancellation policy evaluation back to the caller.
/// </summary>
public class CancellationResult
{
    public int RefundPercentage { get; set; }
    public decimal RefundAmount { get; set; }
    public double HoursNotice { get; set; }
    public string Message { get; set; } = string.Empty;
}
