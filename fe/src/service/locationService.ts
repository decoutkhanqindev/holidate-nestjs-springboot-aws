
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
import axios from 'axios';
import { hotelService, HotelResponse } from './hotelService';
export type LocationType =
    | 'COUNTRY'
    | 'PROVINCE'
    | 'CITY_PROVINCE' // Dành cho thành phố trực thuộc trung ương
    | 'CITY'          // Dành cho thành phố thuộc tỉnh
    | 'DISTRICT'
    | 'WARD'
    | 'STREET'
    | 'HOTEL';

export interface LocationSuggestion {
    id: string;
    name: string;
    type: LocationType;
    description: string;
    hotelCount?: number;
}

const getProvinces = async (name?: string): Promise<any[]> => {
    let url = `${API_BASE_URL}/location/provinces?`;
    if (name) url += `name=${encodeURIComponent(name)}&`;
    try {
        const response = await fetch(url.replace(/&$/, ''), { credentials: 'include' });
        if (!response.ok) return [];
        const json = await response.json();
        return json.data || [];
    } catch (error) { console.error("getProvinces error:", error); return []; }
};

const getCities = async (name?: string): Promise<any[]> => {
    let url = `${API_BASE_URL}/location/cities?`;
    if (name) url += `name=${encodeURIComponent(name)}&`;
    try {
        const response = await fetch(url.replace(/&$/, ''), { credentials: 'include' });
        if (!response.ok) return [];
        const json = await response.json();
        return json.data || [];
    } catch (error) { console.error("getCities error:", error); return []; }
};

const getDistricts = async (name?: string): Promise<any[]> => {
    let url = `${API_BASE_URL}/location/districts?`;
    if (name) url += `name=${encodeURIComponent(name)}&`;
    try {
        const response = await fetch(url.replace(/&$/, ''), { credentials: 'include' });
        if (!response.ok) return [];
        const json = await response.json();
        return json.data || [];
    } catch (error) { console.error("getDistricts error:", error); return []; }
};

const getHotels = async (name?: string): Promise<any[]> => {
    let url = `${API_BASE_URL}/accommodation/hotels`;
    if (name) url += `?name=${encodeURIComponent(name)}`;
    try {
        const response = await fetch(url, { credentials: 'include' });
        if (!response.ok) return [];
        const json = await response.json();
        // API phân trang trả về data.content, API thường trả về data
        return json.data?.content || json.data || [];
    } catch (error) { console.error("getHotels error:", error); return []; }
};

const getHotelsByCity = async (cityName: string): Promise<any[]> => {
    const url = `${API_BASE_URL}/accommodation/hotels?city=${encodeURIComponent(cityName)}`;
    try {
        const response = await fetch(url, { credentials: 'include' });
        if (!response.ok) return [];
        const json = await response.json();
        return json.data?.content || json.data || [];
    } catch (error) { console.error("getHotelsByCity error:", error); return []; }
};


// *** HÀM TÌM KIẾM ĐA NĂNG ĐÃ ĐƯỢC NÂNG CẤP ***
const searchLocations = async ({ query }: { query: string }): Promise<LocationSuggestion[]> => {
    const [
        provinces,
        cities,
        districts,
        hotelsByName,
        hotelsByCity
    ] = await Promise.all([
        getProvinces(query),
        getCities(query),
        getDistricts(query),
        getHotels(query),
        getHotelsByCity(query)
    ]);

    // Gộp tất cả khách sạn tìm được và loại bỏ trùng lặp
    const allFoundHotels = [...hotelsByName, ...hotelsByCity];
    const uniqueHotels = allFoundHotels.reduce((acc, current) => {
        if (current && current.id && !acc.has(current.id)) {
            acc.set(current.id, current);
        }
        return acc;
    }, new Map<string, any>());
    const hotelsDatabase = Array.from(uniqueHotels.values());

    // Xử lý gợi ý địa danh và đếm số khách sạn
    const provinceSuggestions: LocationSuggestion[] = provinces.map((p: any) => {
        const count = hotelsDatabase.filter((h: any) => h.province?.name === p.name).length;
        return {
            id: `province-${p.id}`,
            name: p.name.replace(/^(Tỉnh|Thành phố|Thủ đô)\s/, ''),
            type: p.name.startsWith('Thành phố') || p.name.startsWith('Thủ đô') ? 'CITY_PROVINCE' : 'PROVINCE',
            description: `${p.name}, Việt Nam`,
            hotelCount: p.hotelCount || (count > 0 ? count : undefined)
        };
    });

    const citySuggestions: LocationSuggestion[] = cities.map((c: any) => {
        const count = hotelsDatabase.filter((h: any) => h.city?.name === c.name).length;
        return {
            id: `city-${c.id}`,
            name: c.name.replace('Thành phố ', ''),
            type: 'CITY',
            description: `${c.name}, Việt Nam`,
            hotelCount: c.hotelCount || (count > 0 ? count : undefined)
        };
    });

    const districtSuggestions: LocationSuggestion[] = districts.map((d: any) => {
        const count = hotelsDatabase.filter((h: any) => h.district?.name === d.name).length;
        return {
            id: `district-${d.id}`,
            name: d.name,
            type: d.name.startsWith('Thành phố') ? 'CITY' : 'DISTRICT',
            description: `${d.name}, Việt Nam`,
            hotelCount: d.hotelCount || (count > 0 ? count : undefined)
        };
    });

    // Xử lý gợi ý khách sạn
    const hotelSuggestions: LocationSuggestion[] = hotelsDatabase.map((h: any) => ({
        id: `hotel-${h.id}`,
        name: h.name,
        type: 'HOTEL',
        description: [h.address, h.ward?.name, h.district?.name, h.city?.name].filter(Boolean).join(', ')
    }));

    // Gộp tất cả và sắp xếp
    const allSuggestions = [
        ...provinceSuggestions,
        ...citySuggestions,
        ...districtSuggestions,
        ...hotelSuggestions,
    ];

    allSuggestions.sort((a, b) => {
        if (a.type === 'HOTEL' && b.type !== 'HOTEL') return 1;
        if (a.type !== 'HOTEL' && b.type === 'HOTEL') return -1;
        return (b.hotelCount || 0) - (a.hotelCount || 0);
    });

    return allSuggestions;
};

export const locationService = {
    searchLocations,
    getHotelsByCity,
    getCities,
    getProvinces
};