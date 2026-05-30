import React from 'react';
import { Star, MapPin, Calendar, Users, Ticket } from 'lucide-react';
import type { Workshop } from '../../hooks/useWorkshopQueries';

export type WorkshopCardLayout = 'grid' | 'compact';

interface WorkshopCardProps {
    workshop: Workshop;
    onClick: () => void;
    wishlisted?: boolean;
    onToggleWishlist?: (e: React.MouseEvent) => void;
    layout?: WorkshopCardLayout;
}

function formatLocation(workshop: Workshop): string {
    if (workshop.locationName?.trim()) return workshop.locationName.trim();
    const addr = workshop.locationAddress?.trim();
    if (!addr) return 'Location TBA';
    const first = addr.split(',')[0]?.trim();
    return first || addr;
}

function formatDuration(duration?: string): string | null {
    if (!duration) return null;
    const parts = duration.split(':').map(Number);
    if (parts.length >= 2) {
        const h = parts[0] || 0;
        const m = parts[1] || 0;
        if (h > 0 && m > 0) return `${h}h ${m}m`;
        if (h > 0) return `${h} hr${h > 1 ? 's' : ''}`;
        if (m > 0) return `${m} min`;
    }
    return null;
}

function formatScheduleHint(workshop: Workshop): string {
    if (workshop.nextScheduleDate) {
        const d = new Date(workshop.nextScheduleDate);
        if (!Number.isNaN(d.getTime())) {
            return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
        }
    }
    if (workshop.hasUpcomingSchedules) return 'Dates available';
    return 'See schedule';
}

function formatCapacity(maxCapacity?: number): string | null {
    if (!maxCapacity || maxCapacity <= 0) return null;
    if (maxCapacity === 1) return '1 guest';
    return `Up to ${maxCapacity} guests`;
}

const MetaRow: React.FC<{ icon: React.ReactNode; children: React.ReactNode }> = ({ icon, children }) => (
    <div className="flex items-center gap-2 text-deep-purple/55 min-w-0">
        <span className="shrink-0 text-deep-purple/35">{icon}</span>
        <span className="text-[13px] leading-snug truncate">{children}</span>
    </div>
);

export const WorkshopCard: React.FC<WorkshopCardProps> = ({
    workshop,
    onClick,
    wishlisted = false,
    onToggleWishlist,
    layout = 'grid',
}) => {
    const durationLabel = formatDuration(workshop.duration);
    const capacityLabel = formatCapacity(workshop.maxCapacity);
    const isCompact = layout === 'compact';

    return (
        <article
            role="button"
            tabIndex={0}
            onClick={onClick}
            onKeyDown={(e) => e.key === 'Enter' && onClick()}
            className={`group cursor-pointer text-left w-full ${isCompact ? '' : ''}`}
        >
            <div
                className={`relative overflow-hidden bg-gray-100 ${isCompact
                    ? 'aspect-[4/5] mb-3 rounded-2xl'
                    : 'aspect-[4/5] mb-3 rounded-2xl shadow-sm border border-deep-purple/5'
                    }`}
            >
                {workshop.primaryImageUrl ? (
                    <img
                        src={workshop.primaryImageUrl}
                        alt=""
                        className="w-full h-full object-cover transition-transform duration-700 ease-out
                        "
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-deep-purple/8 to-primary-orange/10" />
                )}

                {onToggleWishlist && (
                    <button
                        type="button"
                        onClick={onToggleWishlist}
                        className="absolute top-2.5 right-2.5 z-10 w-9 h-9 flex items-center justify-center"
                        aria-label={wishlisted ? 'Remove from wishlist' : 'Save workshop'}
                    >
                        <svg
                            viewBox="0 0 24 24"
                            className={`w-5 h-5 transition-colors ${wishlisted ? 'fill-primary-orange stroke-primary-orange' : 'fill-transparent stroke-white'
                                }`}
                            strokeWidth="2"
                        >
                            <path d="M20.8 4.6c-1.8-1.9-4.7-1.9-6.5 0L12 6.9l-2.3-2.3c-1.8-1.9-4.7-1.9-6.5 0-1.9 1.9-1.9 4.9 0 6.8L12 21l8.8-9.3c1.9-1.9 1.9-4.9 0-6.8z" />
                        </svg>
                    </button>
                )}

                {workshop.categoryName && (
                    <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md bg-white/90 text-[9px] font-bold uppercase tracking-wider text-deep-purple/70">
                        {workshop.categoryName}
                    </span>
                )}
            </div>

            <div className="space-y-2 px-0.5">
                <h3
                    className={`font-serif text-deep-purple leading-snug group-hover:text-primary-orange transition-colors line-clamp-2 ${isCompact ? 'text-[15px] font-medium min-h-[2.5rem]' : 'text-base font-medium min-h-[2.5rem]'
                        }`}
                >
                    {workshop.title}
                </h3>

                <div className="space-y-1.5 pt-0.5">
                    <MetaRow icon={<Star size={14} className="text-primary-orange fill-primary-orange" />}>
                        {workshop.averageRating != null && workshop.reviewCount > 0 ? (
                            <>
                                <span className="font-semibold text-deep-purple">{workshop.averageRating.toFixed(1)}</span>
                                <span className="text-deep-purple/40"> ({workshop.reviewCount})</span>
                            </>
                        ) : (
                            <span className="text-deep-purple/45 italic">New — no reviews yet</span>
                        )}
                    </MetaRow>

                    <MetaRow icon={<Calendar size={14} />}>{formatScheduleHint(workshop)}</MetaRow>

                    <MetaRow icon={<MapPin size={14} />}>{formatLocation(workshop)}</MetaRow>

                    {(capacityLabel || durationLabel) && (
                        <MetaRow icon={<Users size={14} />}>
                            {[capacityLabel, durationLabel].filter(Boolean).join(' · ')}
                        </MetaRow>
                    )}

                    <MetaRow icon={<Ticket size={14} />}>
                        <span className="font-semibold text-deep-purple">
                            {workshop.currency}{' '}
                            {Number(workshop.basePrice).toLocaleString()}
                        </span>
                        <span className="text-deep-purple/40"> / person</span>
                    </MetaRow>
                </div>
            </div>
        </article>
    );
};

export default WorkshopCard;
