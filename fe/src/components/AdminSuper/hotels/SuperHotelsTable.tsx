"use client";

import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EyeIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon, FunnelIcon, XMarkIcon, StarIcon } from '@heroicons/react/24/outline';
import type { Hotel, HotelStatus } from '@/types';
import { deleteHotelAction } from '@/lib/actions/hotelActions';
import { toast } from 'react-toastify';

// Component StatusBadge với text tiếng Việt
function StatusBadge({ status }: { status: HotelStatus | string }) {
    // Convert status từ API (lowercase) sang display
    const normalizedStatus = typeof status === 'string' ? status.toUpperCase() : status;
    
    const statusStyles: Record<string, string> = {
        ACTIVE: "bg-green-100 text-green-800",
        PENDING: "bg-yellow-100 text-yellow-800",
        HIDDEN: "bg-gray-100 text-gray-800",
        INACTIVE: "bg-red-100 text-red-800",
        MAINTENANCE: "bg-orange-100 text-orange-800",
        CLOSED: "bg-gray-200 text-gray-700",
    };
    const statusText: Record<string, string> = {
        ACTIVE: "Đang hoạt động",
        PENDING: "Chờ duyệt",
        HIDDEN: "Đã ẩn",
        INACTIVE: "Không hoạt động",
        MAINTENANCE: "Bảo trì",
        CLOSED: "Đã đóng",
    };
    
    const displayStatus = normalizedStatus in statusText ? normalizedStatus : 'ACTIVE';
    
    return (
        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[displayStatus] || statusStyles.ACTIVE}`}>
            {statusText[displayStatus] || statusText.ACTIVE}
        </span>
    );
}

type SortBy = 'created-at' | 'name' | 'updated-at';
type SortDir = 'asc' | 'desc';

interface SuperHotelsTableProps {
    hotels: Hotel[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
    sortBy?: SortBy;
    sortDir?: SortDir;
    onSortChange?: (sortBy: SortBy, sortDir: SortDir) => void;
    selectedProvinceId?: string;
    selectedCityId?: string;
    onProvinceChange?: (provinceId: string) => void;
    onCityChange?: (cityId: string) => void;
    provinces?: Array<{ id: string; name: string }>;
    cities?: Array<{ id: string; name: string }>;
    isLoadingLocations?: boolean;
    searchName?: string;
    onSearchNameChange?: (name: string) => void;
    selectedStarRating?: number | '';
    onStarRatingChange?: (rating: number | '') => void;
    selectedStatus?: string;
    onStatusChange?: (status: string) => void;
    minPrice?: number | '';
    onMinPriceChange?: (price: number | '') => void;
    maxPrice?: number | '';
    onMaxPriceChange?: (price: number | '') => void;
    onClearFilters?: () => void;
    onEdit?: (hotel: Hotel) => void;
    onHotelStatusChange?: (hotelId: string, newStatus: string) => void;
}

export default function SuperHotelsTable({
    hotels,
    currentPage,
    totalPages,
    totalItems,
    sortBy = 'created-at',
    sortDir = 'desc',
    onSortChange,
    selectedProvinceId = '',
    selectedCityId = '',
    onProvinceChange,
    onCityChange,
    provinces = [],
    cities = [],
    isLoadingLocations = false,
    searchName = '',
    onSearchNameChange,
    selectedStarRating = '',
    onStarRatingChange,
    selectedStatus = '',
    onStatusChange,
    minPrice = '',
    onMinPriceChange,
    maxPrice = '',
    onMaxPriceChange,
    onClearFilters,
    onEdit,
    onHotelStatusChange
}: SuperHotelsTableProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Bạn có chắc chắn muốn xóa khách sạn "${name}" không?`)) {
            return;
        }

        setIsDeleting(id);
        try {
            const result = await deleteHotelAction(id);
            if (result?.success) {
                toast.success('Xóa khách sạn thành công!', {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
                // Không cần router.refresh() vì data đã được update qua state
                // router.refresh();
            } else {
                toast.error(result?.error || 'Không thể xóa khách sạn. Vui lòng thử lại.', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            }
        } catch (error: any) {
            toast.error(error.message || 'Không thể xóa khách sạn. Vui lòng thử lại.', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } finally {
            setIsDeleting(null);
        }
    };

    const handleSortChange = (newSortBy: SortBy) => {
        if (onSortChange) {
            // Nếu click vào cùng sortBy, đổi sortDir; nếu khác, reset về desc
            const newSortDir = sortBy === newSortBy && sortDir === 'desc' ? 'asc' : 'desc';
            onSortChange(newSortBy, newSortDir);
        }
    };

    const hasActiveFilters = searchName || selectedStarRating !== '' || selectedStatus || selectedProvinceId || selectedCityId || minPrice !== '' || maxPrice !== '';

    return (
        <div className={`mt-6 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 ${isDeleting ? "opacity-50" : "opacity-100"}`}>
            {/* Filter Section - Redesigned */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                <div className="px-6 py-5">
                    {/* Header với icon */}
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                            <FunnelIcon className="h-5 w-5 text-blue-600" />
                            <h3 className="text-lg font-semibold text-gray-800">Bộ lọc và Tìm kiếm</h3>
                        </div>
                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onClearFilters?.();
                                }}
                                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-700 bg-white hover:bg-red-50 border border-red-300 rounded-lg transition-all shadow-sm hover:shadow"
                            >
                                <XMarkIcon className="h-4 w-4" />
                                Xóa tất cả
                            </button>
                        )}
                    </div>

                    {/* Grid Layout cho Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {/* Search Box */}
                        <div className="lg:col-span-2">
                            <label htmlFor="searchName" className="block text-sm font-medium text-gray-700 mb-1.5">
                                <MagnifyingGlassIcon className="h-4 w-4 inline mr-1.5 text-gray-500" />
                                Tìm kiếm khách sạn
                            </label>
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    id="searchName"
                                    type="text"
                                    value={searchName}
                                    onChange={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        onSearchNameChange?.(e.target.value);
                                    }}
                                    placeholder="Nhập tên khách sạn..."
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all"
                                />
                            </div>
                        </div>

                        {/* Star Rating */}
                        <div>
                            <label htmlFor="starRatingFilter" className="block text-sm font-medium text-gray-700 mb-1.5">
                                <StarIcon className="h-4 w-4 inline mr-1.5 text-yellow-500" />
                                Số sao
                            </label>
                            <select
                                id="starRatingFilter"
                                value={selectedStarRating}
                                onChange={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onStarRatingChange?.(e.target.value === '' ? '' : Number(e.target.value));
                                }}
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all"
                            >
                                <option value="">Tất cả</option>
                                <option value="1">⭐ 1 sao</option>
                                <option value="2">⭐⭐ 2 sao</option>
                                <option value="3">⭐⭐⭐ 3 sao</option>
                                <option value="4">⭐⭐⭐⭐ 4 sao</option>
                                <option value="5">⭐⭐⭐⭐⭐ 5 sao</option>
                            </select>
                        </div>

                        {/* Status */}
                        <div>
                            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1.5">
                                Trạng thái
                            </label>
                            <select
                                id="statusFilter"
                                value={selectedStatus}
                                onChange={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onStatusChange?.(e.target.value);
                                }}
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all"
                            >
                                <option value="">Tất cả</option>
                                <option value="active">🟢 Đang hoạt động</option>
                                <option value="inactive">🔴 Không hoạt động</option>
                                <option value="maintenance">🟡 Bảo trì</option>
                                <option value="closed">⚫ Đã đóng</option>
                            </select>
                        </div>

                        {/* Province */}
                        <div>
                            <label htmlFor="provinceFilter" className="block text-sm font-medium text-gray-700 mb-1.5">
                                Tỉnh/Thành phố
                            </label>
                            <select
                                id="provinceFilter"
                                value={selectedProvinceId}
                                onChange={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onProvinceChange?.(e.target.value);
                                }}
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                                disabled={isLoadingLocations}
                            >
                                <option value="">Tất cả Tỉnh/Thành</option>
                                {provinces.map(province => (
                                    <option key={province.id} value={province.id}>
                                        {province.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* City */}
                        <div>
                            <label htmlFor="cityFilter" className="block text-sm font-medium text-gray-700 mb-1.5">
                                Thành phố
                            </label>
                            <select
                                id="cityFilter"
                                value={selectedCityId}
                                onChange={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onCityChange?.(e.target.value);
                                }}
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                                disabled={isLoadingLocations || !selectedProvinceId || cities.length === 0}
                            >
                                <option value="">Tất cả Thành phố</option>
                                {cities.map(city => (
                                    <option key={city.id} value={city.id}>
                                        {city.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Min Price */}
                        <div>
                            <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 mb-1.5">
                                Giá từ (VND)
                            </label>
                            <input
                                id="minPrice"
                                type="number"
                                value={minPrice}
                                onChange={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onMinPriceChange?.(e.target.value === '' ? '' : Number(e.target.value));
                                }}
                                placeholder="0"
                                min="0"
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all"
                            />
                        </div>

                        {/* Max Price */}
                        <div>
                            <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-1.5">
                                Giá đến (VND)
                            </label>
                            <input
                                id="maxPrice"
                                type="number"
                                value={maxPrice}
                                onChange={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onMaxPriceChange?.(e.target.value === '' ? '' : Number(e.target.value));
                                }}
                                placeholder="Không giới hạn"
                                min="0"
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all"
                            />
                        </div>

                    </div>

                    {/* Sort Controls - Improved */}
                    <div className="mt-5 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-gray-700">Sắp xếp:</span>
                                <select
                                    id="sortBy"
                                    value={sortBy}
                                    onChange={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleSortChange(e.target.value as SortBy);
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all"
                                >
                                    <option value="created-at">Ngày tạo</option>
                                    <option value="name">Tên khách sạn</option>
                                    <option value="updated-at">Ngày cập nhật</option>
                                </select>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        onSortChange?.(sortBy, sortDir === 'asc' ? 'desc' : 'asc');
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm transition-all"
                                    title={sortDir === 'asc' ? 'Tăng dần' : 'Giảm dần'}
                                >
                                    {sortDir === 'asc' ? '↑ Tăng dần' : '↓ Giảm dần'}
                                </button>
                            </div>
                            <div className="text-sm text-gray-600">
                                <span className="font-semibold text-blue-600">{totalItems}</span> khách sạn
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                STT
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                TÊN KHÁCH SẠN
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider" style={{ width: '350px' }}>
                                ĐỊA CHỈ
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                ẢNH
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                TRẠNG THÁI
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                NGÀY TẠO
                            </th>
                            <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                                HÀNH ĐỘNG
                            </th>
                        </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200">
                        {hotels.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                                    Không có khách sạn nào
                                </td>
                            </tr>
                        ) : (
                            hotels.map((hotel, index) => {
                                // Tính STT dựa trên currentPage (1-based)
                                const startIndex = (currentPage - 1) * 10;
                                return (
                                <tr key={hotel.id} className="hover:bg-gray-50 transition-colors duration-200">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {startIndex + index + 1}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div 
                                            className="text-sm font-medium text-gray-900"
                                            style={{
                                                maxWidth: '4.5cm',
                                                width: '4.5cm',
                                                wordBreak: 'break-word',
                                                overflowWrap: 'break-word',
                                                whiteSpace: 'normal'
                                            }}
                                        >
                                            {hotel.name}
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <div
                                            className="break-words"
                                            title={hotel.address}
                                            style={{
                                                maxWidth: '5.5cm',
                                                width: '5.5cm',
                                                wordBreak: 'break-word',
                                                overflowWrap: 'break-word',
                                                whiteSpace: 'normal'
                                            }}
                                        >
                                            {hotel.address}
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {hotel.imageUrl ? (
                                            <div className="flex-shrink-0 h-16 w-24 flex items-center justify-center overflow-hidden rounded-md">
                                                <Image
                                                    className="h-full w-full object-cover"
                                                    src={hotel.imageUrl}
                                                    alt={hotel.name}
                                                    width={96}
                                                    height={64}
                                                    unoptimized
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex-shrink-0 h-16 w-24 flex items-center justify-center bg-gray-100 rounded-md">
                                                <span className="text-xs text-gray-400">No image</span>
                                            </div>
                                        )}
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {onHotelStatusChange ? (() => {
                                            // Convert status từ frontend type (ACTIVE, PENDING, HIDDEN) sang backend format (lowercase)
                                            // Frontend type: ACTIVE, PENDING, HIDDEN
                                            // Backend format: active, inactive, maintenance, closed
                                            const currentStatus = hotel.status?.toUpperCase() || 'ACTIVE';
                                            let mappedStatus = 'active'; // Default
                                            
                                            // Map từ frontend type sang backend format
                                            if (currentStatus === 'ACTIVE') {
                                                mappedStatus = 'active';
                                            } else if (currentStatus === 'HIDDEN') {
                                                mappedStatus = 'inactive';
                                            } else if (currentStatus === 'PENDING') {
                                                mappedStatus = 'maintenance'; // Hoặc có thể là 'closed' tùy logic
                                            }
                                            
                                            // Nếu hotel.status đã là lowercase (từ API mới), dùng trực tiếp
                                            const statusLower = hotel.status?.toLowerCase();
                                            if (statusLower && ['active', 'inactive', 'maintenance', 'closed'].includes(statusLower)) {
                                                mappedStatus = statusLower;
                                            }
                                            
                                            return (
                                                <select
                                                    value={mappedStatus}
                                                    onChange={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        const newStatus = e.target.value;
                                                        if (newStatus !== mappedStatus) {
                                                            onHotelStatusChange(hotel.id, newStatus);
                                                        }
                                                    }}
                                                    className="form-select form-select-sm border border-gray-300 rounded-md px-2 py-1 text-sm"
                                                    style={{ 
                                                        minWidth: '150px',
                                                        cursor: 'pointer'
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                    }}
                                                >
                                                    <option value="active">🟢 Đang hoạt động</option>
                                                    <option value="inactive">🔴 Không hoạt động</option>
                                                    <option value="maintenance">🟡 Bảo trì</option>
                                                    <option value="closed">⚫ Đã đóng</option>
                                                </select>
                                            );
                                        })() : (
                                            hotel.status ? (
                                                <StatusBadge status={hotel.status} />
                                            ) : (
                                                <StatusBadge status="ACTIVE" />
                                            )
                                        )}
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {hotel.createdAt ? (() => {
                                                try {
                                                    const date = new Date(hotel.createdAt);
                                                    return date.toLocaleString('vi-VN', {
                                                        year: 'numeric',
                                                        month: '2-digit',
                                                        day: '2-digit',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    });
                                                } catch (e) {
                                                    return hotel.createdAt;
                                                }
                                            })() : 'N/A'}
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center justify-end gap-x-2">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    router.push(`/super-hotels/${hotel.id}`);
                                                }}
                                                className="inline-flex items-center justify-center p-2 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-lg transition-all shadow-sm hover:shadow"
                                                title="Xem chi tiết"
                                            >
                                                <EyeIcon className="h-5 w-5" />
                                            </button>
                                            {onEdit && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        onEdit(hotel);
                                                    }}
                                                    className="inline-flex items-center justify-center p-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all shadow-sm hover:shadow"
                                                    title="Chỉnh sửa"
                                                >
                                                    <PencilIcon className="h-5 w-5" />
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleDelete(hotel.id, hotel.name);
                                                }}
                                                disabled={isDeleting === hotel.id}
                                                className="inline-flex items-center justify-center p-2 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-lg transition-all shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="Xóa"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

