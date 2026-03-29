using Microsoft.AspNetCore.Identity;

namespace API.Entities;

public class ApplicationUser : IdentityUser
{
    public string? GoogleId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? Bio { get; set; }
    public string? Pronouns { get; set; }
    public string? ProfilePictureUrl { get; set; }
    public string? CoverImageUrl { get; set; }
    public string? Location { get; set; }
    public string? Website { get; set; }
    public string? FunFact { get; set; }
    public string? ProfileUsername { get; set; }
    public bool HasCompletedOnboarding { get; set; } = false;
    public bool IsDeactivated { get; set; } = false;
    public DateTime? DeletionScheduledAt { get; set; }
    public bool DeletionWarningSent { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<UserPreference> Preferences { get; set; } = new List<UserPreference>();
}
