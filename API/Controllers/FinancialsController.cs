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

            // 2. Calculate Total Revenue (Completed/Settled Bookings ONLY)
            // Does not count funds in Escrow as revenue yet
            var totalRevenue = await _context.Bookings
                .Where(b => b.PaymentStatus == PaymentStatus.Paid 
                         && b.PayoutStatus != PayoutStatus.Escrow
                         && b.BookingStatus != BookingStatus.Refunded)
                .SumAsync(b => b.PlatformFee);

            // 3. Pending Host Balance (Released to wallet, ready to settle)
            var releasedPayouts = await _context.Providers
                .SumAsync(p => p.WalletBalance);

            // 3a. Funds in Escrow (Held for future events)
            var escrowFunds = await _context.Bookings
                .Where(b => b.PayoutStatus == PayoutStatus.Escrow && b.PaymentStatus == PaymentStatus.Paid)
                .SumAsync(b => b.HostEarnings);

            // 4. Total Booking Volume
            var totalVolume = await _context.Bookings
                .Where(b => b.PaymentStatus == PaymentStatus.Paid)
                .SumAsync(b => b.TotalAmount);

            // 5. Total counts
            var totalUsers = await _context.Users.CountAsync();
            var totalProviders = await _context.Providers.CountAsync();
            var totalWorkshops = await _context.Workshops.CountAsync();

            // 6. Monthly Booking Data (Last 6 Months)
            var sixMonthsAgo = DateTime.UtcNow.AddMonths(-6);
            
            // Get raw data from DB
            var recentBookingsRaw = await _context.Bookings
                .Where(b => b.PaymentStatus == PaymentStatus.Paid && b.BookingDate >= sixMonthsAgo)
                .Select(b => new { b.BookingDate, b.PlatformFee })
                .ToListAsync();

            // Group in memory
            var monthlyRevenueData = recentBookingsRaw
                .GroupBy(b => new { b.BookingDate.Year, b.BookingDate.Month })
                .Select(g => new
                {
                    month = new DateTime(g.Key.Year, g.Key.Month, 1).ToString("MMM yyyy"),
                    revenue = g.Sum(b => b.PlatformFee)
                })
                .OrderBy(d => DateTime.Parse(d.month)) // Re-order after grouping
                .ToList();


            return Ok(new
            {
                CommissionRate = settings.CommissionPercentage,
                TotalPlatformRevenue = totalRevenue,
                PendingHostPayouts = releasedPayouts,
                FundsInEscrow = escrowFunds,
                TotalBookingVolume = totalVolume,
                TotalUsers = totalUsers,
                TotalProviders = totalProviders,
                TotalWorkshops = totalWorkshops,
                MonthlyRevenueData = monthlyRevenueData
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

        // --- HOST PAYOUTS ---

        [HttpGet("payouts")]
        public async Task<IActionResult> GetHostPayouts()
        {
            var hosts = await _context.Providers
                .Include(p => p.User)
                .Select(p => new
                {
                    ProviderId = p.Id,
                    BusinessName = p.BusinessName,
                    Email = p.User.Email,
                    WalletBalance = p.WalletBalance, // Released funds
                    EscrowBalance = _context.Bookings
                        .Where(b => b.WorkshopSchedule.Workshop.ProviderId == p.Id 
                                 && b.PayoutStatus == PayoutStatus.Escrow 
                                 && b.PaymentStatus == PaymentStatus.Paid)
                        .Sum(b => b.HostEarnings)
                })
                .OrderByDescending(p => p.WalletBalance)
                .ToListAsync();

            return Ok(hosts);
        }

        [HttpPost("payouts/release-escrow")]
        public async Task<IActionResult> ReleaseEscrowedFunds()
        {
            // Find all paid bookings in escrow where the event has ended
            // Using a 2-hour buffer after end time for safety
            var bufferTime = DateTime.UtcNow.AddHours(-2);

            var bookingsToRelease = await _context.Bookings
                .Include(b => b.WorkshopSchedule)
                    .ThenInclude(s => s.Workshop)
                        .ThenInclude(w => w.Provider)
                .Where(b => b.PayoutStatus == PayoutStatus.Escrow 
                         && b.PaymentStatus == PaymentStatus.Paid
                         && b.WorkshopSchedule.EndDateTime < bufferTime)
                .ToListAsync();

            if (bookingsToRelease.Count == 0)
                return Ok(new { Message = "No funds ready for release at this time.", ReleasedCount = 0 });

            int releasedCount = 0;
            decimal totalReleased = 0;

            foreach (var booking in bookingsToRelease)
            {
                var provider = booking.WorkshopSchedule.Workshop.Provider;
                if (provider != null)
                {
                    provider.WalletBalance += booking.HostEarnings;
                    booking.PayoutStatus = PayoutStatus.ReadyForPayout;
                    releasedCount++;
                    totalReleased += booking.HostEarnings;
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new { 
                Message = "Escrowed funds released to host wallets.", 
                ReleasedCount = releasedCount, 
                TotalReleasedAmount = totalReleased 
            });
        }

        [HttpPost("payouts/{providerId}/settle")]
        public async Task<IActionResult> SettlePayout(int providerId)
        {
            var provider = await _context.Providers.FindAsync(providerId);
            if (provider == null) return NotFound("Host not found");
            if (provider.WalletBalance <= 0) return BadRequest("No pending balance to settle");

            // Mark all ready bookings for this host as paid out
            var bookings = await _context.Bookings
                .Include(b => b.WorkshopSchedule)
                    .ThenInclude(s => s.Workshop)
                .Where(b => b.WorkshopSchedule.Workshop.ProviderId == providerId
                         && b.PayoutStatus == PayoutStatus.ReadyForPayout
                         && b.PaymentStatus == PaymentStatus.Paid)
                .ToListAsync();

            if (bookings.Count == 0 && provider.WalletBalance > 0)
            {
                return BadRequest("No completed workshop earnings are available for settlement yet. All funds are currently held in escrow.");
            }

            foreach (var booking in bookings)
                booking.PayoutStatus = PayoutStatus.Paid;

            // Zero out host wallet
            var settledAmount = provider.WalletBalance;
            provider.WalletBalance = 0;

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Payout settled", SettledAmount = settledAmount, BookingsUpdated = bookings.Count });
        }

        [HttpGet("transactions")]
        public async Task<IActionResult> GetTransactions()
        {
            var transactions = await _context.Bookings
                .Include(b => b.User)
                .Include(b => b.WorkshopSchedule)
                    .ThenInclude(s => s.Workshop)
                        .ThenInclude(w => w.Provider)
                .OrderByDescending(b => b.BookingDate)
                .Select(b => new
                {
                    b.Id,
                    GuestName = b.User.FullName,
                    WorkshopTitle = b.WorkshopSchedule.Workshop.Title,
                    HostName = b.WorkshopSchedule.Workshop.Provider.BusinessName,
                    b.TotalAmount,
                    b.PlatformFee,
                    b.HostEarnings,
                    b.BookingStatus,
                    b.PaymentStatus,
                    b.PayoutStatus,
                    b.BookingDate,
                    b.TransactionId
                })
                .ToListAsync();

            return Ok(transactions);
        }
    }

    public class UpdateCommissionRequest
    {
        [Range(0, 100)]
        public decimal Percentage { get; set; }
    }
}
