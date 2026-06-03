// payment controller handles all payment-related operations
// supports multiple payment gateways: esewa (local) and stripe (international)
// handles booking payments and gift card purchases
// all endpoints require authentication except webhook endpoints

using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using API.DTOs.Requests;
using API.DTOs.Responses;
using API.Services;
using API.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/payment")]
[Authorize] // all payment endpoints require authenticated user
public class PaymentController : ControllerBase
{
    private readonly IPaymentService _paymentService; // handles esewa payments
    private readonly IBookingService _bookingService;
    private readonly IGiftCardService _giftCardService;
    private readonly StripePaymentService _stripePaymentService; // handles stripe payments

    public PaymentController(
        IPaymentService paymentService,
        IBookingService bookingService,
        IGiftCardService giftCardService,
        StripePaymentService stripePaymentService)
    {
        _paymentService = paymentService;
        _bookingService = bookingService;
        _giftCardService = giftCardService;
        _stripePaymentService = stripePaymentService;
    }


    // initiates payment for a workshop booking using local gateway (esewa)
    // creates or retrieves booking, calculates remaining amount after wallet deduction
    // returns payment parameters for frontend to redirect to payment gateway
    // POST: api/payment/initiate
    [HttpPost("initiate")]
    [Authorize(Roles = API.Enums.UserRoles.User)]
    public async Task<ActionResult<PaymentInitiateResponse>> InitiatePayment([FromBody] CreateBookingRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        try
        {
            // get existing booking or create new one in pending state
            var booking = await _bookingService.GetOrCreateBookingForPaymentAsync(userId, request);

            // if already paid, return wallet payment marker
            if (booking.PaymentStatus == PaymentStatus.Paid)
            {
                return Ok(new PaymentInitiateResponse
                {
                    IsFullyPaid = true,
                    TotalAmount = "0",
                    TransactionUuid = $"wallet-{booking.Id}",
                    ProductCode = "WALLET"
                });
            }

            var remainingAmount = booking.TotalAmount - booking.WalletAmountUsed;
            var paymentParams = await _paymentService.InitiatePaymentAsync(booking.Id, remainingAmount);
            return Ok(paymentParams);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "An unexpected error occurred: " + ex.Message });
        }
    }

    // initiates stripe payment for workshop booking
    // returns client secret for stripe elements frontend integration
    // POST: api/payment/initiate/stripe
    [HttpPost("initiate/stripe")]
    [Authorize(Roles = API.Enums.UserRoles.User)]
    public async Task<ActionResult<StripePaymentResponse>> InitiateStripePayment([FromBody] CreateBookingRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        try
        {
            var booking = await _bookingService.GetOrCreateBookingForPaymentAsync(userId, request);

            if (booking.PaymentStatus == PaymentStatus.Paid)
            {
                return Ok(new StripePaymentResponse
                {
                    IsFullyPaid = true,
                    TransactionUuid = $"wallet-{booking.Id}",
                    Amount = "0"
                });
            }

            var remainingAmount = booking.TotalAmount - booking.WalletAmountUsed;
            var stripeResponse = await _stripePaymentService.InitiateBookingPaymentAsync(booking.Id, remainingAmount);
            return Ok(stripeResponse);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "An unexpected error occurred: " + ex.Message });
        }
    }

    // initiates stripe payment for gift card purchase
    // separate endpoint because gift cards have different flow than bookings
    // POST: api/payment/initiate/stripe/giftcard
    [HttpPost("initiate/stripe/giftcard")]
    [Authorize(Roles = API.Enums.UserRoles.User)]
    public async Task<ActionResult<StripePaymentResponse>> InitiateStripeGiftCardPayment([FromBody] GiftCardPurchaseRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        try
        {
            var giftCard = await _giftCardService.PurchaseGiftCardAsync(userId, request);
            var stripeResponse = await _stripePaymentService.InitiateGiftCardPaymentAsync(giftCard.Id, request.Amount);
            return Ok(stripeResponse);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "An unexpected error occurred: " + ex.Message });
        }
    }


    // verifies stripe payment after customer completes checkout
    // checks paymentintent status and updates booking/giftcard accordingly
    // POST: api/payment/verify/stripe
    [HttpPost("verify/stripe")]
    public async Task<IActionResult> VerifyStripePayment([FromBody] StripeVerifyRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        if (string.IsNullOrEmpty(request.PaymentIntentId))
            return BadRequest("No paymentIntentId provided.");

        try
        {
            var (isSucceeded, transactionUuid) = await _stripePaymentService.VerifyPaymentIntentAsync(request.PaymentIntentId);

            if (!isSucceeded)
                return BadRequest("Payment not yet succeeded.");

            if (transactionUuid == null)
                return BadRequest("Could not determine transaction type from PaymentIntent metadata.");

            // parse transaction uuid to determine if this is giftcard or booking
            // format: "giftcard-123" or "booking-456"
            var parts = transactionUuid.Split('-');

            if (parts[0] == "giftcard")
            {
                if (parts.Length < 2 || !int.TryParse(parts[1], out int giftCardId))
                    return BadRequest("Invalid Gift Card transaction.");

                var success = await _giftCardService.ConfirmGiftCardPaymentAsync(giftCardId, request.PaymentIntentId);
                if (!success) return BadRequest("Gift card confirmation failed.");

                var giftCard = await _giftCardService.GetGiftCardByIdAsync(giftCardId);
                return Ok(new
                {
                    Message = "Verified",
                    Type = "GiftCard",
                    GiftCardId = giftCardId,
                    Amount = giftCard?.Amount,
                    RecipientEmail = giftCard?.RecipientEmail,
                    Code = giftCard?.Code, // unique code for recipient to claim
                    PersonalMessage = giftCard?.PersonalMessage
                });
            }
            else if (parts[0] == "booking")
            {
                if (parts.Length < 2 || !int.TryParse(parts[1], out int bookingId))
                    return BadRequest("Invalid Booking transaction.");

                var success = await _bookingService.ConfirmBookingPaymentAsync(bookingId, request.PaymentIntentId);
                if (!success) return BadRequest("Booking confirmation failed.");

                var booking = await _bookingService.GetBookingByIdAsync(bookingId, userId);
                return Ok(new
                {
                    Message = "Verified",
                    Type = "Booking",
                    BookingId = bookingId,
                    ConfirmationCode = booking?.ConfirmationCode,
                    WorkshopTitle = booking?.WorkshopTitle,
                    WorkshopSlug = booking?.WorkshopSlug,
                    StartDateTime = booking?.StartDateTime,
                    CustomerName = booking?.UserName,
                    NumberOfSeats = booking?.NumberOfSeats
                });
            }

            return BadRequest("Unknown transaction type.");
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }


    // verifies local gateway payment (esewa) after redirect
    // decodes base64 data, validates signature, updates booking/giftcard
    // POST: api/payment/verify
    [HttpPost("verify")]
    public async Task<IActionResult> VerifyPayment([FromBody] PaymentVerifyRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        if (string.IsNullOrEmpty(request.Data)) return BadRequest("No data");

        try
        {
            // decode base64 encoded payment response from gateway
            var json = Encoding.UTF8.GetString(Convert.FromBase64String(request.Data));
            var paymentData = JsonSerializer.Deserialize<Dictionary<string, object>>(json);

            if (paymentData == null) return BadRequest("Invalid data");

            // extract required fields for signature verification
            var status = paymentData.ContainsKey("status") ? paymentData["status"].ToString() : "";
            var signature = paymentData.ContainsKey("signature") ? paymentData["signature"].ToString() : "";
            var transactionUuid = paymentData.ContainsKey("transaction_uuid") ? paymentData["transaction_uuid"].ToString() : "";
            var signedFieldNames = paymentData.ContainsKey("signed_field_names") ? paymentData["signed_field_names"].ToString() : "";

            // only process completed transactions
            if (status != "COMPLETE") return BadRequest("Status not COMPLETE");

            // reconstruct signature data string exactly as gateway generated it
            var fields = (signedFieldNames ?? "").Split(',');
            var signingData = new StringBuilder();

            for (int i = 0; i < fields.Length; i++)
            {
                var field = fields[i];
                var value = paymentData.ContainsKey(field) ? paymentData[field].ToString() : "";
                signingData.Append($"{field}={value}");
                if (i < fields.Length - 1) signingData.Append(",");
            }

            // verify signature to prevent tampering
            var isValid = _paymentService.VerifySignature(signingData.ToString(), signature!);
            if (!isValid) return BadRequest("Invalid Signature");

            var parts = transactionUuid!.Split('-');
            if (parts.Length < 1) return BadRequest("Invalid UUID");

            // determine transaction type from uuid prefix
            if (parts[0] == "giftcard")
            {
                if (parts.Length < 2 || !int.TryParse(parts[1], out int giftCardId)) return BadRequest("Invalid Gift Card UUID");

                var success = await _giftCardService.ConfirmGiftCardPaymentAsync(giftCardId, transactionUuid);
                if (!success) return BadRequest("Confirmation failed");

                var giftCard = await _giftCardService.GetGiftCardByIdAsync(giftCardId);

                return Ok(new
                {
                    Message = "Verified",
                    Type = "GiftCard",
                    GiftCardId = giftCardId,
                    Amount = giftCard?.Amount,
                    RecipientEmail = giftCard?.RecipientEmail,
                    Code = giftCard?.Code,
                    PersonalMessage = giftCard?.PersonalMessage
                });
            }
            else
            {
                // for booking, parts[0] is the booking id directly (no prefix in old format)
                if (!int.TryParse(parts[0], out int bookingId)) return BadRequest("Invalid Booking UUID");

                var success = await _bookingService.ConfirmBookingPaymentAsync(bookingId, transactionUuid);
                if (!success) return BadRequest("Confirmation failed");

                // Fetch extra details for the frontend success page
                var booking = await _bookingService.GetBookingByIdAsync(bookingId, userId);

                return Ok(new
                {
                    Message = "Verified",
                    Type = "Booking",
                    BookingId = bookingId,
                    ConfirmationCode = booking?.ConfirmationCode,
                    WorkshopTitle = booking?.WorkshopTitle,
                    WorkshopSlug = booking?.WorkshopSlug,
                    StartDateTime = booking?.StartDateTime,
                    CustomerName = booking?.UserName,
                    NumberOfSeats = booking?.NumberOfSeats
                });
            }
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
}