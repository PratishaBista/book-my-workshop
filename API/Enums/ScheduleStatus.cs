namespace API.Enums;

public enum ScheduleStatus
{
    Upcoming = 0,    // Scheduled for future
    InProgress = 1,  // Currently happening
    Completed = 2,   // Workshop finished
    Cancelled = 3    // Cancelled by provider
}
