using System;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using API.DTOs.Responses;
using Microsoft.Extensions.Configuration;

namespace API.Services;

public class EsewaPaymentService : IPaymentService
{
    private readonly IConfiguration _configuration;

    public EsewaPaymentService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public Task<PaymentInitiateResponse> InitiatePaymentAsync(int bookingId, decimal amount)
    {
        // Get Config
        var baseUrl = _configuration["Esewa:BaseUrl"];
        var productCode = _configuration["Esewa:ProductCode"];
        var secretKey = _configuration["Esewa:SecretKey"];
        var successUrl = _configuration["Esewa:SuccessUrl"];
        var failureUrl = _configuration["Esewa:FailureUrl"];

        // Prepare Data
        var totalAmount = amount; 
        var transactionUuid = $"{bookingId}-{DateTime.UtcNow.Ticks}"; 
        
        var taxAmount = "0";
        var serviceCharge = "0";
        var deliveryCharge = "0";

        // Generate Signature
        // Format: total_amount=100,transaction_uuid=11-200,product_code=EPAYTEST
        var signatureData = $"total_amount={totalAmount},transaction_uuid={transactionUuid},product_code={productCode}";
        var signature = GenerateSignature(signatureData, secretKey!);

        return Task.FromResult(new PaymentInitiateResponse
        {
            Amount = amount.ToString(),
            TotalAmount = totalAmount.ToString(),
            TaxAmount = taxAmount,
            ProductServiceCharge = serviceCharge,
            ProductDeliveryCharge = deliveryCharge,
            TransactionUuid = transactionUuid,
            ProductCode = productCode!,
            SuccessUrl = successUrl!,
            FailureUrl = failureUrl!,
            SignedFieldNames = "total_amount,transaction_uuid,product_code",
            Signature = signature,
            EsewaUrl = baseUrl!
        });
    }

    public bool VerifySignature(string data, string signature)
    {
        var secretKey = _configuration["Esewa:SecretKey"];
        var calculatedSignature = GenerateSignature(data, secretKey!);
        return calculatedSignature == signature;
    }

    private string GenerateSignature(string data, string secretKey)
    {
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secretKey));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
        return Convert.ToBase64String(hash);
    }
}
