using System.ComponentModel.DataAnnotations;

namespace API.DTOs.Requests;

public class GiftCardPurchaseRequest
{
    [Required]
    [EmailAddress]
    [MaxLength(256)]
    public string RecipientEmail { get; set; } = string.Empty;

    [Required]
    [Range(100, 100000, ErrorMessage = "Gift card amount must be between 100 and 100,000 NRP.")]
    public decimal Amount { get; set; }

    [MaxLength(500)]
    public string? PersonalMessage { get; set; }
}
