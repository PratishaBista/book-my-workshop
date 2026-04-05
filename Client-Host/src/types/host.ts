export type HostTab = 'overview' | 'workshops' | 'schedules' | 'bookings' | 'earnings' | 'reviews' | 'profile' | 'verification' | 'support' | 'settings';

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
    venueName?: string;
    latitude?: number;
    longitude?: number;
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

    // Trust & Safety
    idCardUrl?: string;
    idFileName?: string;
    panCardUrl?: string;
    panFileName?: string;
    isIdVerified: boolean;
    isPanVerified: boolean;
    trustScore: number;
    trustAnalysisJson?: string;
}

export interface Venue {
    id: number;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    description?: string;
    isDefault: boolean;
}
