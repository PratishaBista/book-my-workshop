using System.ComponentModel.DataAnnotations;

namespace API.DTOs.Requests;

public class GiftCardClaimRequest
{
    [Required]
    [MaxLength(50)]
    public string Code { get; set; } = string.Empty;
}
