namespace API.DTOs.Responses;

public class ProfileResponse
{
    public string Email { get; set; } = string.Empty;
    public string? FullName { get; set; }
    public string? Bio { get; set; }
    public string? Pronouns { get; set; }
    public string? ProfilePictureUrl { get; set; }
    public string? CoverImageUrl { get; set; }
    public string? Location { get; set; }
    public string? Website { get; set; }
    public string? FunFact { get; set; }
    public string? ProfileUsername { get; set; }
    public string? PhoneNumber { get; set; }
    public string? GoogleId { get; set; }
    public bool EmailConfirmed { get; set; }
    public bool IsDeactivated { get; set; }
    public DateTime? DeletionScheduledAt { get; set; }
    public DateTime CreatedAt { get; set; }
}
