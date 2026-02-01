using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using API.Enums;

namespace API.Entities;

public class WorkshopSchedule
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int WorkshopId { get; set; }

    [ForeignKey(nameof(WorkshopId))]
    public Workshop Workshop { get; set; } = null!;

    [Required]
    public DateTime StartDateTime { get; set; }

    [Required]
    public DateTime EndDateTime { get; set; }

    [Required]
    [Range(1, 1000)]
    public int MaxCapacity { get; set; } // Total capacity at creation

    [Required]
    [Range(0, 1000)]
    public int AvailableSeats { get; set; } // Decrements with each booking

    public ScheduleStatus Status { get; set; } = ScheduleStatus.Upcoming;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Computed property (not stored in DB)
    [NotMapped]
    public bool IsSoldOut => AvailableSeats == 0;

    // Navigation Property
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}
