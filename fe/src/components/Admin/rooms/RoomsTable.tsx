"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useTransition, useEffect, useState, useCallback } from 'react';
import { EyeIcon, PencilIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon, XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import type { Room } from '@/types';
import { deleteRoomAction } from '@/lib/actions/roomActions';
import { getTodayInventoriesForRooms, createRoomInventory, type RoomInventory } from '@/lib/AdminAPI/roomInventoryService';

interface RoomsTableProps {
    rooms: Room[];
    hotelId: string;
    currentPage: number;
    totalPages: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onRefresh?: () => void; // Callback để refresh data sau khi update status
}

// Component Pagination
function Pagination({ currentPage, totalPages, onPageChange }: { currentPage: number; totalPages: number; onPageChange: (page: number) => void }) {
    if (totalPages <= 1) return null;

    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 2); // Convert từ 1-based sang 0-based
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage); // Convert từ 1-based sang 0-based
        }
    };

    return (
        <div className="flex items-center justify-between mt-6 px-6 py-4 bg-white border-t border-gray-200">
            <div className="text-sm text-gray-700">
                Trang {currentPage} / {totalPages}
            </div>
            <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className="sr-only">Previous</span>
                    <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                </button>

                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    {currentPage} / {totalPages}
                </span>

                <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className="sr-only">Next</span>
                    <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                </button>
            </nav>
        </div>
    );
}

// Component StatusDropdown - Cho phép thay đổi status trực tiếp trong bảng
function StatusDropdown({
    roomId,
    currentStatus,
    onStatusChange
}: {
    roomId: string;
    currentStatus: Room['status'];
    onStatusChange?: () => void;
}) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [status, setStatus] = useState<Room['status']>(currentStatus);

    // Sync status khi currentStatus thay đổi (từ parent)
    useEffect(() => {
        setStatus(currentStatus);
    }, [currentStatus]);

    // Map status từ frontend (uppercase) sang backend (lowercase)
    // Theo API docs: active, inactive, maintenance, closed
    const statusMap: Record<string, string> = {
        'AVAILABLE': 'active',      // Hoạt động - available for bookings
        'INACTIVE': 'inactive',      // Ngưng hoạt động - not available for new bookings
        'MAINTENANCE': 'maintenance', // Bảo trì - under maintenance
        'CLOSED': 'closed'           // Đóng cửa - closed
    };

    const statusStyles: Record<Room['status'], string> = {
        AVAILABLE: "bg-green-600 text-white border-green-600",     // Hoạt động - xanh lá
        INACTIVE: "bg-gray-500 text-white border-gray-500",        // Ngưng hoạt động - xám
        MAINTENANCE: "bg-yellow-500 text-white border-yellow-500", // Bảo trì - vàng
        CLOSED: "bg-red-600 text-white border-red-600",            // Đóng cửa - đỏ
        // OCCUPIED được giữ lại để backward compatibility, nhưng không hiển thị trong dropdown
        OCCUPIED: "bg-orange-600 text-white border-orange-600",    // Đã thuê (legacy - không dùng nữa)
    };

    const handleStatusChange = async (newStatus: Room['status']) => {
        if (newStatus === status || isUpdating) return;

        setIsUpdating(true);
        try {
            // Gọi API update status (dùng client version vì đây là client component)
            const { updateRoom } = await import('@/lib/AdminAPI/roomService');
            await updateRoom(roomId, { status: statusMap[newStatus] || newStatus.toLowerCase() });

            // QUAN TRỌNG: Nếu set status = ACTIVE (AVAILABLE), tự động tạo room inventory cho 90 ngày tới
            // Điều này đảm bảo room có thể được đặt phòng ngay sau khi kích hoạt
            if (newStatus === 'AVAILABLE') {
                try {
                    const { createRoomInventory } = await import('@/lib/AdminAPI/roomInventoryService');
                    
                    // Tạo inventory cho 90 ngày (đủ để user đặt phòng)
                    await createRoomInventory({
                        roomId: roomId,
                        days: 90
                    });
                    
                } catch (inventoryError: any) {
                    // Nếu inventory đã tồn tại (409 conflict), đó là OK - không cần tạo lại
                    if (inventoryError.response?.status === 409 || inventoryError.message?.includes('already exists')) {
                    } else {
                        // Nếu là lỗi khác, log nhưng không block việc update status
                        const { toast } = await import('react-toastify');
                        toast.warning('Đã cập nhật trạng thái, nhưng không thể tạo inventory. Vui lòng tạo inventory thủ công để phòng có thể được đặt.', {
                            position: "top-right",
                            autoClose: 4000,
                        });
                    }
                }
            }

            setStatus(newStatus);

            // Hiển thị toast notification
            const { toast } = await import('react-toastify');
            toast.success('Cập nhật trạng thái thành công!', {
                position: "top-right",
                autoClose: 2000,
            });

            if (onStatusChange) {
                onStatusChange();
            }
        } catch (error: any) {
            const { toast } = await import('react-toastify');
            toast.error('Không thể cập nhật trạng thái: ' + (error.message || 'Lỗi không xác định'), {
                position: "top-right",
                autoClose: 3000,
            });
            // Revert status nếu có lỗi
            setStatus(currentStatus);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value as Room['status'])}
            disabled={isUpdating}
            className={`px-1.5 py-0.5 text-xs font-semibold rounded-md border cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 ${statusStyles[status] || 'bg-gray-500 text-white border-gray-500'
                } ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}`}
            style={{
                appearance: 'none',
                backgroundImage: isUpdating
                    ? 'none'
                    : `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.25rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '0.9em 0.9em',
                paddingRight: '1.5rem',
                minWidth: '80px',
                fontSize: '11px'
            }}
        >
            <option value="AVAILABLE">Hoạt động</option>
            <option value="INACTIVE">Ngưng hoạt động</option>
            <option value="MAINTENANCE">Bảo trì</option>
            <option value="CLOSED">Đóng cửa</option>
        </select>
    );
}

export default function RoomsTable({ rooms, hotelId, currentPage, totalPages, totalItems, onPageChange, onRefresh }: RoomsTableProps) {
    const [isPending, startTransition] = useTransition();
    const [inventories, setInventories] = useState<Map<string, RoomInventory>>(new Map());
    const [isLoadingInventories, setIsLoadingInventories] = useState(false);

    // State cho image gallery
    const [showImageGallery, setShowImageGallery] = useState(false);
    const [selectedRoomImages, setSelectedRoomImages] = useState<string[]>([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // State cho amenities dropdown
    const [showAmenitiesModal, setShowAmenitiesModal] = useState(false);
    const [selectedRoomAmenities, setSelectedRoomAmenities] = useState<Array<{ id: string; name: string }>>([]);
    const [selectedRoomName, setSelectedRoomName] = useState('');

    // State cho create inventory
    const [creatingInventoryForRoomId, setCreatingInventoryForRoomId] = useState<string | null>(null);

    // Fetch inventories cho tất cả rooms khi rooms thay đổi
    useEffect(() => {
        const fetchInventories = async () => {
            if (rooms.length === 0) {
                setInventories(new Map());
                return;
            }

            try {
                setIsLoadingInventories(true);
                const roomIds = rooms.map(room => room.id);
                const inventoryMap = await getTodayInventoriesForRooms(roomIds);
                setInventories(inventoryMap);
            } catch (error) {
            } finally {
                setIsLoadingInventories(false);
            }
        };

        fetchInventories();
    }, [rooms]);

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Bạn có chắc chắn muốn xóa phòng "${name}" không?`)) {
            return;
        }

        startTransition(async () => {
            try {
                await deleteRoomAction(id);
                
                // Hiển thị toast thành công
                const { toast } = await import('react-toastify');
                toast.success('Xóa phòng thành công!', {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });

                // Refresh data thay vì reload toàn trang
                if (onRefresh) {
                    onRefresh();
                } else {
                    // Fallback: reload trang nếu không có callback
                    window.location.reload();
                }
            } catch (error: any) {
                
                // Hiển thị toast lỗi
                const { toast } = await import('react-toastify');
                toast.error(error.message || 'Không thể xóa phòng. Vui lòng thử lại.', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            }
        });
    };

    // Handle click ảnh để mở gallery
    const handleImageClick = (room: Room) => {
        const allImages = room.images && room.images.length > 0 ? room.images : (room.image ? [room.image] : []);
        if (allImages.length === 0) return;
        setSelectedRoomImages(allImages);
        setCurrentImageIndex(0);
        setShowImageGallery(true);
    };

    // Navigation cho image gallery - phải định nghĩa trước useEffect
    const handlePrevImage = useCallback(() => {
        setCurrentImageIndex((prev) => {
            if (selectedRoomImages.length === 0) return 0;
            return prev > 0 ? prev - 1 : selectedRoomImages.length - 1;
        });
    }, [selectedRoomImages.length]);

    const handleNextImage = useCallback(() => {
        setCurrentImageIndex((prev) => {
            if (selectedRoomImages.length === 0) return 0;
            return prev < selectedRoomImages.length - 1 ? prev + 1 : 0;
        });
    }, [selectedRoomImages.length]);

    // Keyboard navigation cho image gallery - sau khi đã định nghĩa handlePrevImage và handleNextImage
    useEffect(() => {
        if (!showImageGallery) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setShowImageGallery(false);
            } else if (e.key === 'ArrowLeft') {
                handlePrevImage();
            } else if (e.key === 'ArrowRight') {
                handleNextImage();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showImageGallery, handlePrevImage, handleNextImage]);

    // Handle click amenities để mở modal
    const handleAmenitiesClick = (room: Room) => {
        setSelectedRoomAmenities(room.amenities || []);
        setSelectedRoomName(room.name);
        setShowAmenitiesModal(true);
    };

    // Handle tạo inventory cho room
    const handleCreateInventory = async (roomId: string, roomName: string) => {
        if (!confirm(`Bạn có chắc chắn muốn tạo inventory cho phòng "${roomName}"? Inventory sẽ được tạo cho 90 ngày tới (từ hôm nay).`)) {
            return;
        }

        setCreatingInventoryForRoomId(roomId);
        try {
            await createRoomInventory({
                roomId: roomId,
                days: 90 // Tạo inventory cho 90 ngày tới
            });

            const { toast } = await import('react-toastify');
            toast.success('Đã tạo inventory thành công cho 90 ngày!', {
                position: "top-right",
                autoClose: 3000,
            });

            // Refresh inventories và rooms
            if (onRefresh) {
                onRefresh();
            } else {
                window.location.reload();
            }
        } catch (error: any) {
            const { toast } = await import('react-toastify');
            
            let errorMessage = 'Không thể tạo inventory.';
            if (error.message?.includes('already exists') || error.response?.status === 409) {
                errorMessage = 'Inventory đã tồn tại cho một số ngày. Hệ thống sẽ tạo thêm inventory cho các ngày còn thiếu.';
                // Vẫn hiển thị warning nhưng không phải lỗi
                toast.warning(errorMessage, {
                    position: "top-right",
                    autoClose: 3000,
                });
                // Refresh để cập nhật inventory
                if (onRefresh) {
                    onRefresh();
                }
            } else {
                toast.error(errorMessage + ' ' + (error.message || ''), {
                    position: "top-right",
                    autoClose: 4000,
                });
            }
        } finally {
            setCreatingInventoryForRoomId(null);
        }
    };

    // Tính STT dựa trên currentPage (1-based)
    const startIndex = (currentPage - 1) * 10;

    return (
        <div className={`mt-6 bg-white rounded-lg shadow-md overflow-hidden transition-opacity ${isPending ? "opacity-50" : "opacity-100"}`}>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                                STT
                            </th>
                            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '142px' }}>
                                TÊN PHÒNG
                            </th>
                            <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '81px' }}>
                                ẢNH
                            </th>
                            <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '58px' }}>
                                LOẠI
                            </th>
                            <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '71px' }}>
                                GIÁ ĐÊM
                            </th>
                            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                                SỐ LƯỢNG
                            </th>
                            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '202px' }}>
                                TIỆN ÍCH
                            </th>
                            <th scope="col" className="px-1 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '90px' }}>
                                TRẠNG THÁI
                            </th>
                            <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                                HÀNH ĐỘNG
                            </th>
                        </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200">
                        {rooms.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="px-6 py-8 text-center text-sm text-gray-500">
                                    Không có phòng nào
                                </td>
                            </tr>
                        ) : (
                            rooms.map((room, index) => (
                                <tr key={room.id} className="hover:bg-gray-50 transition-colors duration-200">
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{startIndex + index + 1}</div>
                                    </td>
                                    <td className="px-3 py-4">
                                        <div className="text-sm font-medium text-gray-900">{room.name}</div>
                                    </td>
                                    <td className="px-2 py-4 whitespace-nowrap">
                                        {room.image ? (
                                            <div
                                                className="flex-shrink-0 h-20 flex items-center justify-center overflow-hidden rounded-md border border-gray-200 shadow-sm group relative cursor-pointer hover:border-blue-400 transition-all"
                                                style={{ width: '75px' }}
                                                onClick={() => handleImageClick(room)}
                                                title="Click để xem ảnh"
                                            >
                                                <Image
                                                    className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                                                    src={room.image}
                                                    alt={room.name}
                                                    width={75}
                                                    height={80}
                                                    unoptimized
                                                />
                                                {room.images && room.images.length > 1 && (
                                                    <div className="absolute bottom-1 right-1 bg-black bg-opacity-60 text-white text-xs px-1.5 py-0.5 rounded">
                                                        +{room.images.length - 1}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex-shrink-0 h-20 flex items-center justify-center bg-gray-100 rounded-md border border-gray-200" style={{ width: '75px' }}>
                                                <span className="text-xs text-gray-400">Không có ảnh</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-2 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-600">{room.type || 'N/A'}</div>
                                    </td>
                                    <td className="px-2 py-4 whitespace-nowrap">
                                        <div className="text-sm text-left">
                                            {(() => {
                                                const basePrice = room.basePricePerNight ?? room.price ?? 0;
                                                const currentPrice = room.currentPricePerNight ?? basePrice;
                                                const hasDiscount = basePrice > currentPrice && basePrice > 0 && currentPrice > 0;
                                                const discountPercentage = hasDiscount ? Math.round((1 - currentPrice / basePrice) * 100) : 0;
                                                
                                                return (
                                                    <div className="space-y-1">
                                                        {hasDiscount && (
                                                            <div className="flex items-center gap-1">
                                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-800 border border-green-300">
                                                                    -{discountPercentage}%
                                                                </span>
                                                                <span className="text-xs text-gray-500 line-through">
                                                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(basePrice)}
                                                                </span>
                                                            </div>
                                                        )}
                                                        <div className="text-gray-900 font-medium">
                                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentPrice)}
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        <div className="flex flex-col gap-1">
                                            {/* Tổng số lượng phòng */}
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                                                Tổng: {room.quantity || 0} phòng
                                            </span>
                                            {/* Số lượng tồn - ưu tiên từ room.availableQuantity, nếu không có thì dùng inventory */}
                                            {room.availableQuantity !== undefined ? (
                                                (() => {
                                                    const availableQty = room.availableQuantity;
                                                    const isLowStock = availableQty <= 2;
                                                    return (
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${isLowStock
                                                            ? 'bg-red-50 text-red-700 border-red-200'
                                                            : 'bg-green-50 text-green-700 border-green-200'
                                                            }`}>
                                                            Tồn: {availableQty} phòng
                                                        </span>
                                                    );
                                                })()
                                            ) : isLoadingInventories ? (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-yellow-50 text-yellow-600 border border-yellow-200">
                                                    Đang tải...
                                                </span>
                                            ) : inventories.has(room.id) ? (
                                                (() => {
                                                    const inventory = inventories.get(room.id)!;
                                                    const availableQty = inventory.availableQuantity || 0;
                                                    const isLowStock = availableQty <= 2;
                                                    return (
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${isLowStock
                                                            ? 'bg-red-50 text-red-700 border-red-200'
                                                            : 'bg-green-50 text-green-700 border-green-200'
                                                            }`}>
                                                            Tồn: {availableQty} phòng
                                                        </span>
                                                    );
                                                })()
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-500 border border-gray-200">
                                                    Chưa có dữ liệu
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-3 py-4">
                                        <div className="flex flex-wrap gap-1.5" style={{ maxWidth: '202px' }}>
                                            {room.amenities && room.amenities.length > 0 ? (
                                                <>
                                                    {room.amenities.slice(0, 3).map((amenity) => (
                                                        <span
                                                            key={amenity.id}
                                                            className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 whitespace-nowrap leading-tight"
                                                            title={amenity.name}
                                                        >
                                                            {amenity.name}
                                                        </span>
                                                    ))}
                                                    {room.amenities.length > 3 && (
                                                        <button
                                                            onClick={() => handleAmenitiesClick(room)}
                                                            className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 cursor-pointer transition-colors whitespace-nowrap leading-tight"
                                                            title="Click để xem tất cả tiện ích"
                                                        >
                                                            +{room.amenities.length - 3} tiện ích
                                                        </button>
                                                    )}
                                                </>
                                            ) : (
                                                <span className="text-xs text-gray-400">Không có</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-1 py-4 whitespace-nowrap text-center">
                                        <div className="flex justify-center">
                                            <StatusDropdown
                                                roomId={room.id}
                                                currentStatus={room.status}
                                                onStatusChange={() => {
                                                    // Refresh data nếu có callback
                                                    if (onRefresh) {
                                                        onRefresh();
                                                    } else {
                                                        // Fallback: reload trang
                                                        window.location.reload();
                                                    }
                                                }}
                                            />
                                        </div>
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center justify-end gap-x-2">
                                            <Link
                                                href={`/admin-rooms/${room.id}`}
                                                className="p-2 bg-gray-100 text-green-600 hover:bg-gray-200 rounded-md transition-colors"
                                                title="Xem chi tiết"
                                            >
                                                <EyeIcon className="h-5 w-5" />
                                            </Link>
                                            <Link
                                                href={`/admin-rooms/${room.id}`}
                                                className="p-2 bg-gray-100 text-blue-600 hover:bg-gray-200 rounded-md transition-colors"
                                                title="Chỉnh sửa"
                                            >
                                                <PencilIcon className="h-5 w-5" />
                                            </Link>
                                            <button
                                                onClick={() => handleCreateInventory(room.id, room.name)}
                                                disabled={isPending || creatingInventoryForRoomId === room.id}
                                                className="p-2 bg-gray-100 text-purple-600 hover:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-100 rounded-md transition-colors"
                                                title="Tạo inventory cho 90 ngày tới"
                                            >
                                                {creatingInventoryForRoomId === room.id ? (
                                                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                ) : (
                                                    <PlusIcon className="h-5 w-5" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(room.id, room.name)}
                                                disabled={isPending}
                                                className="p-2 bg-gray-100 text-red-600 hover:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-100 rounded-md transition-colors"
                                                title="Xóa"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={onPageChange}
                />
            )}

            {/* Image Gallery Modal */}
            {showImageGallery && selectedRoomImages.length > 0 && (
                <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center" onClick={() => setShowImageGallery(false)}>
                    <div className="relative w-full h-full flex items-center justify-center max-w-7xl mx-auto px-4">
                        {/* Close button */}
                        <button
                            onClick={() => setShowImageGallery(false)}
                            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-2 transition-colors"
                            aria-label="Đóng"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>

                        {/* Previous button */}
                        {selectedRoomImages.length > 1 && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handlePrevImage();
                                }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-3 transition-all hover:bg-opacity-70"
                                aria-label="Ảnh trước"
                            >
                                <ChevronLeftIcon className="h-8 w-8" />
                            </button>
                        )}

                        {/* Main image */}
                        <div className="relative w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                            <Image
                                src={selectedRoomImages[currentImageIndex]}
                                alt={`Room image ${currentImageIndex + 1}`}
                                fill
                                className="object-contain"
                                unoptimized
                                priority
                            />
                        </div>

                        {/* Next button */}
                        {selectedRoomImages.length > 1 && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleNextImage();
                                }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-3 transition-all hover:bg-opacity-70"
                                aria-label="Ảnh sau"
                            >
                                <ChevronRightIcon className="h-8 w-8" />
                            </button>
                        )}

                        {/* Image counter */}
                        {selectedRoomImages.length > 1 && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black bg-opacity-50 rounded-full px-4 py-2 text-sm">
                                {currentImageIndex + 1} / {selectedRoomImages.length}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Amenities Modal */}
            {showAmenitiesModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowAmenitiesModal(false)}>
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Tiện ích phòng: {selectedRoomName}
                            </h3>
                            <button
                                onClick={() => setShowAmenitiesModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                aria-label="Đóng"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto flex-1">
                            {selectedRoomAmenities.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {selectedRoomAmenities.map((amenity) => (
                                        <div
                                            key={amenity.id}
                                            className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200"
                                        >
                                            <svg
                                                className="h-5 w-5 text-green-600 flex-shrink-0"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="text-sm text-gray-700">{amenity.name}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    Không có tiện ích nào
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end p-4 border-t bg-gray-50">
                            <button
                                onClick={() => setShowAmenitiesModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

