// giftcard controller handles purchasing and claiming digital gift cards
// gift cards can be purchased by users and claimed by recipients to add wallet balance
// all endpoints require authentication (authorize attribute at controller level)

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
[Authorize] // all gift card operations require logged-in user
public class GiftCardController : ControllerBase
{
    private readonly IGiftCardService _giftCardService;
    private readonly IPaymentService _paymentService;

    public GiftCardController(IGiftCardService giftCardService, IPaymentService paymentService)
    {
        _giftCardService = giftCardService;
        _paymentService = paymentService;
    }

    // initiates gift card purchase flow
    // creates a gift card record in pending state, returns payment parameters for frontend
    // buyer pays first, then gift card becomes active for claiming
    // POST: api/giftcard/purchase
    [HttpPost("purchase")]
    [Authorize(Roles = UserRoles.User)]  // only regular users (not providers/admins) can purchase gift cards
    public async Task<ActionResult<PaymentInitiateResponse>> PurchaseGiftCard([FromBody] GiftCardPurchaseRequest request)
    {
        // extract user id from jwt token claims
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        try
        {
            // create gift card record with pending status
            var giftCard = await _giftCardService.PurchaseGiftCardAsync(userId, request);

            // generate payment parameters (as of now esewa, stripe) for frontend to redirect
            var paymentParams = await _paymentService.InitiateGiftCardPaymentAsync(giftCard.Id, giftCard.Amount);
            return Ok(paymentParams);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "An unexpected error occurred: " + ex.Message });
        }
    }

    // claims a gift card using its unique code
    // adds the gift card amount to the claiming user's wallet balance
    // one-time use only (claimed status prevents double claiming)
    // POST: api/giftcard/claim
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

    // retrieves gift card details by its unique code
    // useful for checking balance/status before claiming
    // returns sender info, amount, and current status
    // GET: api/giftcard/code/{code}
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
            SenderName = giftCard.SenderUser?.FullName ?? "Someone", // fallback if user deleted
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
