// src/types/location.ts
export type LocationType =
    | 'COUNTRY'
    | 'PROVINCE'
    | 'CITY'
    | 'DISTRICT'
    | 'WARD'
    | 'STREET'
    | 'HOTEL';

export interface LocationSuggestion {
    id: string;
    name: string;
    type: LocationType;
    description?: string;
}
