using System;
using System.Threading.Tasks;
using API.DTOs.Responses;
using Microsoft.Extensions.Configuration;
using Stripe;

namespace API.Services;

public class StripePaymentService
{
    private readonly IConfiguration _configuration;

    public StripePaymentService(IConfiguration configuration)
    {
        _configuration = configuration;
        StripeConfiguration.ApiKey = _configuration["Stripe:SecretKey"];
    }

    /// <summary>
    /// Creates a Stripe PaymentIntent for a workshop booking and returns the client secret.
    /// </summary>
    public async Task<StripePaymentResponse> InitiateBookingPaymentAsync(int bookingId, decimal amount)
    {
        var metadata = new System.Collections.Generic.Dictionary<string, string>
        {
            { "type", "booking" },
            { "bookingId", bookingId.ToString() }
        };

        return await CreatePaymentIntentAsync(amount, metadata, $"booking-{bookingId}");
    }

    /// <summary>
    /// Creates a Stripe PaymentIntent for a gift card purchase and returns the client secret.
    /// </summary>
    public async Task<StripePaymentResponse> InitiateGiftCardPaymentAsync(int giftCardId, decimal amount)
    {
        var metadata = new System.Collections.Generic.Dictionary<string, string>
        {
            { "type", "giftcard" },
            { "giftCardId", giftCardId.ToString() }
        };

        return await CreatePaymentIntentAsync(amount, metadata, $"giftcard-{giftCardId}");
    }

    private async Task<StripePaymentResponse> CreatePaymentIntentAsync(
        decimal amount,
        System.Collections.Generic.Dictionary<string, string> metadata,
        string transactionUuid)
    {
        var secretKey = _configuration["Stripe:SecretKey"];
        var publishableKey = _configuration["Stripe:PublishableKey"];

        if (string.IsNullOrWhiteSpace(secretKey) || string.IsNullOrWhiteSpace(publishableKey))
        {
            throw new InvalidOperationException(
                "Stripe is not configured. Add Stripe:SecretKey and Stripe:PublishableKey to API settings (use test keys from dashboard.stripe.com).");
        }

        if (amount <= 0)
        {
            throw new InvalidOperationException("Payment amount must be greater than zero.");
        }

        var currency = (_configuration["Stripe:Currency"] ?? "npr").Trim().ToLowerInvariant();

        var options = new PaymentIntentCreateOptions
        {
            // Smallest currency unit (paisa for NPR)
            Amount = (long)Math.Round(amount * 100, MidpointRounding.AwayFromZero),
            Currency = currency,
            Metadata = metadata,
            AutomaticPaymentMethods = new PaymentIntentAutomaticPaymentMethodsOptions
            {
                Enabled = true,
            },
        };

        try
        {
            var service = new PaymentIntentService();
            var intent = await service.CreateAsync(options);

            if (string.IsNullOrEmpty(intent.ClientSecret))
            {
                throw new InvalidOperationException("Stripe did not return a client secret for this payment.");
            }

            return new StripePaymentResponse
            {
                ClientSecret = intent.ClientSecret,
                PaymentIntentId = intent.Id,
                PublishableKey = publishableKey,
                TransactionUuid = transactionUuid,
                Amount = amount.ToString()
            };
        }
        catch (StripeException ex)
        {
            throw new InvalidOperationException(
                $"Stripe could not start payment: {ex.StripeError?.Message ?? ex.Message}. " +
                "If you see a currency error, ensure NPR is enabled on your Stripe account or set Stripe:Currency to usd in appsettings.");
        }
    }

    /// <summary>
    /// Retrieves a PaymentIntent and confirms whether it has been successfully paid.
    /// </summary>
    public async Task<(bool IsSucceeded, string? TransactionUuid)> VerifyPaymentIntentAsync(string paymentIntentId)
    {
        StripeConfiguration.ApiKey = _configuration["Stripe:SecretKey"];
        var service = new PaymentIntentService();
        var intent = await service.GetAsync(paymentIntentId);

        if (intent.Status != "succeeded")
            return (false, null);

        // Reconstruct transactionUuid from metadata
        string? transactionUuid = null;
        if (intent.Metadata.TryGetValue("type", out var type))
        {
            if (type == "booking" && intent.Metadata.TryGetValue("bookingId", out var bookingId))
                transactionUuid = $"booking-{bookingId}";
            else if (type == "giftcard" && intent.Metadata.TryGetValue("giftCardId", out var giftCardId))
                transactionUuid = $"giftcard-{giftCardId}";
        }

        return (true, transactionUuid);
    }
}
