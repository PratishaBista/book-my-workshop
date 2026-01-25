using System.ComponentModel.DataAnnotations;

namespace API.DTOs.Requests;

public class VenueRequest
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string Address { get; set; } = string.Empty;

    [Required]
    public decimal Latitude { get; set; }

    [Required]
    public decimal Longitude { get; set; }

    public string? Description { get; set; }
    public bool IsDefault { get; set; }
}
