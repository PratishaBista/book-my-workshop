using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.Entities;

public class Wallet
{
    [Key]
    public int Id { get; set; }

    /// <summary>
    /// Owner of this wallet (one wallet per user)
    /// </summary>
    [Required]
    public string UserId { get; set; } = string.Empty;

    [ForeignKey(nameof(UserId))]
    public ApplicationUser User { get; set; } = null!;

    /// <summary>
    /// Current available balance
    /// </summary>
    [Column(TypeName = "decimal(18,2)")]
    public decimal Balance { get; set; } = 0;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
