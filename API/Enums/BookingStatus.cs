namespace API.Enums;

public enum BookingStatus
{
    Pending = 0,     // Booking created, awaiting payment
    Confirmed = 1,   // Payment confirmed, seat reserved
    Cancelled = 2,   // Cancelled by user or admin
    Completed = 3,   // Workshop has finished
    Refunded = 4     // Payment refunded after cancellation
}
