using System;
using System.Collections.Generic;

namespace API.DTOs.Responses
{
    public class HostEarningsResponse
    {
        public decimal WalletBalance { get; set; }
        public decimal TotalEarnings { get; set; }
        public decimal PendingPayouts { get; set; }
        public decimal PaidOut { get; set; }
        public int TotalBookings { get; set; }
        public List<EarningTransactionResponse> RecentTransactions { get; set; } = new();
    }

    public class EarningTransactionResponse
    {
        public int BookingId { get; set; }
        public string WorkshopTitle { get; set; } = string.Empty;
        public DateTime BookingDate { get; set; }
        public string GuestName { get; set; } = string.Empty;
        public int NumberOfSeats { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal PlatformFee { get; set; }
        public decimal HostEarnings { get; set; }
        public string PayoutStatus { get; set; } = string.Empty;
        public string BookingStatus { get; set; } = string.Empty;
    }
}
