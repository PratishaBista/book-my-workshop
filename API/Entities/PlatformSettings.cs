using System.ComponentModel.DataAnnotations;

namespace API.Entities
{
    public class PlatformSettings
    {
        [Key]
        public int Id { get; set; }

        public decimal CommissionPercentage { get; set; } = 10.0m; // Default to 10%
        
        // Audit fields
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
        public string UpdatedBy { get; set; } = "System";
    }
}
