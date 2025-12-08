using System.ComponentModel.DataAnnotations;

namespace API.DTOs.Requests.Auth;

public class GoogleLoginRequest
{
    [Required]
    public string IdToken { get; set; } = string.Empty;
}
