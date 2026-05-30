using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using API.Enums;

namespace API.Entities;

public class WalletTransaction
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int WalletId { get; set; }

    [ForeignKey(nameof(WalletId))]
    public Wallet Wallet { get; set; } = null!;

    public WalletTransactionType Type { get; set; }

    /// <summary>
    /// Positive = credit, Negative = debit
    /// </summary>
    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    /// <summary>
    /// Wallet balance after this transaction
    /// </summary>
    [Column(TypeName = "decimal(18,2)")]
    public decimal BalanceAfter { get; set; }

    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Optional reference to related gift card
    /// </summary>
    public int? GiftCardId { get; set; }

    [ForeignKey(nameof(GiftCardId))]
    public GiftCard? GiftCard { get; set; }

    /// <summary>
    /// Optional reference to related booking
    /// </summary>
    public int? BookingId { get; set; }

    [ForeignKey(nameof(BookingId))]
    public Booking? Booking { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
