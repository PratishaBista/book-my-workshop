using API.DTOs.Requests;
using API.DTOs.Responses;
using API.Entities;
using API.Enums;
using API.Repositories;
using AutoMapper;
using Microsoft.EntityFrameworkCore;

namespace API.Services;

/// <summary>
/// Booking service implementation.
/// Handles atomic booking creation with seat management and validation.
/// Critical: Uses transactions to prevent overbooking.
/// </summary>
public class BookingService : IBookingService
{
    private readonly IBookingRepository _bookingRepository;
    private readonly IScheduleRepository _scheduleRepository;
    private readonly IWorkshopRepository _workshopRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<BookingService> _logger;

    public BookingService(
        IBookingRepository bookingRepository,
        IScheduleRepository scheduleRepository,
        IWorkshopRepository workshopRepository,
        IMapper mapper,
        ILogger<BookingService> logger)
    {
        _bookingRepository = bookingRepository;
        _scheduleRepository = scheduleRepository;
        _workshopRepository = workshopRepository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<BookingResponse> CreateBookingAsync(string userId, CreateBookingRequest request)
    {
        // Get schedule with workshop details
        var schedule = await _scheduleRepository.GetScheduleWithBookingsAsync(request.WorkshopScheduleId);
        
        if (schedule == null)
        {
            throw new KeyNotFoundException("Workshop schedule not found.");
        }

        if (schedule.Status != ScheduleStatus.Upcoming)
        {
            throw new InvalidOperationException("This workshop schedule is not available for booking.");
        }

        if (schedule.StartDateTime <= DateTime.UtcNow)
        {
            throw new InvalidOperationException("Cannot book past workshops.");
        }

        // Check if user already booked this schedule
        var hasBooked = await _bookingRepository.HasUserBookedScheduleAsync(userId, request.WorkshopScheduleId);
        if (hasBooked)
        {
            throw new InvalidOperationException("You have already booked this workshop session.");
        }

        // Check seat availability
        if (schedule.AvailableSeats < request.NumberOfSeats)
        {
            throw new InvalidOperationException($"Only {schedule.AvailableSeats} seats available.");
        }

        if (request.NumberOfSeats <= 0)
        {
            throw new ArgumentException("Number of seats must be at least 1.");
        }

        // Get workshop pricing
        var workshop = await _workshopRepository.GetWorkshopWithDetailsAsync(schedule.WorkshopId);
        if (workshop == null || workshop.Pricing == null)
        {
            throw new InvalidOperationException("Workshop pricing not found.");
        }

        // Calculate total amount
        decimal totalAmount = workshop.Pricing.BasePrice * request.NumberOfSeats;

        // Apply group discount if applicable
        if (workshop.Pricing.GroupDiscountPercentage.HasValue && 
            workshop.Pricing.GroupDiscountMinSize.HasValue &&
            request.NumberOfSeats >= workshop.Pricing.GroupDiscountMinSize.Value)
        {
            var discount = totalAmount * (workshop.Pricing.GroupDiscountPercentage.Value / 100);
            totalAmount -= discount;
        }

        // Create booking
        var booking = _mapper.Map<Booking>(request);
        booking.UserId = userId;
        booking.TotalAmount = totalAmount;
        booking.ConfirmationCode = GenerateConfirmationCode();
        booking.BookingStatus = BookingStatus.Pending;
        booking.PaymentStatus = PaymentStatus.Pending;

        // Atomic operation: Create booking and decrement seats
        try
        {
            await _bookingRepository.AddAsync(booking);
            
            // Decrement available seats
            schedule.AvailableSeats -= request.NumberOfSeats;
            _scheduleRepository.Update(schedule);

            await _bookingRepository.SaveChangesAsync();

            _logger.LogInformation($"Booking created: {booking.ConfirmationCode} for user {userId}");
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Error creating booking - possible race condition");
            throw new InvalidOperationException("Failed to create booking. Please try again.");
        }

        // Get full booking details
        var bookingDetail = await _bookingRepository.GetBookingWithDetailsAsync(booking.Id);
        if (bookingDetail == null) throw new Exception("Booking created but failed to retrieve details.");

        var response = _mapper.Map<BookingResponse>(bookingDetail);
        
        // Set review eligibility
        response.CanReview = bookingDetail.WorkshopSchedule.Status == ScheduleStatus.Completed 
                           && bookingDetail.BookingStatus == BookingStatus.Confirmed;

        return response;
    }

    public async Task<BookingResponse?> GetBookingByIdAsync(int bookingId, string userId)
    {
        var booking = await _bookingRepository.GetBookingWithDetailsAsync(bookingId);
        
        if (booking == null || booking.UserId != userId)
        {
            return null;
        }

        var response = _mapper.Map<BookingResponse>(booking);
        response.CanReview = await _bookingRepository.CanUserReviewWorkshopAsync(userId, booking.WorkshopSchedule.WorkshopId);

        return response;
    }

    public async Task<BookingResponse?> GetBookingByConfirmationCodeAsync(string confirmationCode)
    {
        var booking = await _bookingRepository.GetBookingByConfirmationCodeAsync(confirmationCode);
        
        if (booking == null)
        {
            return null;
        }

        var response = _mapper.Map<BookingResponse>(booking);
        response.CanReview = await _bookingRepository.CanUserReviewWorkshopAsync(booking.UserId, booking.WorkshopSchedule.WorkshopId);

        return response;
    }

    public async Task<IEnumerable<BookingResponse>> GetUserBookingsAsync(string userId)
    {
        var bookings = await _bookingRepository.GetUserBookingsAsync(userId);
        var responses = _mapper.Map<IEnumerable<BookingResponse>>(bookings).ToList();

        // Set review eligibility for each booking
        foreach (var response in responses)
        {
            var booking = bookings.First(b => b.Id == response.Id);
            response.CanReview = booking.WorkshopSchedule.Status == ScheduleStatus.Completed 
                               && booking.BookingStatus == BookingStatus.Confirmed
                               && booking.Review == null;
        }

        return responses;
    }

    public async Task<bool> CancelBookingAsync(int bookingId, string userId, string? reason = null)
    {
        var booking = await _bookingRepository.GetBookingWithDetailsAsync(bookingId);
        
        if (booking == null || booking.UserId != userId)
        {
            return false;
        }

        if (booking.BookingStatus == BookingStatus.Cancelled)
        {
            throw new InvalidOperationException("Booking is already cancelled.");
        }

        if (booking.WorkshopSchedule.Status != ScheduleStatus.Upcoming)
        {
            throw new InvalidOperationException("Cannot cancel booking for this workshop.");
        }

        // Return seats to schedule
        var schedule = await _scheduleRepository.GetByIdAsync(booking.WorkshopScheduleId);
        if (schedule != null)
        {
            schedule.AvailableSeats += booking.NumberOfSeats;
            _scheduleRepository.Update(schedule);
        }

        // Update booking status
        booking.BookingStatus = BookingStatus.Cancelled;
        booking.CancelledAt = DateTime.UtcNow;
        booking.CancellationReason = reason;

        // If payment was made, mark for refund
        if (booking.PaymentStatus == PaymentStatus.Paid)
        {
            booking.PaymentStatus = PaymentStatus.Refunded;
            booking.BookingStatus = BookingStatus.Refunded;
        }

        _bookingRepository.Update(booking);
        await _bookingRepository.SaveChangesAsync();

        _logger.LogInformation($"Booking cancelled: {booking.ConfirmationCode}");

        return true;
    }

    public async Task<bool> CanUserReviewWorkshopAsync(string userId, int workshopId)
    {
        return await _bookingRepository.CanUserReviewWorkshopAsync(userId, workshopId);
    }

    public async Task<bool> ConfirmBookingPaymentAsync(int bookingId, string transactionUuid)
    {
        var booking = await _bookingRepository.GetByIdAsync(bookingId);
        if (booking == null) return false;

        // Idempotency check
        if (booking.PaymentStatus == PaymentStatus.Paid) return true;

        booking.BookingStatus = BookingStatus.Confirmed;
        booking.PaymentStatus = PaymentStatus.Paid;
        booking.PaymentCompletedAt = DateTime.UtcNow;
        booking.TransactionId = transactionUuid;
        booking.PaymentGateway = "eSewa";

        _bookingRepository.Update(booking);
        await _bookingRepository.SaveChangesAsync();

        _logger.LogInformation($"Payment confirmed for Booking {booking.Id}. Transaction: {transactionUuid}");
        return true;
    }

    private string GenerateConfirmationCode()
    {
        // Generate unique confirmation code: BMW-XXXXXXXX
        var timestamp = DateTime.UtcNow.Ticks.ToString();
        var randomPart = Guid.NewGuid().ToString("N").Substring(0, 8).ToUpper();
        return $"BMW-{randomPart}";
    }
}
