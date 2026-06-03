// wallet controller manages user wallet functionality
// allows users to view their wallet balance and transaction history
// wallet balance can be used for booking payments and gift card purchases
// all endpoints require authentication

using System;
using System.Security.Claims;
using System.Threading.Tasks;
using API.DTOs.Responses;
using API.Services;
using API.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/wallet")]
[Authorize] // all wallet operations require authenticated user
public class WalletController : ControllerBase
{
    private readonly IGiftCardService _giftCardService;

    public WalletController(IGiftCardService giftCardService)
    {
        _giftCardService = giftCardService;
    }

    // retrieves current user's wallet information
    // includes balance, transaction history, and gift card claims
    // returns walletresponse dto with all wallet-related data
    // GET: api/wallet
    [HttpGet]
    [Authorize(Roles = UserRoles.User)] // only regular users have wallets (providers have separate wallet for payouts)
    public async Task<ActionResult<WalletResponse>> GetWallet()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        try
        {
            var wallet = await _giftCardService.GetWalletAsync(userId);
            return Ok(wallet);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "An unexpected error occurred: " + ex.Message });
        }
    }
}
