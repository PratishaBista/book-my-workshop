using System.Threading.Tasks;
using API.DTOs.Requests;
using API.DTOs.Responses;

namespace API.Services;

public interface IPaymentService
{
    Task<PaymentInitiateResponse> InitiatePaymentAsync(int bookingId, decimal amount);
    bool VerifySignature(string data, string signature);
}
