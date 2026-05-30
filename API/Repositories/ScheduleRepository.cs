using API.Data;
using API.Entities;
using API.Enums;
using Microsoft.EntityFrameworkCore;

namespace API.Repositories;

/// <summary>
/// Workshop schedule repository implementation.
/// Handles schedule queries with availability logic.
/// </summary>
public class ScheduleRepository : GenericRepository<WorkshopSchedule>, IScheduleRepository
{
    public ScheduleRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<WorkshopSchedule>> GetUpcomingSchedulesForWorkshopAsync(int workshopId)
    {
        return await _dbSet
            .Where(s => s.WorkshopId == workshopId
                     && s.StartDateTime > DateTime.UtcNow
                     && s.Status == ScheduleStatus.Upcoming)
            .OrderBy(s => s.StartDateTime)
            .ToListAsync();
    }

    public async Task<WorkshopSchedule?> GetScheduleWithBookingsAsync(int scheduleId)
    {
        return await _dbSet
            .Include(s => s.Workshop)
            .Include(s => s.Bookings)
            .FirstOrDefaultAsync(s => s.Id == scheduleId);
    }

    public async Task<bool> IsScheduleAvailableAsync(int scheduleId, int requestedSeats)
    {
        var schedule = await _dbSet.FindAsync(scheduleId);
        
        if (schedule == null || schedule.Status != ScheduleStatus.Upcoming)
            return false;

        return schedule.AvailableSeats >= requestedSeats;
    }

    public async Task<IEnumerable<WorkshopSchedule>> GetProviderUpcomingSchedulesAsync(int providerId)
    {
        return await _dbSet
            .Include(s => s.Workshop)
                .ThenInclude(w => w.Pricing)
            .Where(s => s.Workshop.ProviderId == providerId
                     && s.StartDateTime > DateTime.UtcNow
                     && s.Status == ScheduleStatus.Upcoming)
            .OrderBy(s => s.StartDateTime)
            .ToListAsync();
    }

    public async Task<IEnumerable<WorkshopSchedule>> GetProviderSchedulesWithBookingsAsync(int providerId)
    {
        return await _dbSet
            .Include(s => s.Workshop)
            .Include(s => s.Bookings)
                .ThenInclude(b => b.User)
            .Where(s => s.Workshop.ProviderId == providerId)
            .OrderByDescending(s => s.StartDateTime)
            .ToListAsync();
    }
}
