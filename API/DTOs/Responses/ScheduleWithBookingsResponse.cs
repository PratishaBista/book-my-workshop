using API.Enums;
using System;
using System.Collections.Generic;

namespace API.DTOs.Responses;

public class ScheduleWithBookingsResponse : ScheduleResponse
{
    public List<BookingAttendeeResponse> Bookings { get; set; } = new();
}

public class BookingAttendeeResponse
{
    public int Id { get; set; }
    public string GuestName { get; set; } = string.Empty;
    public string? GuestEmail { get; set; }
    public int NumberOfSeats { get; set; }
    public string ConfirmationCode { get; set; } = string.Empty;
    public BookingStatus BookingStatus { get; set; }
    public PaymentStatus PaymentStatus { get; set; }
    public DateTime BookingDate { get; set; }
    public AttendanceStatus AttendanceStatus { get; set; }
    public DateTime? CheckedInAt { get; set; }
}
