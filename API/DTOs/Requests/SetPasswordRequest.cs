namespace API.DTOs.Requests;

public class SetPasswordRequest
{
    public string NewPassword { get; set; } = string.Empty;
    public string? CurrentPassword { get; set; }
}
