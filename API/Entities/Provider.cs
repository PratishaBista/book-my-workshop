using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.Entities;

public class Provider
{
    [Key]
    public int Id { get; set; }

    [Required]
    public string BusinessName { get; set; } = string.Empty;

    [Required]
    public string PhoneNumber { get; set; } = string.Empty;

    public string Address { get; set; } = string.Empty;

    public bool IsApproved { get; set; } = false; // Admin approval status

    // Foreign Key to ApplicationUser
    [Required]
    public string UserId { get; set; } = string.Empty;

    [ForeignKey("UserId")]
    public ApplicationUser User { get; set; } = null!;
}
