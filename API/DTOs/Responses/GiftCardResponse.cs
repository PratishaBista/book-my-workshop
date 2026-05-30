using System;
using API.Enums;

namespace API.DTOs.Responses;

public class GiftCardResponse
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string SenderUserId { get; set; } = string.Empty;
    public string SenderName { get; set; } = string.Empty;
    public string RecipientEmail { get; set; } = string.Empty;
    public string? PersonalMessage { get; set; }
    public string? ClaimedByUserId { get; set; }
    public GiftCardStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? PaidAt { get; set; }
    public DateTime? ClaimedAt { get; set; }
}
