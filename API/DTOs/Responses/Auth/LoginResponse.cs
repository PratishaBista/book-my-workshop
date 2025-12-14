namespace API.DTOs.Responses.Auth;

public class LoginResponse
{
    public string Token { get; set; } = string.Empty;
    public DateTime Expiry { get; set; }
    public bool IsApproved { get; set; } = true; // Default to true for normal users
}
