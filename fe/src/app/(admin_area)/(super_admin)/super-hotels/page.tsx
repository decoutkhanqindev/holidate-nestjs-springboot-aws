"use client";

import { useState, useEffect } from "react";
import { getHotels } from "@/lib/AdminAPI/hotelService";
import { getProvinces, getCities } from "@/lib/AdminAPI/locationService";
import SuperHotelsTable from "@/components/AdminSuper/hotels/SuperHotelsTable";
import Pagination from "@/components/Admin/pagination/Pagination";
import SuperHotelFormModal from "@/components/AdminSuper/hotels/SuperHotelFormModal";
import type { Hotel } from "@/types";
import { toast } from "react-toastify";
import { PlusIcon } from "@heroicons/react/24/solid";
import { updateHotelActionSuperAdmin } from "@/lib/actions/hotelActions";

const ITEMS_PER_PAGE = 10;

type SortBy = 'created-at' | 'name' | 'updated-at';
type SortDir = 'asc' | 'desc';

// Component PageHeader
function PageHeader({ title, children }: { title: React.ReactNode; children?: React.ReactNode }) {
    return (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-4 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">{title}</h1>
            <div>{children}</div>
        </div>
    );
}

export default function SuperHotelsPage() {
    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
    const [sortBy, setSortBy] = useState<SortBy>('created-at');
    const [sortDir, setSortDir] = useState<SortDir>('desc');
    const [selectedProvinceId, setSelectedProvinceId] = useState<string>('');
    const [selectedCityId, setSelectedCityId] = useState<string>('');
    const [provinces, setProvinces] = useState<Array<{ id: string; name: string }>>([]);
    const [cities, setCities] = useState<Array<{ id: string; name: string }>>([]);
    const [isLoadingLocations, setIsLoadingLocations] = useState(false);

    // Các filter mới
    const [searchName, setSearchName] = useState<string>('');
    const [selectedStarRating, setSelectedStarRating] = useState<number | ''>('');
    const [selectedStatus, setSelectedStatus] = useState<string>('');
    const [minPrice, setMinPrice] = useState<number | ''>('');
    const [maxPrice, setMaxPrice] = useState<number | ''>('');

    // Load provinces một lần khi component mount
    useEffect(() => {
        const loadProvinces = async () => {
            setIsLoadingLocations(true);
            try {
                const provincesData = await getProvinces();
                setProvinces(provincesData);
            } catch (error) {
                // Error loading provinces
            } finally {
                setIsLoadingLocations(false);
            }
        };

        loadProvinces();
    }, []);

    // Load cities khi province được chọn
    useEffect(() => {
        const loadCities = async () => {
            if (!selectedProvinceId || selectedProvinceId.trim() === '') {
                setCities([]);
                setSelectedCityId(''); // Reset city khi không có province
                return;
            }

            setIsLoadingLocations(true);
            try {
                const citiesData = await getCities(selectedProvinceId);
                setCities(citiesData);
                setSelectedCityId(''); // Reset city khi đổi province
            } catch (error) {
                // Error loading cities
            } finally {
                setIsLoadingLocations(false);
            }
        };

        loadCities();
    }, [selectedProvinceId]);

    useEffect(() => {
        let isCancelled = false; // Flag để cancel request nếu component unmount hoặc dependencies thay đổi

        const loadHotels = async () => {
            setIsLoading(true);
            try {
                // Xử lý location filter: ưu tiên cityId, nếu không có thì dùng provinceId
                const cityIdToFilter = selectedCityId && selectedCityId.trim() !== ''
                    ? selectedCityId.trim()
                    : undefined;
                const provinceIdToFilter = !cityIdToFilter && selectedProvinceId && selectedProvinceId.trim() !== ''
                    ? selectedProvinceId.trim()
                    : undefined;

                const response = await getHotels(
                    currentPage,
                    ITEMS_PER_PAGE,
                    cityIdToFilter, // cityId - ưu tiên
                    provinceIdToFilter, // provinceId - chỉ dùng khi không có cityId
                    undefined, // userId/partnerId - không filter theo partner
                    'admin', // roleName
                    sortBy, // sortBy
                    sortDir, // sortDir
                    searchName.trim() || undefined, // name
                    selectedStarRating !== '' ? Number(selectedStarRating) : undefined, // star-rating
                    selectedStatus || undefined, // status
                    undefined, // amenity-ids - removed
                    minPrice !== '' ? Number(minPrice) : undefined, // min-price
                    maxPrice !== '' ? Number(maxPrice) : undefined // max-price
                );

                // Chỉ update state nếu request chưa bị cancel
                if (!isCancelled) {
                    setHotels(response.hotels);
                    setTotalPages(response.totalPages);
                    setTotalItems(response.totalItems);
                }
            } catch (error: any) {
                // Chỉ show error nếu request chưa bị cancel
                if (!isCancelled) {
                    toast.error(error.message || "Không thể tải danh sách khách sạn", {
                        position: "top-right",
                        autoClose: 3000,
                    });
                }
            } finally {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            }
        };

        loadHotels();

        // Cleanup function: đánh dấu request đã bị cancel khi dependencies thay đổi hoặc component unmount
        return () => {
            isCancelled = true;
        };
    }, [currentPage, sortBy, sortDir, selectedProvinceId, selectedCityId, searchName, selectedStarRating, selectedStatus, minPrice, maxPrice]);

    const handlePageChange = (page: number) => {
        // Pagination component trả về page 1-based, cần convert sang 0-based
        setCurrentPage(page - 1);
    };

    const handleEdit = (hotel: Hotel) => {
        setEditingHotel(hotel);
        setIsModalOpen(true);
    };

    const handleHotelStatusChange = async (hotelId: string, newStatus: string) => {
        try {
            const formData = new FormData();
            formData.append('status', newStatus);

            const result = await updateHotelActionSuperAdmin(hotelId, formData);
            if (result?.success) {
                toast.success('Cập nhật trạng thái thành công!', {
                    position: "top-right",
                    autoClose: 2000,
                });

                // Reload data
                const cityIdToFilter = selectedCityId && selectedCityId.trim() !== ''
                    ? selectedCityId.trim()
                    : undefined;
                const provinceIdToFilter = !cityIdToFilter && selectedProvinceId && selectedProvinceId.trim() !== ''
                    ? selectedProvinceId.trim()
                    : undefined;

                const response = await getHotels(
                    currentPage,
                    ITEMS_PER_PAGE,
                    cityIdToFilter,
                    provinceIdToFilter,
                    undefined,
                    'admin',
                    sortBy,
                    sortDir,
                    searchName.trim() || undefined,
                    selectedStarRating !== '' ? Number(selectedStarRating) : undefined,
                    selectedStatus || undefined,
                    undefined,
                    minPrice !== '' ? Number(minPrice) : undefined,
                    maxPrice !== '' ? Number(maxPrice) : undefined
                );
                setHotels(response.hotels);
                setTotalPages(response.totalPages);
                setTotalItems(response.totalItems);
            } else {
                toast.error(result?.error || 'Không thể cập nhật trạng thái. Vui lòng thử lại.', {
                    position: "top-right",
                    autoClose: 3000,
                });
            }
        } catch (error: any) {
            toast.error(error.message || 'Không thể cập nhật trạng thái. Vui lòng thử lại.', {
                position: "top-right",
                autoClose: 3000,
            });
        }
    };

    const handleCreateSuccess = () => {
        setIsModalOpen(false);
        setEditingHotel(null);
        // Reload data - sử dụng lại logic từ useEffect để đảm bảo consistency
        const loadHotels = async () => {
            setIsLoading(true);
            try {
                const cityIdToFilter = selectedCityId && selectedCityId.trim() !== ''
                    ? selectedCityId.trim()
                    : undefined;
                const provinceIdToFilter = !cityIdToFilter && selectedProvinceId && selectedProvinceId.trim() !== ''
                    ? selectedProvinceId.trim()
                    : undefined;

                const response = await getHotels(
                    currentPage,
                    ITEMS_PER_PAGE,
                    cityIdToFilter,
                    provinceIdToFilter,
                    undefined, // không filter theo partner
                    'admin',
                    sortBy,
                    sortDir,
                    searchName.trim() || undefined,
                    selectedStarRating !== '' ? Number(selectedStarRating) : undefined,
                    selectedStatus || undefined,
                    undefined, // amenity-ids - removed
                    minPrice !== '' ? Number(minPrice) : undefined,
                    maxPrice !== '' ? Number(maxPrice) : undefined
                );
                setHotels(response.hotels);
                setTotalPages(response.totalPages);
                setTotalItems(response.totalItems);
            } catch (error: any) {
                toast.error(error.message || "Không thể tải danh sách khách sạn", {
                    position: "top-right",
                    autoClose: 3000,
                });
            } finally {
                setIsLoading(false);
            }
        };
        loadHotels();
    };

    return (
        <div className="p-6 md:p-8">
            <PageHeader title={<span style={{ color: '#2563eb', fontWeight: 700 }}>Quản lý Khách sạn (Hệ thống)</span>}>
                <button
                    onClick={() => {
                        setEditingHotel(null);
                        setIsModalOpen(true);
                    }}
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                >
                    <PlusIcon className="h-5 w-5" />
                    Thêm khách sạn
                </button>
            </PageHeader>

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="text-gray-500">Đang tải danh sách khách sạn...</div>
                </div>
            ) : (
                <>
                    <SuperHotelsTable
                        hotels={hotels}
                        currentPage={currentPage + 1} // Convert sang 1-based cho display
                        totalPages={totalPages}
                        totalItems={totalItems}
                        sortBy={sortBy}
                        sortDir={sortDir}
                        onSortChange={(newSortBy: SortBy, newSortDir: SortDir) => {
                            setSortBy(newSortBy);
                            setSortDir(newSortDir);
                            setCurrentPage(0); // Reset về trang đầu khi sort
                        }}
                        selectedProvinceId={selectedProvinceId}
                        selectedCityId={selectedCityId}
                        onProvinceChange={(provinceId: string) => {
                            setSelectedProvinceId(provinceId);
                            setCurrentPage(0); // Reset về trang đầu khi filter
                        }}
                        onCityChange={(cityId: string) => {
                            setSelectedCityId(cityId);
                            setCurrentPage(0); // Reset về trang đầu khi filter
                        }}
                        provinces={provinces}
                        cities={cities}
                        isLoadingLocations={isLoadingLocations}
                        searchName={searchName}
                        onSearchNameChange={(name: string) => {
                            setSearchName(name);
                            setCurrentPage(0);
                        }}
                        selectedStarRating={selectedStarRating}
                        onStarRatingChange={(rating: number | '') => {
                            setSelectedStarRating(rating);
                            setCurrentPage(0);
                        }}
                        selectedStatus={selectedStatus}
                        onStatusChange={(status: string) => {
                            setSelectedStatus(status);
                            setCurrentPage(0);
                        }}
                        minPrice={minPrice}
                        onMinPriceChange={(price: number | '') => {
                            setMinPrice(price);
                            setCurrentPage(0);
                        }}
                        maxPrice={maxPrice}
                        onMaxPriceChange={(price: number | '') => {
                            setMaxPrice(price);
                            setCurrentPage(0);
                        }}
                        onClearFilters={() => {
                            setSearchName('');
                            setSelectedStarRating('');
                            setSelectedStatus('');
                            setMinPrice('');
                            setMaxPrice('');
                            setSelectedProvinceId('');
                            setSelectedCityId('');
                            setCurrentPage(0);
                        }}
                        onEdit={handleEdit}
                        onHotelStatusChange={handleHotelStatusChange}
                    />
                    {totalPages > 1 && (
                        <div className="mt-4 flex justify-center">
                            <Pagination
                                currentPage={currentPage + 1}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    )}
                </>
            )}

            {/* Modal tạo khách sạn mới */}
            <SuperHotelFormModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingHotel(null);
                }}
                onSuccess={handleCreateSuccess}
                hotel={editingHotel}
            />
        </div>
    );
}

