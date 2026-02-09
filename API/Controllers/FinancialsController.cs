using API.Data;
using API.Entities;
using API.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = UserRoles.SuperAdmin)]  // Use Role or Policy
    public class FinancialsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public FinancialsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // --- DASHBOARD OVERVIEW ---

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboardStats()
        {
            // 1. Get Commission Rate
            var settings = await _context.PlatformSettings.FirstOrDefaultAsync();
            if (settings == null)
            {
                settings = new PlatformSettings();
                _context.PlatformSettings.Add(settings);
                await _context.SaveChangesAsync();
            }

            // 2. Calculate Total Revenue (Completed Bookings)
            // PlatformFee (what we earned)
            var totalRevenue = await _context.Bookings
                .Where(b => b.PaymentStatus == PaymentStatus.Paid)
                .SumAsync(b => b.PlatformFee);

            // 3. Pending Payouts (What we owe hosts)
            var pendingPayouts = await _context.Providers
                .SumAsync(p => p.WalletBalance);

            // 4. Total Booking Volume
            var totalVolume = await _context.Bookings
                .Where(b => b.PaymentStatus == PaymentStatus.Paid)
                .SumAsync(b => b.TotalAmount);

            return Ok(new
            {
                CommissionRate = settings.CommissionPercentage,
                TotalPlatformRevenue = totalRevenue,
                PendingHostPayouts = pendingPayouts,
                TotalBookingVolume = totalVolume
            });
        }

        // --- COMMISSION SETTINGS ---

        [HttpGet("commission")]
        public async Task<IActionResult> GetCommissionRate()
        {
            var settings = await _context.PlatformSettings.FirstOrDefaultAsync();
            return Ok(new { Rate = settings?.CommissionPercentage ?? 10.0m });
        }

        [HttpPut("commission")]
        public async Task<IActionResult> UpdateCommission([FromBody] UpdateCommissionRequest request)
        {
            var settings = await _context.PlatformSettings.FirstOrDefaultAsync();
            if (settings == null)
            {
                settings = new PlatformSettings();
                _context.PlatformSettings.Add(settings);
            }

            settings.CommissionPercentage = request.Percentage;
            settings.LastUpdated = DateTime.UtcNow;
            settings.UpdatedBy = User.Identity?.Name ?? "SuperAdmin";

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Commission rate updated successfully", NewRate = settings.CommissionPercentage });
        }
    }

    public class UpdateCommissionRequest
    {
        [Range(0, 100)]
        public decimal Percentage { get; set; }
    }
}
