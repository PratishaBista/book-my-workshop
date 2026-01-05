namespace API.Enums;

public enum ProviderStatus
{
    Incomplete = 0,     // Account created, profile details missing
    PendingReview = 1,  // Profile submitted, waiting for admin approval
    Approved = 2,       // Fully active host
    Rejected = 3,       // Profile rejected by admin
    Suspended = 4       // Account disabled for policy violations
}
