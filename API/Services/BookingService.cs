using API.Data;
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
    private readonly ApplicationDbContext _context;

    public BookingService(
        IBookingRepository bookingRepository,
        IScheduleRepository scheduleRepository,
        IWorkshopRepository workshopRepository,
        IMapper mapper,
        ILogger<BookingService> logger,
        ApplicationDbContext context)
    {
        _bookingRepository = bookingRepository;
        _scheduleRepository = scheduleRepository;
        _workshopRepository = workshopRepository;
        _mapper = mapper;
        _logger = logger;
        _context = context;
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

    public async Task<CancellationResult> CancelBookingAsync(int bookingId, string userId, string? reason = null)
    {
        var booking = await _bookingRepository.GetBookingWithDetailsAsync(bookingId);
        
        if (booking == null || booking.UserId != userId)
            throw new KeyNotFoundException("Booking not found.");

        if (booking.BookingStatus == BookingStatus.Cancelled || booking.BookingStatus == BookingStatus.Refunded)
            throw new InvalidOperationException("Booking is already cancelled.");

        if (booking.WorkshopSchedule.Status != ScheduleStatus.Upcoming)
            throw new InvalidOperationException("Cannot cancel a booking for a workshop that has already started or completed.");

        var workshopStart = booking.WorkshopSchedule.StartDateTime;
        var hoursUntilWorkshop = (workshopStart - DateTime.UtcNow).TotalHours;

        int refundPct = CalculateRefundPercentage(hoursUntilWorkshop);
        decimal refundAmount = Math.Round(booking.TotalAmount * refundPct / 100, 2);

        // Return seats to schedule
        var schedule = await _scheduleRepository.GetByIdAsync(booking.WorkshopScheduleId);
        if (schedule != null)
        {
            schedule.AvailableSeats += booking.NumberOfSeats;
            _scheduleRepository.Update(schedule);
        }

        // Update booking
        booking.BookingStatus = BookingStatus.Cancelled;
        booking.CancelledAt = DateTime.UtcNow;
        booking.CancellationReason = reason;
        booking.CancelledBy = "User";
        booking.RefundPercentage = refundPct;
        booking.RefundAmount = refundAmount;

        if (booking.PaymentStatus == PaymentStatus.Paid)
        {
            booking.PaymentStatus = refundPct > 0 ? PaymentStatus.Refunded : PaymentStatus.Paid;
            booking.BookingStatus = refundPct > 0 ? BookingStatus.Refunded : BookingStatus.Cancelled;

            // Only claw back if it was already released to the wallet
            if (refundPct > 0 && booking.HostEarnings > 0 && booking.PayoutStatus != PayoutStatus.Escrow)
            {
                var hostClawback = Math.Round(booking.HostEarnings * refundPct / 100, 2);
                var scheduleWithProvider = await _context.WorkshopSchedules
                    .Include(s => s.Workshop).ThenInclude(w => w.Provider)
                    .FirstOrDefaultAsync(s => s.Id == booking.WorkshopScheduleId);

                if (scheduleWithProvider?.Workshop?.Provider != null)
                {
                    scheduleWithProvider.Workshop.Provider.WalletBalance -= hostClawback;
                }
            }
            
            booking.PayoutStatus = PayoutStatus.Cancelled;
        }

        _bookingRepository.Update(booking);
        await _bookingRepository.SaveChangesAsync();

        _logger.LogInformation($"Booking {booking.ConfirmationCode} cancelled by user. Refund: {refundPct}% (NPR {refundAmount})");

        return new CancellationResult
        {
            RefundPercentage = refundPct,
            RefundAmount = refundAmount,
            HoursNotice = hoursUntilWorkshop,
            Message = refundPct == 100 ? "A full refund of the booking amount has been processed."
                    : "No refund is applicable as the cancellation was made less than 24 hours before the workshop."
        };
    }

    private static int CalculateRefundPercentage(double hoursUntilWorkshop)
    {
        // 100% refund if cancelled more than 24 hours before the event
        if (hoursUntilWorkshop > 24) return 100;
        
        // No refund if less than 24 hours notice
        return 0;
    }


    public async Task<bool> CanUserReviewWorkshopAsync(string userId, int workshopId)
    {
        return await _bookingRepository.CanUserReviewWorkshopAsync(userId, workshopId);
    }

    public async Task<bool> ConfirmBookingPaymentAsync(int bookingId, string transactionUuid)
    {
        var booking = await _bookingRepository.GetByIdAsync(bookingId);
        if (booking == null) return false;

        if (booking.PaymentStatus == PaymentStatus.Paid) return true;

        booking.BookingStatus = BookingStatus.Confirmed;
        booking.PaymentStatus = PaymentStatus.Paid;
        booking.PaymentCompletedAt = DateTime.UtcNow;
        booking.TransactionId = transactionUuid;
        booking.PaymentGateway = "eSewa";

        var settings = await _context.PlatformSettings.FirstOrDefaultAsync();
        var commissionRate = settings?.CommissionPercentage ?? 10.0m;

        booking.PlatformFee = Math.Round(booking.TotalAmount * commissionRate / 100, 2);
        booking.HostEarnings = booking.TotalAmount - booking.PlatformFee;
        booking.PayoutStatus = PayoutStatus.Escrow;

        _bookingRepository.Update(booking);
        await _bookingRepository.SaveChangesAsync();

        _logger.LogInformation(
            $"Payment confirmed for Booking {booking.Id}. Fee: {booking.PlatformFee}, Host Earnings: {booking.HostEarnings}. Transaction: {transactionUuid}");
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
