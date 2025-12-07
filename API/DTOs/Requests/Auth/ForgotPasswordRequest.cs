using System.ComponentModel.DataAnnotations;

namespace API.DTOs.Requests.Auth;

public class ForgotPasswordRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
}
