using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.Entities
{
    public class PlatformSettings
    {
        [Key]
        public int Id { get; set; }

        [Column(TypeName = "decimal(5,2)")]
        public decimal CommissionPercentage { get; set; } = 10.0m; // Default to 10%

        /// <summary>
        /// VAT rate applied on the platform commission (not on booking total).
        /// Nepal standard VAT is 13%.
        /// </summary>
        [Column(TypeName = "decimal(5,2)")]
        public decimal VatPercentage { get; set; } = 13.0m;
        
        // Audit fields
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
        public string UpdatedBy { get; set; } = "System";
    }
}
