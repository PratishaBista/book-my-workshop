using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Threading.Tasks;
using API.Data;
using API.DTOs.Requests;
using API.DTOs.Responses;
using API.Entities;
using API.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace API.Services;

public class GiftCardService : IGiftCardService
{
    private readonly ApplicationDbContext _dbContext;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _configuration;

    public GiftCardService(
        ApplicationDbContext dbContext,
        IEmailService emailService,
        IConfiguration configuration)
    {
        _dbContext = dbContext;
        _emailService = emailService;
        _configuration = configuration;
    }

    public async Task<GiftCard> PurchaseGiftCardAsync(string senderUserId, GiftCardPurchaseRequest request)
    {
        // 1. Generate unique code
        string code;
        bool exists;
        do
        {
            code = GenerateGiftCardCode();
            exists = await _dbContext.GiftCards.AnyAsync(g => g.Code == code);
        } while (exists);

        // 2. Create the GiftCard entity in Pending state
        var giftCard = new GiftCard
        {
            Code = code,
            Amount = request.Amount,
            SenderUserId = senderUserId,
            RecipientEmail = request.RecipientEmail.Trim().ToLower(),
            PersonalMessage = request.PersonalMessage,
            Status = GiftCardStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.GiftCards.Add(giftCard);
        await _dbContext.SaveChangesAsync();

        return giftCard;
    }

    public async Task<bool> ConfirmGiftCardPaymentAsync(int giftCardId, string transactionUuid)
    {
        var giftCard = await _dbContext.GiftCards
            .Include(g => g.SenderUser)
            .FirstOrDefaultAsync(g => g.Id == giftCardId);

        if (giftCard == null || giftCard.Status != GiftCardStatus.Pending)
        {
            return false;
        }

        giftCard.Status = GiftCardStatus.Active;
        giftCard.PaidAt = DateTime.UtcNow;
        giftCard.TransactionId = transactionUuid;

        await _dbContext.SaveChangesAsync();

        // Send email to recipient
        try
        {
            var senderName = giftCard.SenderUser?.FullName ?? "Someone";
            var clientUrl = _configuration["Esewa:SuccessUrl"]?.Replace("/payment/success", "") ?? "http://localhost:4000";
            var claimLink = $"{clientUrl}/gift-card/claim?code={giftCard.Code}";
            var emailBody = EmailTemplates.GetGiftCardEmail(
                senderName,
                giftCard.RecipientEmail,
                giftCard.Amount,
                giftCard.Code,
                claimLink,
                giftCard.PersonalMessage);

            await _emailService.SendEmailAsync(
                giftCard.RecipientEmail,
                $"You've received a Rs. {giftCard.Amount:N0} Gift Card from {senderName}!",
                emailBody);
        }
        catch (Exception)
        {
            // Log or ignore email failures to not break the transaction verification
        }

        return true;
    }

    public async Task<GiftCard?> GetGiftCardByIdAsync(int id)
    {
        return await _dbContext.GiftCards
            .Include(g => g.SenderUser)
            .FirstOrDefaultAsync(g => g.Id == id);
    }

    public async Task<GiftCard?> GetGiftCardByCodeAsync(string code)
    {
        return await _dbContext.GiftCards
            .Include(g => g.SenderUser)
            .FirstOrDefaultAsync(g => g.Code == code.Trim().ToUpper());
    }

    public async Task<bool> ClaimGiftCardAsync(string claimedByUserId, string code)
    {
        var giftCard = await _dbContext.GiftCards
            .FirstOrDefaultAsync(g => g.Code == code.Trim().ToUpper());

        if (giftCard == null || giftCard.Status != GiftCardStatus.Active)
        {
            return false;
        }

        // Find or create wallet for claiming user
        var wallet = await _dbContext.Wallets.FirstOrDefaultAsync(w => w.UserId == claimedByUserId);
        if (wallet == null)
        {
            wallet = new Wallet
            {
                UserId = claimedByUserId,
                Balance = 0,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _dbContext.Wallets.Add(wallet);
            await _dbContext.SaveChangesAsync(); // save to get wallet.Id
        }

        // Process claim
        giftCard.Status = GiftCardStatus.Claimed;
        giftCard.ClaimedByUserId = claimedByUserId;
        giftCard.ClaimedAt = DateTime.UtcNow;

        wallet.Balance += giftCard.Amount;
        wallet.UpdatedAt = DateTime.UtcNow;

        var transaction = new WalletTransaction
        {
            WalletId = wallet.Id,
            Type = WalletTransactionType.GiftCardClaim,
            Amount = giftCard.Amount,
            BalanceAfter = wallet.Balance,
            Description = $"Claimed gift card {giftCard.Code} purchased by {giftCard.RecipientEmail}",
            GiftCardId = giftCard.Id,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.WalletTransactions.Add(transaction);
        await _dbContext.SaveChangesAsync();

        return true;
    }

    public async Task<WalletResponse> GetWalletAsync(string userId)
    {
        var wallet = await _dbContext.Wallets.FirstOrDefaultAsync(w => w.UserId == userId);
        if (wallet == null)
        {
            return new WalletResponse { Balance = 0, Transactions = new() };
        }

        var transactions = await _dbContext.WalletTransactions
            .Where(t => t.WalletId == wallet.Id)
            .Include(t => t.GiftCard)
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new WalletTransactionDto
            {
                Id = t.Id,
                Type = t.Type,
                Amount = t.Amount,
                BalanceAfter = t.BalanceAfter,
                Description = t.Description,
                CreatedAt = t.CreatedAt,
                GiftCardId = t.GiftCardId,
                GiftCardCode = t.GiftCard != null ? t.GiftCard.Code : null,
                BookingId = t.BookingId
            })
            .ToListAsync();

        return new WalletResponse
        {
            Balance = wallet.Balance,
            Transactions = transactions
        };
    }

    public async Task<bool> DeductFromWalletAsync(string userId, int bookingId, decimal amount)
    {
        var wallet = await _dbContext.Wallets.FirstOrDefaultAsync(w => w.UserId == userId);
        if (wallet == null || wallet.Balance < amount)
        {
            return false;
        }

        wallet.Balance -= amount;
        wallet.UpdatedAt = DateTime.UtcNow;

        var transaction = new WalletTransaction
        {
            WalletId = wallet.Id,
            Type = WalletTransactionType.BookingPayment,
            Amount = -amount,
            BalanceAfter = wallet.Balance,
            Description = $"Paid for Booking #{bookingId}",
            BookingId = bookingId,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.WalletTransactions.Add(transaction);
        await _dbContext.SaveChangesAsync();

        return true;
    }

    public async Task<bool> RefundToWalletAsync(string userId, int bookingId, decimal amount)
    {
        var wallet = await _dbContext.Wallets.FirstOrDefaultAsync(w => w.UserId == userId);
        if (wallet == null)
        {
            wallet = new Wallet
            {
                UserId = userId,
                Balance = 0,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _dbContext.Wallets.Add(wallet);
            await _dbContext.SaveChangesAsync();
        }

        wallet.Balance += amount;
        wallet.UpdatedAt = DateTime.UtcNow;

        var transaction = new WalletTransaction
        {
            WalletId = wallet.Id,
            Type = WalletTransactionType.BookingRefund,
            Amount = amount,
            BalanceAfter = wallet.Balance,
            Description = $"Refund for Booking #{bookingId}",
            BookingId = bookingId,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.WalletTransactions.Add(transaction);
        await _dbContext.SaveChangesAsync();

        return true;
    }

    private string GenerateGiftCardCode()
    {
        // Generates "GC-XXXX-XXXX-XXXX" where each block has 4 random alphanumeric characters
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        var random = new Random();
        
        string GetBlock() => new string(Enumerable.Repeat(chars, 4)
            .Select(s => s[random.Next(s.Length)]).ToArray());

        return $"GC-{GetBlock()}-{GetBlock()}-{GetBlock()}";
    }
}
