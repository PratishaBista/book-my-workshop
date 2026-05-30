using API.Enums;

namespace API.DTOs.Responses;

public class BookingTicketResponse
{
    public int BookingId { get; set; }
    public string ConfirmationCode { get; set; } = string.Empty;
    public string GuestName { get; set; } = string.Empty;
    public int NumberOfSeats { get; set; }
    public string WorkshopTitle { get; set; } = string.Empty;
    public string? WorkshopSlug { get; set; }
    public string? WorkshopImageUrl { get; set; }
    public DateTime StartDateTime { get; set; }
    public DateTime EndDateTime { get; set; }
    public string LocationAddress { get; set; } = string.Empty;
    public string? LocationName { get; set; }
    public string TicketUrl { get; set; } = string.Empty;
    public string QrPayload { get; set; } = string.Empty;
    public AttendanceStatus AttendanceStatus { get; set; }
    public BookingStatus BookingStatus { get; set; }
    public PaymentStatus PaymentStatus { get; set; }
}
