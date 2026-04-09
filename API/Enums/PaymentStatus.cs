using System.Text.Json.Serialization;

namespace API.Enums;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum PaymentStatus
{
    Pending = 0,   // Payment not yet made
    Paid = 1,      // Payment successful
    Failed = 2,    // Payment attempt failed
    Refunded = 3   // Payment refunded to user
}
