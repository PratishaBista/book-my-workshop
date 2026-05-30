using System.Globalization;
using API.Entities;
using API.Enums;
using Microsoft.EntityFrameworkCore;
using QRCoder;
using API.Data;

namespace API.Services;

public class BookingTicketService : IBookingTicketService
{
    private readonly IEmailService _emailService;
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly ILogger<BookingTicketService> _logger;

    public BookingTicketService(
        IEmailService emailService,
        ApplicationDbContext context,
        IConfiguration configuration,
        ILogger<BookingTicketService> logger)
    {
        _emailService = emailService;
        _context = context;
        _configuration = configuration;
        _logger = logger;
    }

    public string BuildTicketUrl(string confirmationCode) =>
        $"{GetFrontendBaseUrl()}/ticket/{Uri.EscapeDataString(confirmationCode)}";

    public string BuildQrPayload(string confirmationCode) => BuildTicketUrl(confirmationCode);

    public string GenerateQrCodeBase64(string payload)
    {
        using var generator = new QRCodeGenerator();
        using var data = generator.CreateQrCode(payload, QRCodeGenerator.ECCLevel.Q);
        var qr = new PngByteQRCode(data);
        var bytes = qr.GetGraphic(8);
        return Convert.ToBase64String(bytes);
    }

    public async Task SendBookingConfirmationEmailAsync(Booking booking)
    {
        var details = await _context.Bookings
            .AsNoTracking()
            .Include(b => b.User)
            .Include(b => b.WorkshopSchedule)
                .ThenInclude(s => s.Workshop)
            .FirstOrDefaultAsync(b => b.Id == booking.Id);

        if (details?.User?.Email == null)
        {
            _logger.LogWarning("Cannot send ticket email: booking {BookingId} has no user email", booking.Id);
            return;
        }

        var workshop = details.WorkshopSchedule.Workshop;
        var startLocal = details.WorkshopSchedule.StartDateTime.ToLocalTime();
        var qrPayload = BuildQrPayload(details.ConfirmationCode);
        var qrBase64 = GenerateQrCodeBase64(qrPayload);
        var ticketUrl = BuildTicketUrl(details.ConfirmationCode);

        var body = EmailTemplates.GetBookingConfirmationEmail(
            guestName: details.User.FullName ?? "Maker",
            workshopTitle: workshop.Title,
            sessionDate: startLocal.ToString("dddd, MMMM d, yyyy", CultureInfo.InvariantCulture),
            sessionTime: $"{startLocal:h:mm tt} – {details.WorkshopSchedule.EndDateTime.ToLocalTime():h:mm tt}",
            venue: workshop.LocationAddress,
            locationName: workshop.LocationName,
            seatCount: details.NumberOfSeats,
            confirmationCode: details.ConfirmationCode,
            ticketUrl: ticketUrl,
            qrCodeBase64: qrBase64);

        await _emailService.SendEmailAsync(
            details.User.Email,
            $"You're in! Your ticket for {workshop.Title}",
            body);

        _logger.LogInformation("Booking confirmation email sent for {Code}", details.ConfirmationCode);
    }

    private string GetFrontendBaseUrl()
    {
        var url = _configuration["FrontendUrl"] ?? "http://localhost:5173";
        return url.TrimEnd('/');
    }
}
