using Microsoft.AspNetCore.Identity;

namespace API.Entities;

public class ApplicationUser : IdentityUser
{
    public string? GoogleId { get; set; }
    public string FullName { get; set; } = string.Empty;
}
