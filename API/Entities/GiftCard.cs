using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using API.Enums;

namespace API.Entities;

public class GiftCard
{
    [Key]
    public int Id { get; set; }

    /// <summary>
    /// Unique redeemable code (e.g. "GC-XXXX-XXXX-XXXX")
    /// </summary>
    [Required]
    [MaxLength(50)]
    public string Code { get; set; } = string.Empty;

    /// <summary>
    /// Gift card denomination
    /// </summary>
    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    /// <summary>
    /// User who purchased the gift card
    /// </summary>
    [Required]
    public string SenderUserId { get; set; } = string.Empty;

    [ForeignKey(nameof(SenderUserId))]
    public ApplicationUser SenderUser { get; set; } = null!;

    /// <summary>
    /// Email of the intended recipient
    /// </summary>
    [Required]
    [MaxLength(256)]
    public string RecipientEmail { get; set; } = string.Empty;

    /// <summary>
    /// Optional personal message from the sender
    /// </summary>
    [MaxLength(500)]
    public string? PersonalMessage { get; set; }

    /// <summary>
    /// User who claimed the gift card (set after claim)
    /// </summary>
    public string? ClaimedByUserId { get; set; }

    [ForeignKey(nameof(ClaimedByUserId))]
    public ApplicationUser? ClaimedByUser { get; set; }

    public GiftCardStatus Status { get; set; } = GiftCardStatus.Pending;

    /// <summary>
    /// eSewa transaction ID for the purchase
    /// </summary>
    [MaxLength(200)]
    public string? TransactionId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? PaidAt { get; set; }
    public DateTime? ClaimedAt { get; set; }
}
