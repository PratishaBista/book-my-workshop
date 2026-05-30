using System.Text.Json.Serialization;

namespace API.Enums;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum WalletTransactionType
{
    GiftCardClaim = 0,      // Credit from claiming a gift card
    BookingPayment = 1,     // Debit for booking a workshop
    BookingRefund = 2       // Credit from a cancelled booking refund
}
