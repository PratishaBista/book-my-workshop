namespace API.Helpers;

/// <summary>
/// Platform display timezone (workshops operate in Nepal).
/// Stored values in the database are UTC instants.
/// </summary>
public static class PlatformTime
{
    public const string DefaultTimeZoneId = "Asia/Kathmandu";
    public const string WindowsTimeZoneId = "Nepal Standard Time";

    private static TimeZoneInfo? _nepalZone;

    public static TimeZoneInfo NepalTimeZone =>
        _nepalZone ??= TimeZoneInfo.FindSystemTimeZoneById(
            OperatingSystem.IsWindows() ? WindowsTimeZoneId : DefaultTimeZoneId);

    public static DateTime AsUtc(DateTime value) =>
        value.Kind switch
        {
            DateTimeKind.Utc => value,
            DateTimeKind.Local => value.ToUniversalTime(),
            _ => DateTime.SpecifyKind(value, DateTimeKind.Utc),
        };

    public static DateTime ToNepalTime(DateTime value) =>
        TimeZoneInfo.ConvertTimeFromUtc(AsUtc(value), NepalTimeZone);
}
