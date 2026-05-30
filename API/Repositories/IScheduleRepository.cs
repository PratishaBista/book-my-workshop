using API.Entities;

namespace API.Repositories;

/// <summary>
/// Workshop schedule repository interface.
/// Handles schedule-specific queries and availability checks.
/// </summary>
public interface IScheduleRepository : IGenericRepository<WorkshopSchedule>
{
    Task<IEnumerable<WorkshopSchedule>> GetUpcomingSchedulesForWorkshopAsync(int workshopId);
    Task<WorkshopSchedule?> GetScheduleWithBookingsAsync(int scheduleId);
    Task<bool> IsScheduleAvailableAsync(int scheduleId, int requestedSeats);
    Task<IEnumerable<WorkshopSchedule>> GetProviderUpcomingSchedulesAsync(int providerId);
    Task<IEnumerable<WorkshopSchedule>> GetProviderSchedulesWithBookingsAsync(int providerId);
}
