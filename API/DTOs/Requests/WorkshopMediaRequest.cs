using API.Enums;
using System.ComponentModel.DataAnnotations;

namespace API.DTOs.Requests;

public class WorkshopMediaRequest
{
    [Required]
    public string Url { get; set; } = string.Empty;

    public string? PublicId { get; set; }

    [Required]
    public MediaType MediaType { get; set; }

    public bool IsPrimary { get; set; }
    
    public int DisplayOrder { get; set; }
}
