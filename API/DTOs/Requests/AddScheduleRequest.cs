using System.ComponentModel.DataAnnotations;

namespace API.DTOs.Requests;

public class AddScheduleRequest
{
    [Required]
    public DateTime StartDateTime { get; set; }

    [Required]
    public DateTime EndDateTime { get; set; }

    [Required]
    [Range(1, 1000)]
    public int AvailableSeats { get; set; }
}
