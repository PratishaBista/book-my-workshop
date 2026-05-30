using System.ComponentModel.DataAnnotations;

namespace API.DTOs.Requests;

public class CreateBookingRequest
{
    [Required]
    public int WorkshopScheduleId { get; set; }

    [Required]
    [Range(1, 100)]
    public int NumberOfSeats { get; set; } = 1;

    public bool UseWallet { get; set; } = false;
}
