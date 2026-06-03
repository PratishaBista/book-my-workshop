// financials controller handles all platform financial operations
// includes commission/vat settings, host payouts, revenue dashboard, transaction history
// restricted to superadmin only due to financial sensitivity

using API.Data;
using API.Entities;
using API.Enums;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = UserRoles.SuperAdmin)]  // only superadmin can access financial operations
    public class FinancialsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public FinancialsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // returns key financial metrics for superadmin dashboard
        // includes revenue, pending payouts, escrow funds, and monthly trends
        // GET: api/financials/dashboard
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboardStats()
        {
            // fetch or create platform settings (commission rates, VAT rates, etc.)
            var settings = await _context.PlatformSettings.FirstOrDefaultAsync();
            if (settings == null)
            {
                settings = new PlatformSettings();
                _context.PlatformSettings.Add(settings);
                await _context.SaveChangesAsync();
            }

            // total revenue = sum of platform fees from settled bookings only
            // excludes escrow (future events) and refunded bookings
            var totalRevenue = await _context.Bookings
                .Where(b => b.PaymentStatus == PaymentStatus.Paid
                         && b.PayoutStatus != PayoutStatus.Escrow
                         && b.BookingStatus != BookingStatus.Refunded)
                .SumAsync(b => b.PlatformFee);

            // total VAT collected on platform commission (to be remitted to tax authorities)
            var totalVatCollected = await _context.Bookings
                .Where(b => b.PaymentStatus == PaymentStatus.Paid
                         && b.PayoutStatus != PayoutStatus.Escrow
                         && b.BookingStatus != BookingStatus.Refunded)
                .SumAsync(b => b.VatOnCommission);

            // net revenue after vat (what the platform actually keeps)
            decimal netPlatformRevenue = totalRevenue - totalVatCollected;

            // pending host balance = funds released from escrow but not yet paid out to host
            var releasedPayouts = await _context.Providers
                .SumAsync(p => p.WalletBalance);

            // funds in escrow = money held for future events (not yet released to host wallet)
            var escrowFunds = await _context.Bookings
                .Where(b => b.PayoutStatus == PayoutStatus.Escrow && b.PaymentStatus == PaymentStatus.Paid)
                .SumAsync(b => b.HostEarnings);

            // total booking volume = sum of all paid bookings (gross sales)
            var totalVolume = await _context.Bookings
                .Where(b => b.PaymentStatus == PaymentStatus.Paid)
                .SumAsync(b => b.TotalAmount);

            // platform growth metrics
            var totalUsers = await _context.Users.CountAsync();
            var totalProviders = await _context.Providers.CountAsync();
            var totalWorkshops = await _context.Workshops.CountAsync();

            // monthly booking data for trend analysis (last 6 months)
            var sixMonthsAgo = DateTime.UtcNow.AddMonths(-6);

            // fetch raw data first to avoid complex group by translation issues with ef core
            var recentBookingsRaw = await _context.Bookings
                .Where(b => b.PaymentStatus == PaymentStatus.Paid
                         && b.BookingStatus != BookingStatus.Refunded
                         && b.PayoutStatus != PayoutStatus.Escrow
                         && b.BookingDate >= sixMonthsAgo)
                .Select(b => new { b.BookingDate, b.PlatformFee, b.VatOnCommission })
                .ToListAsync();

            // group in memory for better control over date formatting
            var monthlyRevenueData = recentBookingsRaw
                .GroupBy(b => new { b.BookingDate.Year, b.BookingDate.Month })
                .Select(g => new
                {
                    month = new DateTime(g.Key.Year, g.Key.Month, 1).ToString("MMM yyyy"),
                    grossCommission = g.Sum(b => b.PlatformFee),
                    vat = g.Sum(b => b.VatOnCommission),
                    netRevenue = g.Sum(b => b.PlatformFee - b.VatOnCommission),
                    revenue = g.Sum(b => b.PlatformFee - b.VatOnCommission) // kept for backwards compatibility
                })
                .OrderBy(d => DateTime.Parse(d.month))
                .ToList();


            return Ok(new
            {
                CommissionRate = settings.CommissionPercentage,
                VatRate = settings.VatPercentage,
                TotalPlatformRevenue = totalRevenue,           // gross before vat
                TotalVatCollected = totalVatCollected,         // vat to remit to tax authority
                NetPlatformRevenue = netPlatformRevenue,       // actual platform income
                PendingHostPayouts = releasedPayouts,
                FundsInEscrow = escrowFunds,
                TotalBookingVolume = totalVolume,
                TotalUsers = totalUsers,
                TotalProviders = totalProviders,
                TotalWorkshops = totalWorkshops,
                MonthlyRevenueData = monthlyRevenueData
            });
        }

        // returns current platform commission rate
        // GET: api/financials/commission
        [HttpGet("commission")]
        public async Task<IActionResult> GetCommissionRate()
        {
            var settings = await _context.PlatformSettings.FirstOrDefaultAsync();
            // default 10% if settings don't exist yet
            return Ok(new { Rate = settings?.CommissionPercentage ?? 10.0m });
        }

        // updates the global platform commission rate
        // affects all future bookings (past bookings unaffected)
        // PUT: api/financials/commission
        [HttpPut("commission")]
        public async Task<IActionResult> UpdateCommission([FromBody] UpdateCommissionRequest request)
        {
            var settings = await _context.PlatformSettings.FirstOrDefaultAsync();
            if (settings == null)
            {
                settings = new PlatformSettings();
                _context.PlatformSettings.Add(settings);
            }

            var oldRate = settings.CommissionPercentage;
            settings.CommissionPercentage = request.Percentage;
            settings.LastUpdated = DateTime.UtcNow;
            settings.UpdatedBy = User.Identity?.Name ?? "SuperAdmin";

            await _context.SaveChangesAsync();

            // log the change for audit trail
            try
            {
                var logService = HttpContext.RequestServices.GetRequiredService<ISystemLogService>();
                await logService.LogWarningAsync("Financials", $"Commission rate updated from {oldRate}% to {request.Percentage}% by {settings.UpdatedBy}.", settings.UpdatedBy);
            }
            catch { }

            return Ok(new { Message = "Commission rate updated successfully", NewRate = settings.CommissionPercentage });
        }

        // returns current vat rate
        // GET: api/financials/vat
        [HttpGet("vat")]
        public async Task<IActionResult> GetVatRate()
        {
            var settings = await _context.PlatformSettings.FirstOrDefaultAsync();
            return Ok(new { Rate = settings?.VatPercentage ?? 13.0m }); // default 13% vat
        }

        // updates global vat rate
        // affects commission vat calculation on future bookings
        // PUT: api/financials/vat
        [HttpPut("vat")]
        public async Task<IActionResult> UpdateVatRate([FromBody] UpdateVatRequest request)
        {
            var settings = await _context.PlatformSettings.FirstOrDefaultAsync();
            if (settings == null)
            {
                settings = new PlatformSettings();
                _context.PlatformSettings.Add(settings);
            }

            var oldRate = settings.VatPercentage;
            settings.VatPercentage = request.Percentage;
            settings.LastUpdated = DateTime.UtcNow;
            settings.UpdatedBy = User.Identity?.Name ?? "SuperAdmin";

            await _context.SaveChangesAsync();

            try
            {
                var logService = HttpContext.RequestServices.GetRequiredService<ISystemLogService>();
                await logService.LogWarningAsync("Financials", $"VAT rate updated from {oldRate}% to {request.Percentage}% by {settings.UpdatedBy}.", settings.UpdatedBy);
            }
            catch { }

            return Ok(new { Message = "VAT rate updated successfully", NewRate = settings.VatPercentage });
        }

        // lists all hosts with their wallet balance and escrow balance
        // used for payout management
        // GET: api/financials/payouts
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
                    WalletBalance = p.WalletBalance, // funds ready for payout
                    // calculate escrow balance dynamically for each host
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

        // releases escrowed funds to host wallets for completed events
        // runs automatically or can be triggered manually by superadmin
        // POST: api/financials/payouts/release-escrow
        [HttpPost("payouts/release-escrow")]
        public async Task<IActionResult> ReleaseEscrowedFunds()
        {
            // find all paid bookings in escrow where the event has ended
            // 2-hour buffer ensures workshop is truly finished (handles timezone edge cases)
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
                    // move host earnings from escrow to wallet balance
                    provider.WalletBalance += booking.HostEarnings;
                    booking.PayoutStatus = PayoutStatus.ReadyForPayout; // now ready for bank transfer
                    releasedCount++;
                    totalReleased += booking.HostEarnings;
                }
            }

            await _context.SaveChangesAsync();

            try
            {
                var logService = HttpContext.RequestServices.GetRequiredService<ISystemLogService>();
                await logService.LogInfoAsync("Financials", $"Escrowed funds released. Total releases: {releasedCount} bookings, total amount: Rs. {totalReleased}.", User.Identity?.Name ?? "System");
            }
            catch { }

            return Ok(new
            {
                Message = "Escrowed funds released to host wallets.",
                ReleasedCount = releasedCount,
                TotalReleasedAmount = totalReleased
            });
        }

        // processes actual bank payout to a specific host
        // marks all ready bookings as paid and zeroes out wallet balance
        // in production, this would integrate with a payment gateway api
        // POST: api/financials/payouts/{providerId}/settle
        [HttpPost("payouts/{providerId}/settle")]
        public async Task<IActionResult> SettlePayout(int providerId)
        {
            var provider = await _context.Providers.FindAsync(providerId);
            if (provider == null) return NotFound("Host not found");
            if (provider.WalletBalance <= 0) return BadRequest("No pending balance to settle");

            // get all ready bookings for this host to mark as paid
            var bookings = await _context.Bookings
                .Include(b => b.WorkshopSchedule)
                    .ThenInclude(s => s.Workshop)
                .Where(b => b.WorkshopSchedule.Workshop.ProviderId == providerId
                         && b.PayoutStatus == PayoutStatus.ReadyForPayout
                         && b.PaymentStatus == PaymentStatus.Paid)
                .ToListAsync();

            // edge case: wallet has balance but no bookings marked ready (data inconsistency)
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

            try
            {
                var logService = HttpContext.RequestServices.GetRequiredService<ISystemLogService>();
                await logService.LogInfoAsync("Financials", $"Payout of Rs. {settledAmount} successfully settled for provider '{provider.BusinessName}' (ID: {providerId}) by SuperAdmin.", User.Identity?.Name ?? "SuperAdmin");
            }
            catch { }

            return Ok(new { Message = "Payout settled", SettledAmount = settledAmount, BookingsUpdated = bookings.Count });
        }

        // returns complete transaction history for audit and reporting
        // includes all bookings with fee breakdowns and statuses
        // GET: api/financials/transactions
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
                    b.PlatformFee,        // gross commission
                    b.VatOnCommission,    // VAT deducted from commission
                    NetPlatformFee = b.PlatformFee - b.VatOnCommission, // net after vat
                    b.HostEarnings,
                    b.BookingStatus,
                    b.PaymentStatus,
                    b.PayoutStatus,
                    b.BookingDate,
                    b.TransactionId,
                    b.WalletAmountUsed // how much wallet balance was applied (if any)
                })
                .ToListAsync();

            return Ok(transactions);
        }
    }

    // request dto for updating commission rate
    public class UpdateCommissionRequest
    {
        [Range(0, 100)] // commission must be between 0% and 100%
        public decimal Percentage { get; set; }
    }

    // request dto for updating vat rate
    public class UpdateVatRequest
    {
        [Range(0, 100)] // vat typically between 0-100%
        public decimal Percentage { get; set; }
    }
}
