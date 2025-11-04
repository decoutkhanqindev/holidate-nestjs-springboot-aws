"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useTransition, useEffect, useState, useCallback } from 'react';
import { EyeIcon, PencilIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { Room } from '@/types';
import { deleteRoomAction } from '@/lib/actions/roomActions';
import { getTodayInventoriesForRooms, type RoomInventory } from '@/lib/AdminAPI/roomInventoryService';

interface RoomsTableProps {
    rooms: Room[];
    hotelId: string;
    currentPage: number;
    totalPages: number;
    totalItems: number;
    onPageChange: (page: number) => void;
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

// Component StatusBadge
function StatusBadge({ status }: { status: Room['status'] }) {
    const statusStyles: Record<Room['status'], string> = {
        AVAILABLE: "bg-green-100 text-green-800",
        OCCUPIED: "bg-red-100 text-red-800",
        MAINTENANCE: "bg-yellow-100 text-yellow-800",
    };
    const statusText: Record<Room['status'], string> = {
        AVAILABLE: "Trống",
        OCCUPIED: "Đã thuê",
        MAINTENANCE: "Bảo trì",
    };
    return (
        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[status]}`}>
            {statusText[status]}
        </span>
    );
}

export default function RoomsTable({ rooms, hotelId, currentPage, totalPages, totalItems, onPageChange }: RoomsTableProps) {
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
                console.log("[RoomsTable] Loaded inventories for", inventoryMap.size, "rooms");
            } catch (error) {
                console.error("[RoomsTable] Error fetching inventories:", error);
            } finally {
                setIsLoadingInventories(false);
            }
        };

        fetchInventories();
    }, [rooms]);

    const handleDelete = (id: string, name: string) => {
        if (confirm(`Bạn có chắc chắn muốn xóa phòng "${name}" không?`)) {
            startTransition(async () => {
                await deleteRoomAction(id);
                // Refresh page sẽ được handle bởi parent component
                window.location.reload();
            });
        }
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

    // Tính STT dựa trên currentPage (1-based)
    const startIndex = (currentPage - 1) * 10;

    return (
        <div className={`mt-6 bg-white rounded-lg shadow-md overflow-hidden transition-opacity ${isPending ? "opacity-50" : "opacity-100"}`}>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                STT
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                TÊN PHÒNG
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                ẢNH
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                LOẠI
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                GIÁ ĐÊM
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                SỐ LƯỢNG
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                TIỆN ÍCH
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                TRẠNG THÁI
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{startIndex + index + 1}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{room.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {room.image ? (
                                            <div 
                                                className="flex-shrink-0 h-20 w-28 flex items-center justify-center overflow-hidden rounded-md border border-gray-200 shadow-sm group relative cursor-pointer hover:border-blue-400 transition-all"
                                                onClick={() => handleImageClick(room)}
                                                title="Click để xem ảnh"
                                            >
                                                <Image
                                                    className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                                                    src={room.image}
                                                    alt={room.name}
                                                    width={112}
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
                                            <div className="flex-shrink-0 h-20 w-28 flex items-center justify-center bg-gray-100 rounded-md border border-gray-200">
                                                <span className="text-xs text-gray-400">Không có ảnh</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-600">{room.type || 'N/A'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 font-medium">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(room.price)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
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
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${
                                                            isLowStock 
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
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${
                                                            isLowStock 
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
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1 max-w-xs">
                                            {room.amenities && room.amenities.length > 0 ? (
                                                <>
                                                    {room.amenities.slice(0, 3).map((amenity) => (
                                                        <span
                                                            key={amenity.id}
                                                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200"
                                                            title={amenity.name}
                                                        >
                                                            {amenity.name}
                                                        </span>
                                                    ))}
                                                    {room.amenities.length > 3 && (
                                                        <button
                                                            onClick={() => handleAmenitiesClick(room)}
                                                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 cursor-pointer transition-colors"
                                                            title="Click để xem tất cả tiện ích"
                                                        >
                                                            +{room.amenities.length - 3} tiện ích
                                                        </button>
                                                    )}
                                                    {room.amenities.length <= 3 && (
                                                        <button
                                                            onClick={() => handleAmenitiesClick(room)}
                                                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium text-blue-600 hover:text-blue-800 cursor-pointer underline"
                                                            title="Click để xem chi tiết"
                                                        >
                                                            Xem tất cả
                                                        </button>
                                                    )}
                                                </>
                                            ) : (
                                                <span className="text-xs text-gray-400">Không có</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <StatusBadge status={room.status} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center justify-end gap-x-2">
                                            <Link
                                                href={`/admin-rooms/${room.id}`}
                                                className="p-2 bg-gray-100 text-green-600 hover:bg-gray-200 rounded-md transition-colors"
                                                title="Xem chi tiết"
                                            >
                                                <EyeIcon className="h-5 w-5" />
                                            </Link>
                                            <Link
                                                href={`/admin-rooms/${room.id}/edit`}
                                                className="p-2 bg-gray-100 text-blue-600 hover:bg-gray-200 rounded-md transition-colors"
                                                title="Chỉnh sửa"
                                            >
                                                <PencilIcon className="h-5 w-5" />
                                            </Link>
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

