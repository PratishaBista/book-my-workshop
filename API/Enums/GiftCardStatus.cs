using System.Text.Json.Serialization;

namespace API.Enums;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum GiftCardStatus
{
    Pending = 0,     // Created but payment not yet confirmed
    Active = 1,      // Paid and ready to be claimed/used
    Claimed = 2,     // Claimed by recipient and added to wallet
    Expired = 3,     // Gift card expired (if expiration policy is added)
    Cancelled = 4    // Cancelled/refunded
}
