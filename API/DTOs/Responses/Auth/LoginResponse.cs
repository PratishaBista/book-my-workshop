namespace API.DTOs.Responses.Auth;

public class LoginResponse
{
    public string Token { get; set; } = string.Empty;
    public DateTime Expiry { get; set; }
    public bool IsApproved { get; set; } = true; // Default to true for normal users
    public API.Enums.ProviderStatus? Status { get; set; }
    public bool HasCompletedOnboarding { get; set; }
    public bool RequiresMFA { get; set; }
    public bool IsReactivated { get; set; }
}
