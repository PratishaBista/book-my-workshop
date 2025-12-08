namespace API.DTOs.Responses.Auth;

public class LoginResponse
{
    public string Token { get; set; } = string.Empty;
    public DateTime Expiry { get; set; }
}
