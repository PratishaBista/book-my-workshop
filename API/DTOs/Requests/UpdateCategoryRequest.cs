using System.ComponentModel.DataAnnotations;

namespace API.DTOs.Requests;

public class UpdateCategoryRequest
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    public string? IconUrl { get; set; }



    public bool IsActive { get; set; }
}
