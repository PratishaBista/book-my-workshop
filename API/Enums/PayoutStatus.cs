using System.Text.Json.Serialization;

namespace API.Enums
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum PayoutStatus
    {
        Escrow,             // Money held by platform before event
        ReadyForPayout,     // Event completed, money added to host balance
        Processing,         // Payout in progress
        Paid,               // Fully settled to host bank/wallet
        Cancelled           // Booking was cancelled/refunded
    }
}
