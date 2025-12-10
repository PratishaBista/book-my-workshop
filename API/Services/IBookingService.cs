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
    Task<BookingResponse?> GetBookingByIdAsync(int bookingId, string userId);
    Task<BookingResponse?> GetBookingByConfirmationCodeAsync(string confirmationCode);
    Task<IEnumerable<BookingResponse>> GetUserBookingsAsync(string userId);
    Task<bool> CancelBookingAsync(int bookingId, string userId, string? reason = null);
    Task<bool> CanUserReviewWorkshopAsync(string userId, int workshopId);
}
