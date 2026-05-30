import { useQuery } from '@tanstack/react-query';
import { API_ENDPOINTS } from '../config/api';

export interface Workshop {
    id: number;
    title: string;
    slug: string;
    locationName: string;
    locationAddress: string;
    categoryName: string;
    basePrice: number;
    currency: string;
    primaryImageUrl: string;
    averageRating: number | null;
    reviewCount: number;
    recommendationScore?: number;
    duration?: string;
    maxCapacity?: number;
    hasUpcomingSchedules?: boolean;
    nextScheduleDate?: string | null;
    tagline?: string;
}

/** Normalize API list payloads (camelCase) for cards **/
export function normalizeWorkshop(raw: Record<string, unknown>): Workshop {
    const categories = raw.categories as { name?: string }[] | undefined;
    return {
        id: raw.id as number,
        title: (raw.title as string) || '',
        slug: (raw.slug as string) || String(raw.id),
        locationName: (raw.locationName as string) || '',
        locationAddress: (raw.locationAddress as string) || '',
        categoryName:
            (raw.categoryName as string) ||
            categories?.[0]?.name ||
            '',
        basePrice: Number(raw.basePrice ?? 0),
        currency: (raw.currency as string) || 'NPR',
        primaryImageUrl: (raw.primaryImageUrl as string) || '',
        averageRating: raw.averageRating != null ? Number(raw.averageRating) : null,
        reviewCount: Number(raw.reviewCount ?? 0),
        recommendationScore: raw.recommendationScore as number | undefined,
        duration:
            typeof raw.duration === 'string'
                ? raw.duration
                : raw.duration != null
                  ? String(raw.duration)
                  : undefined,
        maxCapacity: raw.maxCapacity != null ? Number(raw.maxCapacity) : undefined,
        hasUpcomingSchedules: Boolean(raw.hasUpcomingSchedules),
        nextScheduleDate: (raw.nextScheduleDate as string) || null,
        tagline: raw.tagline as string | undefined,
    };
}

const mapList = (data: unknown[]): Workshop[] => data.map((w) => normalizeWorkshop(w as Record<string, unknown>));

export interface Category {
    id: number;
    name: string;
    description?: string;
    iconUrl?: string;
}

// Fetchers

const fetchFeaturedWorkshops = async (count = 12): Promise<Workshop[]> => {
    const res = await fetch(`${API_ENDPOINTS.workshop.featured}?count=${count}`);
    if (!res.ok) throw new Error('Failed to fetch featured workshops');
    return mapList(await res.json());
};

const fetchAllPublishedWorkshops = async (): Promise<Workshop[]> => {
    const res = await fetch(API_ENDPOINTS.workshop.public);
    if (!res.ok) throw new Error('Failed to fetch workshops');
    return mapList(await res.json());
};

const fetchRecommendedWorkshops = async (token: string | null): Promise<Workshop[]> => {
    const res = await fetch(API_ENDPOINTS.workshop.userRecommendations, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Failed to fetch recommendations');
    return mapList(await res.json());
};

const fetchCategories = async (): Promise<Category[]> => {
    const res = await fetch(API_ENDPOINTS.category);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
};

// Hooks

/** Featured / trending workshops. Cached for 5 minutes. */
export const useFeaturedWorkshops = (count = 12) =>
    useQuery<Workshop[]>({
        queryKey: ['workshops', 'featured', count],
        queryFn: () => fetchFeaturedWorkshops(count),
        staleTime: 60 * 60 * 1000,
    });

/** All published workshops (used for "Explore More" section). Cached for 5 minutes. */
export const useAllPublishedWorkshops = () =>
    useQuery<Workshop[]>({
        queryKey: ['workshops', 'all'],
        queryFn: fetchAllPublishedWorkshops,
        staleTime: 5 * 60 * 1000,
    });

/**
 * Personalised recommendations for a logged-in user.
 * Only fires when a token is present. Cached for 15 minutes.
 */
export const useRecommendedWorkshops = (token: string | null) =>
    useQuery<Workshop[]>({
        queryKey: ['workshops', 'recommendations', !!token],
        queryFn: () => fetchRecommendedWorkshops(token),
        staleTime: 60 * 60 * 1000,
        // avoids refetching recommendations just because the window regains focus
        refetchOnWindowFocus: false,
    });

/**
 * Active workshop categories.
 * Cached for 1 hour
 */
export const useCategories = () =>
    useQuery<Category[]>({
        queryKey: ['categories'],
        queryFn: fetchCategories,
        staleTime: 60 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
