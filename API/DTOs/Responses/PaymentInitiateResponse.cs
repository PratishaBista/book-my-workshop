namespace API.DTOs.Responses;

public class PaymentInitiateResponse
{
    public string Amount { get; set; } = string.Empty;
    public string TaxAmount { get; set; } = "0";
    public string TotalAmount { get; set; } = string.Empty;
    public string TransactionUuid { get; set; } = string.Empty;
    public string ProductCode { get; set; } = string.Empty;
    public string ProductServiceCharge { get; set; } = "0";
    public string ProductDeliveryCharge { get; set; } = "0";
    public string SuccessUrl { get; set; } = string.Empty;
    public string FailureUrl { get; set; } = string.Empty;
    public string SignedFieldNames { get; set; } = string.Empty;
    public string Signature { get; set; } = string.Empty;
    public string EsewaUrl { get; set; } = string.Empty;
    public bool IsFullyPaid { get; set; } = false;
}
