using System.ComponentModel.DataAnnotations;

namespace API.DTOs.Requests.Auth;

public class ProviderRegisterRequest
{
    [Required]
    public string BusinessName { get; set; } = string.Empty;

    [Required]
    public string ContactPerson { get; set; } = string.Empty; 

    [Required]
    public string PhoneNumber { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;

    [Required]
    [Compare("Password")]
    public string ConfirmPassword { get; set; } = string.Empty;
}
