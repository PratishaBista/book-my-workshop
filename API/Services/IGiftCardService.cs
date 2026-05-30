using System.Threading.Tasks;
using API.Entities;
using API.DTOs.Requests;
using API.DTOs.Responses;

namespace API.Services;

public interface IGiftCardService
{
    Task<GiftCard> PurchaseGiftCardAsync(string senderUserId, GiftCardPurchaseRequest request);
    Task<bool> ConfirmGiftCardPaymentAsync(int giftCardId, string transactionUuid);
    Task<GiftCard?> GetGiftCardByIdAsync(int id);
    Task<GiftCard?> GetGiftCardByCodeAsync(string code);
    Task<bool> ClaimGiftCardAsync(string claimedByUserId, string code);
    Task<WalletResponse> GetWalletAsync(string userId);
    Task<bool> DeductFromWalletAsync(string userId, int bookingId, decimal amount);
    Task<bool> RefundToWalletAsync(string userId, int bookingId, decimal amount);
}
