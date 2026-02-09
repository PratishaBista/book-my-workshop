using System.Text.Json.Serialization;

namespace API.Enums
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum PayoutStatus
    {
        Pending,
        Processing,
        Paid,
        Failed
    }
}
