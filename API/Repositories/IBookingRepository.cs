using API.Entities;

namespace API.Repositories;

/// <summary>
/// Booking repository interface.
/// Handles booking-specific queries and seat management.
/// </summary>
public interface IBookingRepository : IGenericRepository<Booking>
{
    Task<IEnumerable<Booking>> GetUserBookingsAsync(string userId);
    Task<Booking?> GetBookingWithDetailsAsync(int bookingId);
    Task<Booking?> GetBookingByConfirmationCodeAsync(string confirmationCode);
    Task<bool> HasUserBookedScheduleAsync(string userId, int scheduleId);
    Task<List<int>> GetBookedScheduleIdsForUserAsync(string userId, int workshopId);
    Task<int> GetBookedSeatsForScheduleAsync(int scheduleId);
    Task<bool> CanUserReviewWorkshopAsync(string userId, int workshopId);
}
