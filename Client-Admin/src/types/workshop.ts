export const WorkshopType = {
    PublicClass: 0,
    Experience: 1,
    Private: 2
} as const;
export type WorkshopType = typeof WorkshopType[keyof typeof WorkshopType];

export const PricingType = {
    PerPerson: 0,
    PerGroup: 1
} as const;
export type PricingType = typeof PricingType[keyof typeof PricingType];

export const MediaType = {
    Image: 0,
    Video: 1,
    CarouselImage: 2,
    CarouselVideo: 3
} as const;
export type MediaType = typeof MediaType[keyof typeof MediaType];

export const WorkshopStatus = {
    Draft: 0,
    PendingReview: 1,
    Published: 2,
    Rejected: 3,
    Archived: 4,
    Suspended: 5
} as const;
export type WorkshopStatus = typeof WorkshopStatus[keyof typeof WorkshopStatus];

export const ScheduleStatus = {
    Upcoming: 0,
    InProgress: 1,
    Completed: 2,
    Cancelled: 3
} as const;
export type ScheduleStatus = typeof ScheduleStatus[keyof typeof ScheduleStatus];

export interface WorkshopCategory {
    id: number;
    name: string;
    description?: string;
    iconUrl?: string;
}

export interface WorkshopMedia {
    id: number;
    url: string;
    mediaType: MediaType;
    isPrimary: boolean;
    displayOrder: number;
    storyPodId: number;
    aspectRatio?: string;
}

export interface WorkshopPricing {
    pricingType: PricingType;
    basePrice: number;
    currency: string;
    groupDiscountPercentage?: number;
    groupDiscountMinSize?: number;
    extraCharges?: string;
    priceExplanation?: string;
}

export interface ProviderResponse {
    id: number;
    businessName: string;
    address?: string;
    logoUrl?: string;
    coverImageUrl?: string;
}

export interface ScheduleResponse {
    id: number;
    startDateTime: string;
    endDateTime: string;
    availableSeats: number;
    isSoldOut: boolean;
    status: ScheduleStatus;
}

export interface ReviewResponse {
    id: number;
    rating: number;
    comment: string;
    userName: string;
    isVerifiedAttendee: boolean;
    createdAt: string;
}

export interface WorkshopDetail {
    id: number;
    title: string;
    subtitle?: string;
    tagline?: string;
    slug: string;
    description: string;
    workshopType: WorkshopType;
    duration: string; // "HH:mm:ss"
    maxCapacity: number;
    minCapacity?: number;
    status: WorkshopStatus;
    locationAddress: string;
    locationName?: string;
    locationDetails?: string;
    venueDescription?: string;
    latitude?: number;
    longitude?: number;
    categories: WorkshopCategory[];
    pricing: WorkshopPricing;
    media: WorkshopMedia[];
    provider: ProviderResponse;
    upcomingSchedules: ScheduleResponse[];
    reviews: ReviewResponse[];
    averageRating?: number;
    reviewCount: number;
    whatToBring?: string;
    skillLevel?: string;
    suitability?: string;
    cancellationPolicy?: string;
    bookingCutoffHours: number;
    safetyRequirements?: string;
    whatsIncluded?: string;
    createdAt: string;
    updatedAt: string;
}

export interface WorkshopCreateRequest {
    title: string;
    subtitle?: string;
    tagline?: string;
    description: string;
    workshopType: WorkshopType;
    duration: string; // "HH:mm:ss"
    maxCapacity: number;
    minCapacity?: number;
    categoryIds: number[];
    locationAddress: string;
    locationName?: string;
    locationDetails?: string;
    venueDescription?: string;
    latitude?: number;
    longitude?: number;
    pricingType: PricingType;
    basePrice: number;
    groupDiscountPercentage?: number;
    groupDiscountMinSize?: number;
    extraCharges?: string;
    priceExplanation?: string;
    whatToBring?: string;
    skillLevel?: string;
    suitability?: string;
    cancellationPolicy?: string;
    bookingCutoffHours: number;
    whatsIncluded?: string;
    media: {
        url: string;
        publicId?: string;
        mediaType: MediaType;
        isPrimary: boolean;
        storyPodId: number;
        displayOrder: number;
        aspectRatio?: string;
    }[];
    status?: number; // Optional for submission convenience
}
