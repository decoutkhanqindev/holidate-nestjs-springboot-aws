"use client";

import { useState, useEffect, useRef } from "react";
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { PlusIcon } from '@heroicons/react/24/solid';
import { Hotel } from "@/types";
import { getHotels } from "@/lib/AdminAPI/hotelService";
import { getRoomsByHotelId, type PaginatedRoomsResult } from "@/lib/AdminAPI/roomService";
import { getProvinces, getCities, type LocationOption } from "@/lib/AdminAPI/locationService";
import RoomsTable from "@/components/Admin/rooms/RoomsTable";
import { useAuth } from "@/components/Admin/AuthContext_Admin/AuthContextAdmin";

// Component PageHeader để code gọn hơn
function PageHeader({ title, children }: { title: React.ReactNode, children?: React.ReactNode }) {
    return (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-4 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">{title}</h1>
            <div>{children}</div>
        </div>
    );
}

export default function ManageRoomsPage() {
    const { effectiveUser } = useAuth();
    const searchParams = useSearchParams();
    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [selectedHotelId, setSelectedHotelId] = useState<string>('');
    const [roomsData, setRoomsData] = useState<PaginatedRoomsResult | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [isLoadingHotels, setIsLoadingHotels] = useState(true);
    const [isLoadingRooms, setIsLoadingRooms] = useState(false);
    
    // Track filter values để tránh fetch lại không cần thiết
    const [lastFilterCityId, setLastFilterCityId] = useState<string>('');
    const [lastFilterProvinceId, setLastFilterProvinceId] = useState<string>('');
    
    // Ref để track lần fetch cuối cùng - dùng để force refresh khi quay lại từ edit
    const lastFetchTimestamp = useRef<number>(0);

    // State cho location filter
    const [provinces, setProvinces] = useState<LocationOption[]>([]);
    const [cities, setCities] = useState<LocationOption[]>([]);
    const [selectedProvinceId, setSelectedProvinceId] = useState<string>('');
    const [selectedCityId, setSelectedCityId] = useState<string>('');

    // Load provinces và cities
    useEffect(() => {
        const loadLocations = async () => {
            try {
                // Load provinces (lấy tất cả, không filter theo country)
                const provincesData = await getProvinces();
                setProvinces(provincesData);
            } catch (error) {
                console.error("[ManageRoomsPage] Error loading locations:", error);
            }
        };
        loadLocations();
    }, []);

    // Load cities khi chọn province
    useEffect(() => {
        const loadCities = async () => {
            if (!selectedProvinceId) {
                setCities([]);
                setSelectedCityId('');
                return;
            }

            try {
                const citiesData = await getCities(selectedProvinceId);
                setCities(citiesData);
                setSelectedCityId(''); // Reset city khi đổi province
            } catch (error) {
                console.error("[ManageRoomsPage] Error loading cities:", error);
            }
        };
        loadCities();
    }, [selectedProvinceId]);

    // Load danh sách khách sạn (có filter theo location)
    useEffect(() => {
        // Ưu tiên cityId trước, nếu không có thì dùng provinceId
        let filterCityId: string | undefined = undefined;
        let filterProvinceId: string | undefined = undefined;
        
        if (selectedCityId && selectedCityId.trim() !== '') {
            filterCityId = selectedCityId.trim();
            filterProvinceId = undefined;
        } else if (selectedProvinceId && selectedProvinceId.trim() !== '') {
            filterProvinceId = selectedProvinceId.trim();
        }
        
        // Kiểm tra xem filter có thay đổi không
        const filterChanged = 
            (filterCityId || '') !== lastFilterCityId ||
            (filterProvinceId || '') !== lastFilterProvinceId;
        
        if (!filterChanged && hotels.length > 0) {
            // Filter không đổi và đã có data, không cần fetch lại
            console.log("[ManageRoomsPage] Filter không đổi, bỏ qua fetch hotels");
            return;
        }
        
        const fetchHotels = async () => {
            try {
                setIsLoadingHotels(true);
                
                console.log("[ManageRoomsPage] Fetching hotels with filter:", {
                    cityId: filterCityId,
                    provinceId: filterProvinceId,
                    selectedCityId,
                    selectedProvinceId,
                    filterChanged
                });
                
                // Lấy userId và role từ AuthContext để filter theo owner nếu role là PARTNER
                const userId = effectiveUser?.id;
                const roleName = effectiveUser?.role?.name;
                
                console.log("[ManageRoomsPage] User info (effectiveUser):", { userId, roleName });
                
                // Lấy hotels với filter (nếu role là PARTNER, backend sẽ tự động filter theo owner từ JWT token)
                const paginatedData = await getHotels(
                    0, 
                    1000,
                    filterCityId,
                    filterProvinceId,
                    userId, // Truyền userId để log
                    roleName // Truyền roleName để log
                );
                
                console.log("[ManageRoomsPage] Received hotels:", paginatedData.hotels.length);
                console.log("[ManageRoomsPage] Hotel names:", paginatedData.hotels.map(h => h.name).slice(0, 5));
                
                // Update filter tracking
                setLastFilterCityId(filterCityId || '');
                setLastFilterProvinceId(filterProvinceId || '');
                
                // Lưu hotels vào state
                setHotels(paginatedData.hotels);
                
                // Chỉ reset và chọn hotel đầu tiên nếu:
                // 1. Chưa có hotel nào được chọn HOẶC
                // 2. Hotel hiện tại không còn trong danh sách filtered
                const currentHotelExists = selectedHotelId && paginatedData.hotels.some(h => h.id === selectedHotelId);
                
                if (!currentHotelExists) {
                    // Reset hotel khi filter thay đổi
                    setSelectedHotelId('');
                    // Tự động chọn hotel đầu tiên nếu có
                    if (paginatedData.hotels.length > 0) {
                        setSelectedHotelId(paginatedData.hotels[0].id);
                    }
                }
            } catch (error) {
                console.error("[ManageRoomsPage] Error fetching hotels:", error);
            } finally {
                setIsLoadingHotels(false);
            }
        };
        fetchHotels();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedProvinceId, selectedCityId]); // Chỉ trigger khi filter thay đổi

    // Load danh sách phòng khi chọn hotel
    useEffect(() => {
        if (!selectedHotelId) return;

        // Kiểm tra nếu có query param refresh=1 (từ edit page redirect)
        const shouldRefresh = searchParams.get('refresh') === '1';
        const now = Date.now();
        
        // Nếu có refresh param hoặc đã quá 5 giây từ lần fetch cuối, force refresh
        if (shouldRefresh || (now - lastFetchTimestamp.current) > 5000) {
            console.log("[ManageRoomsPage] Force refreshing rooms data", { shouldRefresh, timeSinceLastFetch: now - lastFetchTimestamp.current });
        }

        const fetchRooms = async () => {
            try {
                setIsLoadingRooms(true);
                console.log("[ManageRoomsPage] Fetching rooms for hotel:", selectedHotelId, "page:", currentPage, "refresh:", shouldRefresh);
                const data = await getRoomsByHotelId(selectedHotelId, currentPage, 10);
                console.log("[ManageRoomsPage] Received rooms data:", {
                    totalRooms: data.rooms.length,
                    sampleRoom: data.rooms[0] ? {
                        id: data.rooms[0].id,
                        name: data.rooms[0].name,
                        quantity: data.rooms[0].quantity,
                        availableQuantity: data.rooms[0].availableQuantity
                    } : null
                });
                setRoomsData(data);
                lastFetchTimestamp.current = Date.now();
                
                // Xóa refresh param sau khi đã refresh
                if (shouldRefresh) {
                    const url = new URL(window.location.href);
                    url.searchParams.delete('refresh');
                    window.history.replaceState({}, '', url.toString());
                }
            } catch (error) {
                console.error("[ManageRoomsPage] Error fetching rooms:", error);
            } finally {
                setIsLoadingRooms(false);
            }
        };
        fetchRooms();
    }, [selectedHotelId, currentPage, searchParams]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    return (
        <div className="p-6 md:p-8">
            <PageHeader title={<span style={{ color: '#2563eb', fontWeight: 700 }}>Quản lý Phòng</span>}>
                <Link
                    href={selectedHotelId ? `/admin-rooms/new?hotelId=${selectedHotelId}` : '#'}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all ${
                        selectedHotelId 
                            ? 'bg-blue-600 text-white hover:bg-blue-700' 
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                    <PlusIcon className="h-5 w-5" />
                    Thêm phòng mới
                </Link>
            </PageHeader>

            <div className="bg-white p-6 rounded-lg shadow-md">
                {/* Filter theo Tỉnh/Thành phố */}
                <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="province-select" className="block text-sm font-medium text-gray-700 mb-2">
                            Tỉnh/Thành phố:
                        </label>
                        <select
                            id="province-select"
                            value={selectedProvinceId}
                            onChange={(e) => {
                                setSelectedProvinceId(e.target.value);
                                setSelectedCityId(''); // Reset city
                                // Reset hotel sẽ được handle trong useEffect
                            }}
                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                            <option value="">-- Tất cả tỉnh/thành phố --</option>
                            {provinces.map(province => (
                                <option key={province.id} value={province.id}>{province.name}</option>
                            ))}
                        </select>
                        {selectedProvinceId && !selectedCityId && (
                            <p className="mt-1 text-xs text-blue-600">
                                Đang lọc theo: {provinces.find(p => p.id === selectedProvinceId)?.name}
                            </p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="city-select" className="block text-sm font-medium text-gray-700 mb-2">
                            Thành phố/Quận:
                        </label>
                        <select
                            id="city-select"
                            value={selectedCityId}
                            onChange={(e) => {
                                setSelectedCityId(e.target.value);
                                // Reset hotel khi đổi city (sẽ tự động load lại hotels)
                            }}
                            disabled={!selectedProvinceId}
                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md disabled:bg-gray-100"
                        >
                            <option value="">-- Tất cả thành phố/quận --</option>
                            {cities.map(city => (
                                <option key={city.id} value={city.id}>{city.name}</option>
                            ))}
                        </select>
                        {selectedCityId && (
                            <p className="mt-1 text-xs text-blue-600">
                                Đang lọc theo: {cities.find(c => c.id === selectedCityId)?.name}
                            </p>
                        )}
                    </div>
                </div>

                {/* Chọn khách sạn */}
                <div className="mb-6">
                    <label htmlFor="hotel-select" className="block text-sm font-medium text-gray-700 mb-2">
                        Chọn khách sạn để quản lý phòng:
                    </label>
                    {isLoadingHotels ? (
                        <div className="block w-full max-w-sm pl-3 pr-10 py-2 text-base border-gray-300 bg-gray-100 rounded-md text-gray-500">
                            Đang tải danh sách khách sạn...
                        </div>
                    ) : hotels.length === 0 ? (
                        <div className="block w-full max-w-sm pl-3 pr-10 py-2 text-base border-yellow-300 bg-yellow-50 rounded-md text-yellow-700">
                            {selectedProvinceId || selectedCityId 
                                ? `Không tìm thấy khách sạn nào ở ${selectedCityId ? cities.find(c => c.id === selectedCityId)?.name || 'thành phố đã chọn' : provinces.find(p => p.id === selectedProvinceId)?.name || 'tỉnh đã chọn'}`
                                : 'Chưa có khách sạn nào trong hệ thống'}
                        </div>
                    ) : (
                        <div>
                            <select
                                id="hotel-select"
                                value={selectedHotelId}
                                onChange={(e) => {
                                    setSelectedHotelId(e.target.value);
                                    setCurrentPage(0); // Reset về trang đầu khi đổi hotel
                                }}
                                className="block w-full max-w-sm pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                            >
                                <option value="">-- Chọn khách sạn --</option>
                                {hotels.map(hotel => (
                                    <option key={hotel.id} value={hotel.id}>{hotel.name}</option>
                                ))}
                            </select>
                            {hotels.length > 0 && (
                                <p className="mt-1 text-xs text-gray-500">
                                    Tìm thấy {hotels.length} khách sạn
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {selectedHotelId && (
                    <>
                        {isLoadingRooms ? (
                            <div className="text-center py-8 text-gray-500">Đang tải danh sách phòng...</div>
                        ) : roomsData ? (
                            <RoomsTable
                                rooms={roomsData.rooms}
                                hotelId={selectedHotelId}
                                currentPage={roomsData.page + 1}
                                totalPages={roomsData.totalPages}
                                totalItems={roomsData.totalItems}
                                onPageChange={handlePageChange}
                                onRefresh={() => {
                                    // Force refresh rooms data
                                    const fetchRooms = async () => {
                                        try {
                                            setIsLoadingRooms(true);
                                            const data = await getRoomsByHotelId(selectedHotelId, currentPage, 10);
                                            setRoomsData(data);
                                            lastFetchTimestamp.current = Date.now();
                                        } catch (error) {
                                            console.error("[ManageRoomsPage] Error refreshing rooms:", error);
                                        } finally {
                                            setIsLoadingRooms(false);
                                        }
                                    };
                                    fetchRooms();
                                }}
                            />
                        ) : (
                            <div className="text-center py-8 text-gray-500">Không có phòng nào</div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}