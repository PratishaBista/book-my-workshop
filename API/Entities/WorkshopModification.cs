using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using API.Enums;

namespace API.Entities;

public class WorkshopModification
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int WorkshopId { get; set; }

    [ForeignKey(nameof(WorkshopId))]
    public Workshop Workshop { get; set; } = null!;

    [Required]
    public string ModifiedFields { get; set; } = string.Empty; // JSON array of field names

    public string? PendingData { get; set; } // JSON serialized UpdateWorkshopRequest data

    public bool HasMajorChanges { get; set; }
    public bool HasMinorChanges { get; set; }

    public WorkshopStatus PreviousStatus { get; set; }
    public WorkshopStatus NewStatus { get; set; }

    [MaxLength(1000)]
    public string? AdminNotes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ReviewedAt { get; set; }
    public int? ReviewedByAdminId { get; set; }
}
