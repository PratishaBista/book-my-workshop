using API.Entities;

namespace API.Services;

public interface IBookingTicketService
{
    string BuildTicketUrl(string confirmationCode);
    string BuildQrPayload(string confirmationCode);
    string GenerateQrCodeBase64(string payload);
    Task SendBookingConfirmationEmailAsync(Booking booking);
}
