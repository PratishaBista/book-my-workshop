using System;
using System.Security.Claims;
using System.Threading.Tasks;
using API.DTOs.Requests;
using API.DTOs.Responses;
using API.Services;
using API.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/giftcard")]
[Authorize]
public class GiftCardController : ControllerBase
{
    private readonly IGiftCardService _giftCardService;
    private readonly IPaymentService _paymentService;

    public GiftCardController(IGiftCardService giftCardService, IPaymentService paymentService)
    {
        _giftCardService = giftCardService;
        _paymentService = paymentService;
    }

    [HttpPost("purchase")]
    [Authorize(Roles = UserRoles.User)]
    public async Task<ActionResult<PaymentInitiateResponse>> PurchaseGiftCard([FromBody] GiftCardPurchaseRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        try
        {
            var giftCard = await _giftCardService.PurchaseGiftCardAsync(userId, request);
            var paymentParams = await _paymentService.InitiateGiftCardPaymentAsync(giftCard.Id, giftCard.Amount);
            return Ok(paymentParams);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "An unexpected error occurred: " + ex.Message });
        }
    }

    [HttpPost("claim")]
    [Authorize(Roles = UserRoles.User)]
    public async Task<IActionResult> ClaimGiftCard([FromBody] GiftCardClaimRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        try
        {
            var success = await _giftCardService.ClaimGiftCardAsync(userId, request.Code);
            if (!success)
            {
                return BadRequest(new { Message = "Failed to claim gift card. Make sure the code is correct and the gift card is active/not already claimed." });
            }

            return Ok(new { Message = "Gift card claimed successfully! Balance added to your wallet." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "An unexpected error occurred: " + ex.Message });
        }
    }

    [HttpGet("code/{code}")]
    [Authorize(Roles = UserRoles.User)]
    public async Task<ActionResult<GiftCardResponse>> GetGiftCardByCode(string code)
    {
        var giftCard = await _giftCardService.GetGiftCardByCodeAsync(code);
        if (giftCard == null)
        {
            return NotFound(new { Message = "Gift card not found." });
        }

        var response = new GiftCardResponse
        {
            Id = giftCard.Id,
            Code = giftCard.Code,
            Amount = giftCard.Amount,
            SenderUserId = giftCard.SenderUserId,
            SenderName = giftCard.SenderUser?.FullName ?? "Someone",
            RecipientEmail = giftCard.RecipientEmail,
            PersonalMessage = giftCard.PersonalMessage,
            ClaimedByUserId = giftCard.ClaimedByUserId,
            Status = giftCard.Status,
            CreatedAt = giftCard.CreatedAt,
            PaidAt = giftCard.PaidAt,
            ClaimedAt = giftCard.ClaimedAt
        };

        return Ok(response);
    }
}
