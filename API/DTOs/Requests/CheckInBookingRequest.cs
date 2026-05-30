using System.ComponentModel.DataAnnotations;

namespace API.DTOs.Requests;

public class CheckInBookingRequest
{
    [Required]
    public string ConfirmationCode { get; set; } = string.Empty;
}
