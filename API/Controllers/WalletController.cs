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
[Authorize]
public class WalletController : ControllerBase
{
    private readonly IGiftCardService _giftCardService;

    public WalletController(IGiftCardService giftCardService)
    {
        _giftCardService = giftCardService;
    }

    [HttpGet]
    [Authorize(Roles = UserRoles.User)]
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
