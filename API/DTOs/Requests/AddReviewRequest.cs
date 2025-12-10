using System.ComponentModel.DataAnnotations;

namespace API.DTOs.Requests;

public class AddReviewRequest
{
    [Required]
    public int BookingId { get; set; }

    [Required]
    [Range(1, 5)]
    public int Rating { get; set; }

    [Required]
    [MaxLength(2000)]
    public string Comment { get; set; } = string.Empty;
}
