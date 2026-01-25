namespace API.DTOs.Responses;

public class CategoryAdminResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? IconUrl { get; set; }

    public bool IsActive { get; set; }
    public int WorkshopCount { get; set; }
    public DateTime CreatedAt { get; set; }
}
