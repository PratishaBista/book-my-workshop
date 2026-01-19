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
    categoryName: string;
    price: number;
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

export type AdminTab = 'overview' | 'providers' | 'workshops' | 'active_hosts' | 'users' | 'settings' | 'notifications' | 'help';
