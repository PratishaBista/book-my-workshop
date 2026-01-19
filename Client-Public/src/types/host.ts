export type HostTab = 'overview' | 'workshops' | 'bookings' | 'earnings' | 'reviews' | 'profile' | 'support' | 'settings';

export const ProviderStatus = {
    Incomplete: 0,
    PendingReview: 1,
    Approved: 2,
    Rejected: 3,
    Suspended: 4
} as const;

export type ProviderStatusType = (typeof ProviderStatus)[keyof typeof ProviderStatus];

export interface ProviderProfile {
    id: number;
    businessName: string;
    phoneNumber: string;
    address: string;
    state: string;
    website?: string;
    tagline?: string;
    description?: string;
    slug?: string;
    logoUrl?: string;
    coverImageUrl?: string;
    status: ProviderStatusType;
    isApproved: boolean;
    contactPerson: string;
    email: string;
}
