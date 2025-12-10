namespace API.Enums;

public enum WorkshopStatus
{
    Draft = 0,      // Provider is still working on it
    Published = 1,  // Live and visible to users
    Archived = 2,   // No longer active but kept for records
    Suspended = 3   // Temporarily disabled by admin
}
