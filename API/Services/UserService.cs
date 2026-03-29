using API.Data;
using API.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace API.Services;

public interface IUserService
{
    Task<bool> HardDeleteUserAsync(string userId);
}

public class UserService : IUserService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ApplicationDbContext _context;

    public UserService(UserManager<ApplicationUser> userManager, ApplicationDbContext context)
    {
        _userManager = userManager;
        _context = context;
    }

    public async Task<bool> HardDeleteUserAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return false;

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var reviews = await _context.WorkshopReviews
                .Where(r => r.UserId == user.Id)
                .ToListAsync();
            if (reviews.Any()) _context.WorkshopReviews.RemoveRange(reviews);

            var bookings = await _context.Bookings
                .Where(b => b.UserId == user.Id)
                .ToListAsync();
            if (bookings.Any())
            {
                var bookingIds = bookings.Select(b => b.Id).ToList();
                var reviewsOnBookings = await _context.WorkshopReviews
                    .Where(r => bookingIds.Contains(r.BookingId))
                    .ToListAsync();
                if (reviewsOnBookings.Any()) _context.WorkshopReviews.RemoveRange(reviewsOnBookings);
                _context.Bookings.RemoveRange(bookings);
            }

            var provider = await _context.Providers.FirstOrDefaultAsync(p => p.UserId == user.Id);
            if (provider != null)
            {
                var workshops = await _context.Workshops
                    .Include(w => w.Schedules)
                    .Where(w => w.ProviderId == provider.Id)
                    .ToListAsync();

                foreach (var workshop in workshops)
                {
                    foreach (var schedule in workshop.Schedules)
                    {
                        var scheduleBookings = await _context.Bookings
                            .Where(b => b.WorkshopScheduleId == schedule.Id)
                            .ToListAsync();
                        if (scheduleBookings.Any())
                        {
                            var sBookingIds = scheduleBookings.Select(b => b.Id).ToList();
                            var sReviews = await _context.WorkshopReviews
                                .Where(r => sBookingIds.Contains(r.BookingId))
                                .ToListAsync();
                            if (sReviews.Any()) _context.WorkshopReviews.RemoveRange(sReviews);
                            _context.Bookings.RemoveRange(scheduleBookings);
                        }
                    }
                    _context.Workshops.Remove(workshop);
                }
                _context.Providers.Remove(provider);
            }

            await _context.SaveChangesAsync();

            var result = await _userManager.DeleteAsync(user);
            if (!result.Succeeded) throw new Exception("Identity removal failed");

            await transaction.CommitAsync();
            return true;
        }
        catch
        {
            await transaction.RollbackAsync();
            return false;
        }
    }
}
