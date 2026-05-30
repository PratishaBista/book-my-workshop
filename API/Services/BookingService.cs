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
    private readonly IBookingTicketService _ticketService;
    private readonly IGiftCardService _giftCardService;
    private readonly INotificationService _notificationService;
    private readonly IEmailService _emailService;

    public BookingService(
        IBookingRepository bookingRepository,
        IScheduleRepository scheduleRepository,
        IWorkshopRepository workshopRepository,
        IMapper mapper,
        ILogger<BookingService> logger,
        ApplicationDbContext context,
        IBookingTicketService ticketService,
        IGiftCardService giftCardService,
        INotificationService notificationService,
        IEmailService emailService)
    {
        _bookingRepository = bookingRepository;
        _scheduleRepository = scheduleRepository;
        _workshopRepository = workshopRepository;
        _mapper = mapper;
        _logger = logger;
        _context = context;
        _ticketService = ticketService;
        _giftCardService = giftCardService;
        _notificationService = notificationService;
        _emailService = emailService;
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
        decimal walletAmountUsed = 0;
        if (request.UseWallet)
        {
            var wallet = await _context.Wallets.FirstOrDefaultAsync(w => w.UserId == userId);
            if (wallet != null)
            {
                walletAmountUsed = Math.Min(wallet.Balance, totalAmount);
            }
        }

        var booking = _mapper.Map<Booking>(request);
        booking.UserId = userId;
        booking.TotalAmount = totalAmount;
        booking.WalletAmountUsed = walletAmountUsed;
        booking.ConfirmationCode = GenerateConfirmationCode();
        
        bool isFullyPaidWithWallet = walletAmountUsed == totalAmount;

        if (isFullyPaidWithWallet)
        {
            booking.BookingStatus = BookingStatus.Confirmed;
            booking.PaymentStatus = PaymentStatus.Paid;
            booking.PaymentGateway = "Wallet";
            booking.PaymentCompletedAt = DateTime.UtcNow;

            var settings = await _context.PlatformSettings.FirstOrDefaultAsync();
            var commissionRate = settings?.CommissionPercentage ?? 10.0m;
            var vatRate = settings?.VatPercentage ?? 13.0m;

            booking.PlatformFee = Math.Round(totalAmount * commissionRate / 100, 2);
            booking.VatOnCommission = Math.Round(booking.PlatformFee * vatRate / 100, 2);
            booking.HostEarnings = totalAmount - booking.PlatformFee;
            booking.PayoutStatus = PayoutStatus.Escrow;
        }
        else
        {
            booking.BookingStatus = BookingStatus.Pending;
            booking.PaymentStatus = PaymentStatus.Pending;
        }

        // Atomic operation: Create booking and decrement seats
        using var dbTransaction = await _context.Database.BeginTransactionAsync();
        try
        {
            await _bookingRepository.AddAsync(booking);

            // --- Concurrency-safe seat decrement ---
            // Uses a single conditional SQL UPDATE to prevent overbooking under concurrent requests.
            // This is an atomic read-modify-write: the WHERE clause re-checks availability at the
            // exact moment of the UPDATE, so two simultaneous requests cannot both decrement from 1 → 0.
            // The loser gets rowsUpdated == 0 and receives a "sold out" error instead of a double-booking.
            int rowsUpdated = await _context.WorkshopSchedules
                .Where(s => s.Id == schedule.Id && s.AvailableSeats >= request.NumberOfSeats)
                .ExecuteUpdateAsync(s => s
                    .SetProperty(x => x.AvailableSeats, x => x.AvailableSeats - request.NumberOfSeats));

            if (rowsUpdated == 0)
            {
                // Another concurrent request just took the last seat(s) — reject this one.
                throw new InvalidOperationException(
                    "Sorry, this session just sold out. Please choose another date.");
            }

            await _bookingRepository.SaveChangesAsync();

            if (isFullyPaidWithWallet)
            {
                var deducted = await _giftCardService.DeductFromWalletAsync(userId, booking.Id, totalAmount);
                if (!deducted)
                {
                    throw new InvalidOperationException("Failed to deduct from wallet. Insufficient balance.");
                }
            }

            await dbTransaction.CommitAsync();
            _logger.LogInformation(
                "Booking created: {Code} for user {UserId} — {Seats} seat(s) reserved on schedule {ScheduleId}",
                booking.ConfirmationCode, userId, request.NumberOfSeats, schedule.Id);
        }
        catch (Exception ex)
        {
            await dbTransaction.RollbackAsync();
            _logger.LogError(ex, "Error creating booking for schedule {ScheduleId}", schedule.Id);
            throw new InvalidOperationException(ex.Message);
        }

        if (isFullyPaidWithWallet)
        {
            try
            {
                await _ticketService.SendBookingConfirmationEmailAsync(booking);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send booking confirmation email for fully wallet-paid {BookingId}", booking.Id);
            }
        }

        // Get full booking details
        var bookingDetail = await _bookingRepository.GetBookingWithDetailsAsync(booking.Id);
        if (bookingDetail == null) throw new Exception("Booking created but failed to retrieve details.");

        var response = _mapper.Map<BookingResponse>(bookingDetail);
        
        // Set review eligibility
        response.CanReview = CanReviewBooking(bookingDetail);

        return response;
    }

    public async Task<BookingResponse> GetOrCreateBookingForPaymentAsync(string userId, CreateBookingRequest request)
    {
        var pending = await _bookingRepository.GetPendingUnpaidBookingAsync(userId, request.WorkshopScheduleId);
        if (pending != null)
        {
            var walletMatches = request.UseWallet
                ? pending.WalletAmountUsed > 0
                : pending.WalletAmountUsed == 0;

            if (pending.NumberOfSeats == request.NumberOfSeats && walletMatches)
            {
                _logger.LogInformation(
                    "Resuming payment for pending booking {BookingId} on schedule {ScheduleId}",
                    pending.Id, request.WorkshopScheduleId);

                var existing = _mapper.Map<BookingResponse>(pending);
                existing.CanReview = CanReviewBooking(pending);
                return existing;
            }

            await ReleasePendingUnpaidBookingAsync(pending, userId);
        }

        return await CreateBookingAsync(userId, request);
    }

    private async Task ReleasePendingUnpaidBookingAsync(Booking booking, string userId)
    {
        if (booking.UserId != userId)
            throw new UnauthorizedAccessException();

        if (booking.BookingStatus != BookingStatus.Pending || booking.PaymentStatus != PaymentStatus.Pending)
            return;

        var schedule = await _scheduleRepository.GetByIdAsync(booking.WorkshopScheduleId);
        if (schedule != null)
        {
            schedule.AvailableSeats += booking.NumberOfSeats;
            _scheduleRepository.Update(schedule);
        }

        booking.BookingStatus = BookingStatus.Cancelled;
        booking.CancelledAt = DateTime.UtcNow;
        booking.CancellationReason = "Payment not completed — reservation released";
        booking.CancelledBy = "System";
        _bookingRepository.Update(booking);
        await _bookingRepository.SaveChangesAsync();

        _logger.LogInformation(
            "Released pending unpaid booking {BookingId}; {Seats} seat(s) returned to schedule {ScheduleId}",
            booking.Id, booking.NumberOfSeats, booking.WorkshopScheduleId);
    }

    public async Task<BookingResponse?> GetBookingByIdAsync(int bookingId, string userId)
    {
        var booking = await _bookingRepository.GetBookingWithDetailsAsync(bookingId);
        
        if (booking == null || booking.UserId != userId)
        {
            return null;
        }

        var response = _mapper.Map<BookingResponse>(booking);
        response.CanReview = CanReviewBooking(booking);

        return response;
    }

    public async Task<BookingResponse?> GetBookingByConfirmationCodeAsync(string confirmationCode, string userId)
    {
        var booking = await _bookingRepository.GetBookingByConfirmationCodeAsync(confirmationCode);
        
        if (booking == null || booking.UserId != userId)
            return null;

        var response = _mapper.Map<BookingResponse>(booking);
        response.CanReview = CanReviewBooking(booking);

        return response;
    }

    public async Task<BookingTicketResponse?> GetBookingTicketByCodeAsync(string confirmationCode, string userId)
    {
        var booking = await _bookingRepository.GetBookingByConfirmationCodeAsync(confirmationCode);
        if (booking == null || booking.UserId != userId)
            return null;

        return await GetBookingTicketAsync(booking.Id, userId);
    }

    public async Task<IEnumerable<BookingResponse>> GetUserBookingsAsync(string userId)
    {
        var bookings = await _bookingRepository.GetUserBookingsAsync(userId);
        var responses = _mapper.Map<IEnumerable<BookingResponse>>(bookings).ToList();

        // Set review eligibility for each booking
        foreach (var response in responses)
        {
            var booking = bookings.First(b => b.Id == response.Id);
            response.CanReview = CanReviewBooking(booking);
            response.HasReviewed = booking.Review != null;
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

            // Refund to user's wallet
            if (refundPct > 0 && refundAmount > 0)
            {
                await _giftCardService.RefundToWalletAsync(booking.UserId, booking.Id, refundAmount);
            }
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

        using var dbTransaction = await _context.Database.BeginTransactionAsync();
        try
        {
            if (booking.WalletAmountUsed > 0)
            {
                var deducted = await _giftCardService.DeductFromWalletAsync(booking.UserId, booking.Id, booking.WalletAmountUsed);
                if (!deducted)
                {
                    _logger.LogError("Insufficient wallet balance for user {UserId} to confirm Booking {BookingId}", booking.UserId, booking.Id);
                    return false;
                }
            }

            booking.BookingStatus = BookingStatus.Confirmed;
            booking.PaymentStatus = PaymentStatus.Paid;
            booking.PaymentCompletedAt = DateTime.UtcNow;
            booking.TransactionId = transactionUuid;
            booking.PaymentGateway = booking.WalletAmountUsed > 0 ? "eSewa + Wallet" : "eSewa";

            var settings = await _context.PlatformSettings.FirstOrDefaultAsync();
            var commissionRate = settings?.CommissionPercentage ?? 10.0m;
            var vatRate = settings?.VatPercentage ?? 13.0m;

            booking.PlatformFee = Math.Round(booking.TotalAmount * commissionRate / 100, 2);
            booking.VatOnCommission = Math.Round(booking.PlatformFee * vatRate / 100, 2);
            booking.HostEarnings = booking.TotalAmount - booking.PlatformFee;
            booking.PayoutStatus = PayoutStatus.Escrow;

            _bookingRepository.Update(booking);
            await _bookingRepository.SaveChangesAsync();
            await dbTransaction.CommitAsync();
        }
        catch (Exception ex)
        {
            await dbTransaction.RollbackAsync();
            _logger.LogError(ex, "Failed to confirm booking payment for {BookingId}", booking.Id);
            return false;
        }

        _logger.LogInformation(
            "Payment confirmed for Booking {BookingId}. Fee: {Fee}, Host Earnings: {Earnings}. Transaction: {Transaction}",
            booking.Id, booking.PlatformFee, booking.HostEarnings, transactionUuid);

        try
        {
            await _ticketService.SendBookingConfirmationEmailAsync(booking);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send booking confirmation email for {BookingId}", booking.Id);
        }

        return true;
    }

    public async Task<BookingTicketResponse?> GetBookingTicketAsync(int bookingId, string userId)
    {
        var booking = await _bookingRepository.GetBookingWithDetailsAsync(bookingId);
        if (booking == null || booking.UserId != userId)
            return null;

        if (booking.PaymentStatus != PaymentStatus.Paid || booking.BookingStatus != BookingStatus.Confirmed)
            return null;

        var workshop = booking.WorkshopSchedule.Workshop;
        var imageUrl = workshop.Media?
            .Where(m => m.MediaType == MediaType.Image)
            .OrderBy(m => m.DisplayOrder)
            .Select(m => m.Url)
            .FirstOrDefault();

        return new BookingTicketResponse
        {
            BookingId = booking.Id,
            ConfirmationCode = booking.ConfirmationCode,
            GuestName = booking.User.FullName ?? "Guest",
            NumberOfSeats = booking.NumberOfSeats,
            WorkshopTitle = workshop.Title,
            WorkshopSlug = workshop.Slug,
            WorkshopImageUrl = imageUrl,
            StartDateTime = booking.WorkshopSchedule.StartDateTime,
            EndDateTime = booking.WorkshopSchedule.EndDateTime,
            LocationAddress = workshop.LocationAddress,
            LocationName = workshop.LocationName,
            TicketUrl = _ticketService.BuildTicketUrl(booking.ConfirmationCode),
            QrPayload = _ticketService.BuildQrPayload(booking.ConfirmationCode),
            AttendanceStatus = booking.AttendanceStatus,
            BookingStatus = booking.BookingStatus,
            PaymentStatus = booking.PaymentStatus
        };
    }

    public async Task<BookingAttendeeResponse?> CheckInBookingAsync(int providerId, string confirmationCode)
    {
        var booking = await _context.Bookings
            .Include(b => b.User)
            .Include(b => b.WorkshopSchedule)
                .ThenInclude(s => s.Workshop)
            .FirstOrDefaultAsync(b => b.ConfirmationCode == confirmationCode);

        if (booking == null)
            return null;

        if (booking.WorkshopSchedule.Workshop.ProviderId != providerId)
            throw new UnauthorizedAccessException("This booking is not for your workshop.");

        if (booking.BookingStatus != BookingStatus.Confirmed || booking.PaymentStatus != PaymentStatus.Paid)
            throw new InvalidOperationException("Only confirmed, paid bookings can be checked in.");

        if (booking.AttendanceStatus != AttendanceStatus.CheckedIn)
        {
            booking.AttendanceStatus = AttendanceStatus.CheckedIn;
            booking.CheckedInAt = DateTime.UtcNow;
            _bookingRepository.Update(booking);
            await _bookingRepository.SaveChangesAsync();
        }

        return MapAttendee(booking);
    }

    public async Task<BookingAttendeeResponse?> MarkBookingNoShowAsync(int providerId, int bookingId)
    {
        var booking = await _context.Bookings
            .Include(b => b.User)
            .Include(b => b.WorkshopSchedule)
                .ThenInclude(s => s.Workshop)
            .FirstOrDefaultAsync(b => b.Id == bookingId);

        if (booking == null)
            return null;

        if (booking.WorkshopSchedule.Workshop.ProviderId != providerId)
            throw new UnauthorizedAccessException("This booking is not for your workshop.");

        booking.AttendanceStatus = AttendanceStatus.NoShow;
        booking.CheckedInAt = null;
        _bookingRepository.Update(booking);
        await _bookingRepository.SaveChangesAsync();

        return MapAttendee(booking);
    }

    public async Task<int> CancelScheduleBookingsAsync(int scheduleId)
    {
        var bookings = await _context.Bookings
            .Include(b => b.User)
            .Include(b => b.WorkshopSchedule)
            .Where(b => b.WorkshopScheduleId == scheduleId 
                     && b.BookingStatus != BookingStatus.Cancelled 
                     && b.BookingStatus != BookingStatus.Refunded)
            .ToListAsync();

        int refundedCount = 0;

        foreach (var booking in bookings)
        {
            if (booking.PaymentStatus == PaymentStatus.Paid)
            {
                // Full refund since host cancelled
                booking.RefundPercentage = 100;
                booking.RefundAmount = booking.TotalAmount;
                booking.PaymentStatus = PaymentStatus.Refunded;
                booking.BookingStatus = BookingStatus.Refunded;

                // Refund to user's wallet
                if (booking.TotalAmount > 0)
                {
                    await _giftCardService.RefundToWalletAsync(booking.UserId, booking.Id, booking.TotalAmount);
                }
                refundedCount++;

                await _notificationService.CreateNotificationAsync(
                    booking.UserId,
                    "Workshop Cancelled",
                    $"The host has cancelled the schedule for '{booking.WorkshopSchedule.Workshop.Title}'. A full refund of Rs. {booking.TotalAmount} has been credited to your wallet.",
                    NotificationType.Alert
                );

                var emailBody = EmailTemplates.GetNotificationEmail(
                    "Workshop Schedule Cancelled",
                    $"Dear {booking.User.FullName},<br/><br/>The host has cancelled the upcoming schedule for '<b>{booking.WorkshopSchedule.Workshop.Title}</b>'.<br/><br/>A full refund of <b>Rs. {booking.TotalAmount}</b> has been processed and credited directly to your BookMyWorkshop Wallet.<br/><br/>We apologize for the inconvenience."
                );
                if (!string.IsNullOrEmpty(booking.User.Email))
                    await _emailService.SendEmailAsync(booking.User.Email, "Workshop Cancelled & Refunded", emailBody);
            }
            else
            {
                // Unpaid bookings just get cancelled
                booking.BookingStatus = BookingStatus.Cancelled;

                await _notificationService.CreateNotificationAsync(
                    booking.UserId,
                    "Workshop Cancelled",
                    $"The host has cancelled the schedule for '{booking.WorkshopSchedule.Workshop.Title}'. Your pending booking has been cancelled.",
                    NotificationType.Alert
                );

                var emailBody = EmailTemplates.GetNotificationEmail(
                    "Workshop Schedule Cancelled",
                    $"Dear {booking.User.FullName},<br/><br/>The host has cancelled the upcoming schedule for '<b>{booking.WorkshopSchedule.Workshop.Title}</b>'.<br/><br/>Your pending booking has been cancelled.<br/><br/>We apologize for the inconvenience."
                );
                if (!string.IsNullOrEmpty(booking.User.Email))
                    await _emailService.SendEmailAsync(booking.User.Email, "Workshop Cancelled", emailBody);
            }

            _bookingRepository.Update(booking);
        }

        if (bookings.Any())
        {
            await _bookingRepository.SaveChangesAsync();
        }

        return refundedCount;
    }

    private static bool CanReviewBooking(Booking booking) =>
        booking.WorkshopSchedule.Status == ScheduleStatus.Completed
        && booking.BookingStatus == BookingStatus.Confirmed
        && booking.AttendanceStatus == AttendanceStatus.CheckedIn
        && booking.Review == null;

    private static BookingAttendeeResponse MapAttendee(Booking booking) => new()
    {
        Id = booking.Id,
        GuestName = booking.User.FullName ?? "Unknown",
        GuestEmail = booking.User.Email,
        NumberOfSeats = booking.NumberOfSeats,
        ConfirmationCode = booking.ConfirmationCode,
        BookingStatus = booking.BookingStatus,
        PaymentStatus = booking.PaymentStatus,
        BookingDate = booking.BookingDate,
        AttendanceStatus = booking.AttendanceStatus,
        CheckedInAt = booking.CheckedInAt
    };

    private string GenerateConfirmationCode()
    {
        // Generate unique confirmation code: BMW-XXXXXXXX
        var timestamp = DateTime.UtcNow.Ticks.ToString();
        var randomPart = Guid.NewGuid().ToString("N").Substring(0, 8).ToUpper();
        return $"BMW-{randomPart}";
    }
}
