namespace API.DTOs.Requests;

public class StripeVerifyRequest
{
    public string PaymentIntentId { get; set; } = string.Empty;
}
