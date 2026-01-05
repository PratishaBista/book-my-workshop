namespace API.Enums;

public enum WorkshopStatus
{
    Draft = 0,      // Provider is still working on it
    PendingReview = 1, // Submitted by provider, waiting for admin approval
    Published = 2,  // Live and visible to users (Approved)
    Rejected = 3,   // Rejected by admin
    Archived = 4,   // No longer active but kept for records
    Suspended = 5   // Temporarily disabled by admin
}
