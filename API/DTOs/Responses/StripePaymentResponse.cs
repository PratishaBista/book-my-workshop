namespace API.DTOs.Responses;

public class StripePaymentResponse
{
    public string ClientSecret { get; set; } = string.Empty;
    public string PaymentIntentId { get; set; } = string.Empty;
    public string PublishableKey { get; set; } = string.Empty;
    public string TransactionUuid { get; set; } = string.Empty;
    public string Amount { get; set; } = string.Empty;
    public bool IsFullyPaid { get; set; } = false;
}
