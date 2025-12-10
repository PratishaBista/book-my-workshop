using API.Data;
using API.Entities;
using API.Enums;
using Microsoft.EntityFrameworkCore;

namespace API.Repositories;

/// <summary>
/// Booking repository implementation.
/// Handles complex booking queries and seat management logic.
/// </summary>
public class BookingRepository : GenericRepository<Booking>, IBookingRepository
{
    public BookingRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Booking>> GetUserBookingsAsync(string userId)
    {
        return await _dbSet
            .Include(b => b.WorkshopSchedule)
                .ThenInclude(s => s.Workshop)
                    .ThenInclude(w => w.Category)
            .Include(b => b.WorkshopSchedule)
                .ThenInclude(s => s.Workshop)
                    .ThenInclude(w => w.Media.OrderBy(m => m.DisplayOrder))
            .Where(b => b.UserId == userId)
            .OrderByDescending(b => b.BookingDate)
            .ToListAsync();
    }

    public async Task<Booking?> GetBookingWithDetailsAsync(int bookingId)
    {
        return await _dbSet
            .Include(b => b.User)
            .Include(b => b.WorkshopSchedule)
                .ThenInclude(s => s.Workshop)
                    .ThenInclude(w => w.Category)
            .Include(b => b.WorkshopSchedule)
                .ThenInclude(s => s.Workshop)
                    .ThenInclude(w => w.Provider)
            .Include(b => b.WorkshopSchedule)
                .ThenInclude(s => s.Workshop)
                    .ThenInclude(w => w.Media.OrderBy(m => m.DisplayOrder))
            .FirstOrDefaultAsync(b => b.Id == bookingId);
    }

    public async Task<Booking?> GetBookingByConfirmationCodeAsync(string confirmationCode)
    {
        return await _dbSet
            .Include(b => b.WorkshopSchedule)
                .ThenInclude(s => s.Workshop)
            .FirstOrDefaultAsync(b => b.ConfirmationCode == confirmationCode);
    }

    public async Task<bool> HasUserBookedScheduleAsync(string userId, int scheduleId)
    {
        return await _dbSet.AnyAsync(b => 
            b.UserId == userId 
            && b.WorkshopScheduleId == scheduleId
            && b.BookingStatus != BookingStatus.Cancelled);
    }

    public async Task<int> GetBookedSeatsForScheduleAsync(int scheduleId)
    {
        return await _dbSet
            .Where(b => b.WorkshopScheduleId == scheduleId 
                     && b.BookingStatus != BookingStatus.Cancelled)
            .SumAsync(b => b.NumberOfSeats);
    }

    public async Task<bool> CanUserReviewWorkshopAsync(string userId, int workshopId)
    {
        // User can review if they have a confirmed booking for this workshop
        // and the workshop schedule has been completed
        return await _dbSet
            .Include(b => b.WorkshopSchedule)
            .AnyAsync(b => b.UserId == userId
                        && b.WorkshopSchedule.WorkshopId == workshopId
                        && b.BookingStatus == BookingStatus.Confirmed
                        && b.WorkshopSchedule.Status == ScheduleStatus.Completed);
    }
}
