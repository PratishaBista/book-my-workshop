using System.ComponentModel.DataAnnotations;

namespace API.Entities;

public class UserPreference
{
    [Key]
    public int Id { get; set; }

    [Required]
    public string UserId { get; set; } = string.Empty;
    public ApplicationUser User { get; set; } = null!;

    [Required]
    public int CategoryId { get; set; }
    public WorkshopCategory Category { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
