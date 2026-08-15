/**
 * Utility functions for Location / Area formatting and normalization.
 */

/**
 * Default 11 Predefined Areas requested by the user:
 */
export const PREDEFINED_AREAS = [
    'Madinaty',
    'Sheraton',
    'New Cairo',
    'North Coast',
    'New Capital',
    'Sidi Abdelrhman',
    'October',
    'Ras Alhekma',
    'Mostakbal City',
    'Maadi',
    '6th Settlement',
];

/**
 * Known location mappings for standard capitalization and spacing.
 */
const LOCATION_MAPPINGS: Record<string, string> = {
    'madinaty': 'Madinaty',
    'sheraton': 'Sheraton',
    'new cairo': 'New Cairo',
    'north coast': 'North Coast',
    'northcoast': 'North Coast',
    'new capital': 'New Capital',
    'sidi abdelrhman': 'Sidi Abdelrhman',
    'sidi abdelrahman': 'Sidi Abdelrhman',
    'october': 'October',
    '6th of october': 'October',
    'ras alhekma': 'Ras Alhekma',
    'ras el hekma': 'Ras Alhekma',
    'ras elhekma': 'Ras Alhekma',
    'mostakbal city': 'Mostakbal City',
    'al mostakbal': 'Mostakbal City',
    'maadi': 'Maadi',
    '6th settlement': '6th Settlement',
    'sheikh zayed': 'Sheikh Zayed',
    'zayed': 'Sheikh Zayed',
    'ain sokhna': 'Ain Sokhna',
    'sokhna': 'Ain Sokhna',
    'el gouna': 'El Gouna',
    'gouna': 'El Gouna',
};

/**
 * Format any location string into standard Title Case format.
 * Examples:
 *  - "new cairo" -> "New Cairo"
 *  - "northcoast" -> "North Coast"
 *  - "sidi abdelrhman" -> "Sidi Abdelrhman"
 */
export function formatLocationName(rawName: string): string {
    if (!rawName) return '';
    
    const trimmed = rawName.trim().replace(/\s+/g, ' ');
    const lower = trimmed.toLowerCase();
    
    // Check known dictionary first
    if (LOCATION_MAPPINGS[lower]) {
        return LOCATION_MAPPINGS[lower];
    }

    // Default Title Case conversion
    return trimmed
        .split(' ')
        .map((word) => {
            if (!word) return '';
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(' ');
}

/**
 * Format developer name into standard Title Case format.
 * Examples:
 *  - "kleek" -> "Kleek"
 *  - "margins developments" -> "Margins Developments"
 *  - "hyde park" -> "Hyde Park"
 */
export function formatDeveloperName(rawName: string): string {
    if (!rawName) return '';
    
    const trimmed = rawName.trim().replace(/\s+/g, ' ');
    return trimmed
        .split(' ')
        .map((word) => {
            if (!word) return '';
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(' ');
}

/**
 * Deduplicate, format, and sort an array of raw location strings.
 */
export function normalizeLocationList(rawLocations: (string | undefined | null)[]): string[] {
    const set = new Set<string>();
    
    // Add default predefined areas first
    for (const area of PREDEFINED_AREAS) {
        set.add(area);
    }

    for (const loc of rawLocations) {
        if (loc && typeof loc === 'string') {
            const formatted = formatLocationName(loc);
            if (formatted) {
                set.add(formatted);
            }
        }
    }

    return Array.from(set).sort((a, b) => a.localeCompare(b));
}
