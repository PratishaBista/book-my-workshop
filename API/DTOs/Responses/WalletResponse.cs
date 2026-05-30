using System;
using System.Collections.Generic;
using API.Enums;

namespace API.DTOs.Responses;

public class WalletResponse
{
    public decimal Balance { get; set; }
    public List<WalletTransactionDto> Transactions { get; set; } = new();
}

public class WalletTransactionDto
{
    public int Id { get; set; }
    public WalletTransactionType Type { get; set; }
    public decimal Amount { get; set; }
    public decimal BalanceAfter { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public int? GiftCardId { get; set; }
    public string? GiftCardCode { get; set; }
    public int? BookingId { get; set; }
}
