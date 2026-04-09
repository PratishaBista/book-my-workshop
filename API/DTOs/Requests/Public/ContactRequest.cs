using System.ComponentModel.DataAnnotations;

namespace API.DTOs.Requests.Public;

public class ContactRequest
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(2000)]
    public string Message { get; set; } = string.Empty;
}
