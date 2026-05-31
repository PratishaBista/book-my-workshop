export function parseApiDateTime(iso: string | undefined | null): Date {
    if (!iso) return new Date(Number.NaN);
    const trimmed = iso.trim();
    if (!trimmed) return new Date(Number.NaN);
    if (trimmed.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(trimmed)) {
        return new Date(trimmed);
    }
    return new Date(`${trimmed}Z`);
}

export function formatWorkshopDate(
    iso: string,
    options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' }
): string {
    return parseApiDateTime(iso).toLocaleDateString(undefined, options);
}

export function formatWorkshopTime(iso: string): string {
    return parseApiDateTime(iso).toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
    });
}

/** Local calendar date key YYYY-MM-DD for grouping/filtering slots. */
export function workshopDateKey(iso: string): string {
    const d = parseApiDateTime(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

export function formatWorkshopDateTimeRange(startIso: string, endIso: string): string {
    return `${formatWorkshopTime(startIso)} – ${formatWorkshopTime(endIso)}`;
}
