using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using API.DTOs.Requests;
using API.DTOs.Responses;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/payment")]
[Authorize]
public class PaymentController : ControllerBase
{
    private readonly IPaymentService _paymentService;
    private readonly IBookingService _bookingService;

    public PaymentController(IPaymentService paymentService, IBookingService bookingService)
    {
        _paymentService = paymentService;
        _bookingService = bookingService;
    }

    [HttpPost("initiate")]
    [Authorize(Roles = API.Enums.UserRoles.User)]
    public async Task<ActionResult<PaymentInitiateResponse>> InitiatePayment([FromBody] CreateBookingRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        try
        {
            var booking = await _bookingService.CreateBookingAsync(userId, request);
            var paymentParams = await _paymentService.InitiatePaymentAsync(booking.Id, booking.TotalAmount);
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

    [HttpPost("verify")]
    public async Task<IActionResult> VerifyPayment([FromBody] PaymentVerifyRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        if (string.IsNullOrEmpty(request.Data)) return BadRequest("No data");

        try
        {
            var json = Encoding.UTF8.GetString(Convert.FromBase64String(request.Data));
            var paymentData = JsonSerializer.Deserialize<Dictionary<string, object>>(json);
            
            if (paymentData == null) return BadRequest("Invalid data");

            // Extract
            var status = paymentData.ContainsKey("status") ? paymentData["status"].ToString() : "";
            var signature = paymentData.ContainsKey("signature") ? paymentData["signature"].ToString() : "";
            var transactionUuid = paymentData.ContainsKey("transaction_uuid") ? paymentData["transaction_uuid"].ToString() : "";
            var signedFieldNames = paymentData.ContainsKey("signed_field_names") ? paymentData["signed_field_names"].ToString() : "";

            if (status != "COMPLETE") return BadRequest("Status not COMPLETE");

            // Reconstruct
            var fields = (signedFieldNames ?? "").Split(',');
            var signingData = new StringBuilder();
            
            for (int i = 0; i < fields.Length; i++)
            {
                var field = fields[i];
                var value = paymentData.ContainsKey(field) ? paymentData[field].ToString() : "";
                signingData.Append($"{field}={value}");
                if (i < fields.Length - 1) signingData.Append(",");
            }

            var isValid = _paymentService.VerifySignature(signingData.ToString(), signature!);
            if (!isValid) return BadRequest("Invalid Signature");

            var parts = transactionUuid!.Split('-');
            if (parts.Length < 1 || !int.TryParse(parts[0], out int bookingId)) return BadRequest("Invalid UUID");

            var success = await _bookingService.ConfirmBookingPaymentAsync(bookingId, transactionUuid);
            if (!success) return BadRequest("Confirmation failed");

            // Fetch extra details for the frontend success page
            var booking = await _bookingService.GetBookingByIdAsync(bookingId, userId);

            return Ok(new 
            { 
                Message = "Verified", 
                BookingId = bookingId,
                WorkshopTitle = booking?.WorkshopTitle,
                WorkshopSlug = booking?.WorkshopSlug,
                StartDateTime = booking?.StartDateTime,
                CustomerName = booking?.UserName
            });
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
}
