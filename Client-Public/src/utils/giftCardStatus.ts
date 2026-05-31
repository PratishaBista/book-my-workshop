export type NormalizedGiftCardStatus =
    | 'pending'
    | 'active'
    | 'claimed'
    | 'expired'
    | 'cancelled'
    | 'unknown';

export function normalizeGiftCardStatus(status: unknown): NormalizedGiftCardStatus {
    if (typeof status === 'number') {
        switch (status) {
            case 0:
                return 'pending';
            case 1:
                return 'active';
            case 2:
                return 'claimed';
            case 3:
                return 'expired';
            case 4:
                return 'cancelled';
            default:
                return 'unknown';
        }
    }
    if (typeof status === 'string') {
        const key = status.trim().toLowerCase();
        if (key === 'pending') return 'pending';
        if (key === 'active') return 'active';
        if (key === 'claimed') return 'claimed';
        if (key === 'expired') return 'expired';
        if (key === 'cancelled') return 'cancelled';
    }
    return 'unknown';
}

export function isGiftCardActive(status: unknown): boolean {
    return normalizeGiftCardStatus(status) === 'active';
}

export function isGiftCardClaimed(status: unknown): boolean {
    return normalizeGiftCardStatus(status) === 'claimed';
}
