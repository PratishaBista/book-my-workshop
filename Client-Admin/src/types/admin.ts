export interface PendingProvider {
    id: number;
    businessName: string;
    contactPerson: string;
    email: string;
    phoneNumber: string;
    state: string;
    address: string;
    website: string;
    tagline?: string;
    description?: string;
    slug?: string;
    referralSource: string;
    registeredAt: string;
    trustScore: number;
    trustAnalysisJson: string;
    idCardUrl?: string;
    panCardUrl?: string;
    studioImageUrl?: string;
}

export interface PendingWorkshop {
    id: number;
    title: string;
    description: string;
    tagline: string;
    duration: string;
    maxCapacity: number;
    locationAddress: string;
    locationName: string;
    providerName: string;
    providerContact: string;
    providerEmail: string;
    submittedAt: string;
    categoryNames: string[];
    price: number;
    aiSuggestedCategory?: string;
    aiConfidenceScore?: number;
    aiIsConfident?: boolean;
}

export interface SimpleUser {
    id: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
    emailConfirmed: boolean;
    role: string;
    status: string;
    providerId?: number;
}

export type AdminTab = 'overview' | 'providers' | 'workshops' | 'live_workshops' | 'active_hosts' | 'users' | 'categories' | 'settings' | 'notifications' | 'help';
