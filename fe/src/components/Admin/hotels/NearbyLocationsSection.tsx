"use client";

import { useState, useEffect, useRef } from "react";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import type { EntertainmentVenueByCategory, EntertainmentVenue } from "@/lib/AdminAPI/entertainmentVenueService";
import type { Hotel } from "@/types";
import VenueRemoveSection from "./VenueRemoveSection";

interface NearbyLocationsSectionProps {
    selectedCityId: string;
    entertainmentVenuesByCategory: EntertainmentVenueByCategory[];
    selectedVenues: Array<{ venueId: string; distance: number }>;
    newVenues: Array<{ name: string; distance: number; categoryId: string }>;
    hotelVenueDistances: Map<string, number>;
    isEditing: boolean;
    hotelId?: string;
    hotel?: Hotel | null;
    onSelectedVenuesChange: (venues: Array<{ venueId: string; distance: number }>) => void;
    onNewVenuesChange: (venues: Array<{ name: string; distance: number; categoryId: string }>) => void;
    onVenueRemove?: (venueId: string) => void;
    onVenuesDataReady?: (data: {
        venuesToUpdate: Array<{ venueId: string; distance: number }>;
        venuesToAdd: Array<{ venueId: string; distance: number }>;
        venuesToRemove: string[];
        newVenues: Array<{ name: string; distance: number; categoryId: string }>;
    }) => void;
}

export default function NearbyLocationsSection({
    selectedCityId,
    entertainmentVenuesByCategory,
    selectedVenues,
    newVenues,
    hotelVenueDistances,
    isEditing,
    hotelId,
    hotel,
    onSelectedVenuesChange,
    onNewVenuesChange,
    onVenueRemove,
    onVenuesDataReady,
}: NearbyLocationsSectionProps) {
    const [newVenueName, setNewVenueName] = useState('');
    const [newVenueDistance, setNewVenueDistance] = useState<number>(0);
    const [newVenueCategoryId, setNewVenueCategoryId] = useState<string>('');
    const [venuesToRemove, setVenuesToRemove] = useState<Set<string>>(new Set());

    // Dùng ref để lưu venues ban đầu từ hotel, đảm bảo không bị thay đổi
    const initialHotelVenueDistancesRef = useRef<Map<string, number>>(new Map());

    // Load venues ban đầu từ hotel vào ref khi hotel thay đổi
    useEffect(() => {
        if (!isEditing || !hotel) {
            initialHotelVenueDistancesRef.current = new Map();
            return;
        }

        const hotelData = hotel as any;
        const distanceMap = new Map<string, number>();

        if (hotelData?.entertainmentVenues && Array.isArray(hotelData.entertainmentVenues)) {
            hotelData.entertainmentVenues.forEach((categoryGroup: any) => {
                if (categoryGroup?.entertainmentVenues && Array.isArray(categoryGroup.entertainmentVenues)) {
                    categoryGroup.entertainmentVenues.forEach((venue: any) => {
                        if (venue?.id && venue?.distance != null) {
                            const venueId = String(venue.id);
                            const distanceInMeters = venue.distance;
                            distanceMap.set(venueId, distanceInMeters);
                        }
                    });
                }
            });
        }

        initialHotelVenueDistancesRef.current = new Map(distanceMap);
    }, [hotel?.id, isEditing, hotel]);

    // Cập nhật ref khi hotelVenueDistances state thay đổi (từ HotelForm)
    useEffect(() => {
        if (!isEditing) return;

        if (hotelVenueDistances.size > 0) {
            // Nếu ref rỗng hoặc ref khác với state, cập nhật ref
            const refSize = initialHotelVenueDistancesRef.current.size;
            const refKeys = Array.from(initialHotelVenueDistancesRef.current.keys()).sort();
            const stateKeys = Array.from(hotelVenueDistances.keys()).sort();
            const keysMatch = refKeys.length === stateKeys.length &&
                refKeys.every((key, i) => key === stateKeys[i]);

            if (refSize === 0 || !keysMatch) {
                initialHotelVenueDistancesRef.current = new Map(hotelVenueDistances);
            }
        }
    }, [hotelVenueDistances, isEditing]);

    // Tính toán và gửi dữ liệu venues lên parent khi có thay đổi
    useEffect(() => {
        if (!isEditing || !onVenuesDataReady) return;

        // Lấy venues ban đầu từ ref
        let finalOriginalVenueDistances = initialHotelVenueDistancesRef.current;

        // Nếu ref rỗng, thử lấy từ hotelVenueDistances state
        if (finalOriginalVenueDistances.size === 0 && hotelVenueDistances.size > 0) {
            finalOriginalVenueDistances = hotelVenueDistances;
            initialHotelVenueDistancesRef.current = new Map(hotelVenueDistances);
        }

        // Nếu cả ref và state đều rỗng, lấy trực tiếp từ hotel prop
        if (finalOriginalVenueDistances.size === 0 && hotel) {
            const hotelData = hotel as any;
            const distanceMapFromHotel = new Map<string, number>();

            if (hotelData?.entertainmentVenues && Array.isArray(hotelData.entertainmentVenues)) {
                hotelData.entertainmentVenues.forEach((categoryGroup: any) => {
                    if (categoryGroup?.entertainmentVenues && Array.isArray(categoryGroup.entertainmentVenues)) {
                        categoryGroup.entertainmentVenues.forEach((venue: any) => {
                            if (venue?.id && venue?.distance != null) {
                                const venueId = String(venue.id);
                                const distanceInMeters = venue.distance;
                                distanceMapFromHotel.set(venueId, distanceInMeters);
                            }
                        });
                    }
                });

                if (distanceMapFromHotel.size > 0) {
                    finalOriginalVenueDistances = distanceMapFromHotel;
                    initialHotelVenueDistancesRef.current = new Map(distanceMapFromHotel);
                }
            }
        }

        const existingVenueIds = new Set(Array.from(finalOriginalVenueDistances.keys()).map(id => String(id)));
        const venuesToUpdate: Array<{ venueId: string; distance: number }> = [];
        const venuesToAdd: Array<{ venueId: string; distance: number }> = [];

        // Phân loại venues: UPDATE (đã có trong hotel) hoặc ADD (mới)
        selectedVenues.forEach((venue) => {
            const venueIdStr = String(venue.venueId);
            if (existingVenueIds.has(venueIdStr)) {
                venuesToUpdate.push(venue);
            } else {
                venuesToAdd.push(venue);
            }
        });

        // Tính toán venues cần xóa:
        // 1. Venues ban đầu có trong hotel nhưng không còn trong selectedVenues
        const selectedVenueIds = new Set(selectedVenues.map(v => String(v.venueId)));
        const calculatedVenuesToRemove: string[] = [];
        existingVenueIds.forEach((venueId) => {
            if (!selectedVenueIds.has(venueId)) {
                calculatedVenuesToRemove.push(venueId);
            }
        });

        // 2. Kết hợp với venuesToRemove từ state (khi user bấm nút X trực tiếp)
        const allVenuesToRemove = Array.from(new Set([...calculatedVenuesToRemove, ...Array.from(venuesToRemove)]));

        // Gửi dữ liệu lên parent
        onVenuesDataReady({
            venuesToUpdate,
            venuesToAdd,
            venuesToRemove: allVenuesToRemove,
            newVenues,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedVenues, newVenues, venuesToRemove, hotelVenueDistances, hotel?.id, isEditing]);

    // Tự động tìm category "Địa Điểm Lân Cận" để dùng cho venue mới khi categories được load
    useEffect(() => {
        if (entertainmentVenuesByCategory && entertainmentVenuesByCategory.length > 0) {
            const nearbyCategory = entertainmentVenuesByCategory.find(cat =>
                cat?.name && (
                    cat.name.toLowerCase().includes('lân cận') ||
                    cat.name.toLowerCase().includes('địa điểm lân cận') ||
                    cat.name.toLowerCase().includes('nearby')
                )
            );
            if (nearbyCategory && nearbyCategory.id) {
                setNewVenueCategoryId(nearbyCategory.id);
            } else {
                setNewVenueCategoryId(entertainmentVenuesByCategory[0].id);
            }
        } else {
            setNewVenueCategoryId('a4d8d350-a850-11f0-a7b7-0a6aab4924ab');
        }
    }, [entertainmentVenuesByCategory]);

    // Helper function để kiểm tra venue có trong hotel hay không
    const isVenueInHotel = (venueId: string): boolean => {
        return hotelVenueDistances.has(venueId);
    };

    // Helper function để lấy distance ban đầu từ hotel (nếu có)
    const getOriginalDistance = (venueId: string): number | null => {
        const distanceInMeters = hotelVenueDistances.get(venueId);
        return distanceInMeters != null ? distanceInMeters / 1000 : null; // Convert meters to km
    };


    return (
        <div
            className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
            // Ngăn mọi event bubble lên form cha
            onMouseDown={(e) => {
                e.stopPropagation();
                if (e.nativeEvent) {
                    e.nativeEvent.stopImmediatePropagation();
                }
            }}
            onClick={(e) => {
                e.stopPropagation();
                if (e.nativeEvent) {
                    e.nativeEvent.stopImmediatePropagation();
                }
            }}
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    if (e.nativeEvent) {
                        e.nativeEvent.stopImmediatePropagation();
                    }
                }
            }}
        >
            <div className="flex items-center gap-2 mb-6 pb-3 border-b border-gray-200">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-800">Địa điểm lân cận</h3>
            </div>
            <div className="space-y-4">
                {!selectedCityId ? (
                    <p className="text-sm text-gray-500">Vui lòng chọn thành phố để xem danh sách địa điểm lân cận</p>
                ) : (
                    <>
                        {/* Danh sách venues có sẵn */}
                        {entertainmentVenuesByCategory.length > 0 && (
                            <div className="space-y-4">
                                {entertainmentVenuesByCategory
                                    .filter(categoryGroup => categoryGroup?.id && categoryGroup?.name)
                                    .map((categoryGroup) => (
                                        <div key={categoryGroup.id || 'unknown'} className="border border-gray-200 rounded-lg p-4">
                                            <h4 className="text-sm font-medium text-gray-700 mb-3">{categoryGroup.name || 'Không có tên'}</h4>
                                            <div className="space-y-2">
                                                {(categoryGroup.entertainmentVenues || []).map((venue) => {
                                                    if (!venue?.id || !venue?.name) return null;
                                                    // Đảm bảo so sánh chính xác: venue.id (từ API) với v.venueId (từ selectedVenues)
                                                    const isSelected = selectedVenues.some(v => String(v.venueId) === String(venue.id));
                                                    const selectedVenue = selectedVenues.find(v => String(v.venueId) === String(venue.id));
                                                    const isExistingInHotel = isVenueInHotel(venue.id);
                                                    const originalDistance = getOriginalDistance(venue.id);
                                                    const hasDistanceChanged = isSelected && originalDistance !== null && selectedVenue && Math.abs(selectedVenue.distance - originalDistance) > 0.01;

                                                    return (
                                                        <div key={venue.id} className={`flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 border ${isExistingInHotel ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                                                            }`}>
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        // Nếu venue đã có trong selectedVenues, không thêm lại
                                                                        const existingVenue = selectedVenues.find(v => String(v.venueId) === String(venue.id));
                                                                        if (existingVenue) {
                                                                            // Đã có, không thêm lại
                                                                            return;
                                                                        }

                                                                        // Chưa có, kiểm tra xem có distance từ hotel data không
                                                                        let distanceToUse = 1; // Mặc định 1 km

                                                                        // Nếu có distance từ hotel data (đã lưu trước), dùng nó
                                                                        const savedDistanceInMeters = hotelVenueDistances.get(venue.id);
                                                                        if (savedDistanceInMeters != null) {
                                                                            // Convert meters → km
                                                                            distanceToUse = savedDistanceInMeters / 1000;
                                                                        } else if (venue.distance != null) {
                                                                            // Nếu venue từ API có distance (meters), convert sang km
                                                                            distanceToUse = venue.distance / 1000;
                                                                        }

                                                                        // Thêm venue với distance đã lấy được
                                                                        onSelectedVenuesChange([...selectedVenues, { venueId: venue.id, distance: distanceToUse }]);
                                                                    } else {
                                                                        // Uncheck: Xóa venue khỏi selectedVenues
                                                                        const venueIdToRemove = venue.id;
                                                                        const updatedVenues = selectedVenues.filter(v => String(v.venueId) !== String(venue.id));
                                                                        onSelectedVenuesChange([...updatedVenues]);
                                                                        // Thêm venue vào danh sách cần xóa (nếu venue đã có trong hotel)
                                                                        if (isExistingInHotel) {
                                                                            setVenuesToRemove(prev => new Set([...prev, venueIdToRemove]));
                                                                            if (onVenueRemove) {
                                                                                onVenueRemove(venueIdToRemove);
                                                                            }
                                                                        }
                                                                    }
                                                                }}
                                                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                            />
                                                            <div className="flex-1 flex items-center gap-2">
                                                                <span className="text-sm text-gray-700">{venue.name || 'Không có tên'}</span>
                                                                {isExistingInHotel && (
                                                                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                                                                        Đã có
                                                                    </span>
                                                                )}
                                                                {hasDistanceChanged && (
                                                                    <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full font-medium">
                                                                        Đã thay đổi
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {isSelected && (
                                                                <>
                                                                    <input
                                                                        type="number"
                                                                        formNoValidate
                                                                        min="0.1"
                                                                        step="0.1"
                                                                        value={selectedVenue?.distance || 1}
                                                                        onChange={(e) => {
                                                                            e.stopPropagation();
                                                                            const distance = parseFloat(e.target.value);
                                                                            // Chỉ update nếu distance hợp lệ (> 0)
                                                                            if (!isNaN(distance) && distance > 0) {
                                                                                onSelectedVenuesChange(selectedVenues.map(v =>
                                                                                    String(v.venueId) === String(venue.id) ? { ...v, distance } : v
                                                                                ));
                                                                            }
                                                                        }}
                                                                        onKeyDown={(e) => {
                                                                            if (e.key === 'Enter') {
                                                                                e.preventDefault();
                                                                                e.stopPropagation();
                                                                            }
                                                                        }}
                                                                        className={`w-20 px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${hasDistanceChanged ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300'
                                                                            }`}
                                                                        placeholder="Km"
                                                                    />
                                                                    <span className="text-xs text-gray-500">km</span>
                                                                    {originalDistance !== null && hasDistanceChanged && (
                                                                        <span className="text-xs text-gray-400">
                                                                            (cũ: {originalDistance.toFixed(1)}km)
                                                                        </span>
                                                                    )}
                                                                    {/* Nút X để xóa venue trực tiếp từ danh sách */}
                                                                    <button
                                                                        type="button"
                                                                        formNoValidate
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            if (e.nativeEvent) {
                                                                                e.nativeEvent.stopImmediatePropagation();
                                                                            }
                                                                            // Xóa venue khỏi selectedVenues
                                                                            const venueIdToRemove = venue.id;
                                                                            const updatedVenues = selectedVenues.filter(v => String(v.venueId) !== String(venueIdToRemove));
                                                                            onSelectedVenuesChange([...updatedVenues]);
                                                                            // Thêm venue vào danh sách cần xóa (nếu venue đã có trong hotel)
                                                                            if (isExistingInHotel) {
                                                                                setVenuesToRemove(prev => new Set([...prev, venueIdToRemove]));
                                                                            }
                                                                            if (onVenueRemove) {
                                                                                onVenueRemove(venueIdToRemove);
                                                                            }
                                                                            return false;
                                                                        }}
                                                                        onMouseDown={(e) => {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                        }}
                                                                        className="ml-2 text-red-600 hover:text-red-800 transition-colors p-1"
                                                                        title={isExistingInHotel ? "Xóa khỏi hotel" : "Bỏ chọn"}
                                                                    >
                                                                        <XMarkIcon className="h-4 w-4" />
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )}

                        {/* Form thêm venue mới */}
                        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">Thêm địa điểm mới</h4>
                            <p className="text-xs text-gray-500 mb-3">
                                Địa điểm mới sẽ được tự động thêm vào danh mục "Địa Điểm Lân Cận"
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <input
                                        type="text"
                                        formNoValidate
                                        value={newVenueName}
                                        onChange={(e) => {
                                            e.stopPropagation();
                                            setNewVenueName(e.target.value);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }
                                        }}
                                        placeholder="Tên địa điểm"
                                        className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="number"
                                        formNoValidate
                                        min="0.1"
                                        step="0.1"
                                        value={newVenueDistance > 0 ? newVenueDistance : ''}
                                        onChange={(e) => {
                                            e.stopPropagation();
                                            const value = e.target.value;
                                            const numValue = value ? parseFloat(value) : 0;
                                            setNewVenueDistance(numValue);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }
                                        }}
                                        placeholder="Khoảng cách (km)"
                                        className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                                    />
                                </div>
                            </div>
                            <button
                                type="button"
                                formNoValidate
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (e.nativeEvent) {
                                        e.nativeEvent.stopImmediatePropagation();
                                    }

                                    let categoryIdToUse = newVenueCategoryId;
                                    if (!categoryIdToUse) {
                                        if (entertainmentVenuesByCategory.length > 0) {
                                            const nearbyCategory = entertainmentVenuesByCategory.find(cat =>
                                                cat?.name && (
                                                    cat.name.toLowerCase().includes('lân cận') ||
                                                    cat.name.toLowerCase().includes('địa điểm lân cận') ||
                                                    cat.name.toLowerCase().includes('nearby')
                                                )
                                            );
                                            categoryIdToUse = nearbyCategory?.id || entertainmentVenuesByCategory[0].id;
                                        }
                                    }
                                    if (!categoryIdToUse) {
                                        categoryIdToUse = 'a4d8d350-a850-11f0-a7b7-0a6aab4924ab';
                                    }

                                    const isValid = newVenueName.trim() &&
                                        newVenueDistance > 0 &&
                                        categoryIdToUse &&
                                        selectedCityId;

                                    if (isValid) {
                                        onNewVenuesChange([...newVenues, {
                                            name: newVenueName.trim(),
                                            distance: newVenueDistance,
                                            categoryId: categoryIdToUse
                                        }]);
                                        setNewVenueName('');
                                        setNewVenueDistance(0);
                                    }

                                    return false;
                                }}
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                                disabled={!newVenueName.trim() ||
                                    !newVenueDistance ||
                                    newVenueDistance <= 0 ||
                                    !selectedCityId}
                                className="mt-3 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-sm"
                            >
                                <PlusIcon className="h-4 w-4 inline mr-1" />
                                Thêm địa điểm
                            </button>
                        </div>

                        {/* Hiển thị venues sẽ bị xóa */}
                        {(() => {
                            const existingVenueIds = new Set(hotelVenueDistances.keys());
                            const selectedVenueIds = new Set(selectedVenues.map(v => v.venueId));
                            const calculatedVenuesToRemove: string[] = [];

                            existingVenueIds.forEach((venueId) => {
                                if (!selectedVenueIds.has(venueId)) {
                                    calculatedVenuesToRemove.push(venueId);
                                }
                            });

                            // Kết hợp với venuesToRemove từ state (khi user bấm nút X)
                            const allVenuesToRemove = Array.from(new Set([...calculatedVenuesToRemove, ...Array.from(venuesToRemove)]));

                            return (
                                <VenueRemoveSection
                                    venuesToRemove={allVenuesToRemove}
                                    entertainmentVenuesByCategory={entertainmentVenuesByCategory}
                                    onRemoveVenue={(venueId) => {
                                        // Hủy xóa: thêm venue lại vào selectedVenues
                                        const venueInfo = entertainmentVenuesByCategory
                                            .flatMap(cat => cat?.entertainmentVenues || [])
                                            .find(v => v?.id === venueId);

                                        if (venueInfo) {
                                            // Lấy distance từ hotelVenueDistances nếu có
                                            const savedDistanceInMeters = hotelVenueDistances.get(venueId);
                                            const distanceToUse = savedDistanceInMeters != null ? savedDistanceInMeters / 1000 : 1;

                                            // Thêm venue lại vào selectedVenues
                                            const isAlreadySelected = selectedVenues.some(v => String(v.venueId) === String(venueId));
                                            if (!isAlreadySelected) {
                                                onSelectedVenuesChange([...selectedVenues, { venueId: venueId, distance: distanceToUse }]);
                                            }

                                            // Xóa khỏi venuesToRemove state
                                            setVenuesToRemove(prev => {
                                                const newSet = new Set(prev);
                                                newSet.delete(venueId);
                                                return newSet;
                                            });

                                            // Gọi onVenueRemove để thông báo cho parent
                                            if (onVenueRemove) {
                                                // Không gọi onVenueRemove vì đây là hủy xóa
                                            }
                                        }
                                    }}
                                />
                            );
                        })()}

                        {/* Danh sách venues đã chọn */}
                        {(selectedVenues.length > 0 || newVenues.length > 0) && (
                            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                                <div className="mb-3">
                                    <h4 className="text-sm font-medium text-gray-700">
                                        Địa điểm đã chọn ({selectedVenues.length + newVenues.length})
                                    </h4>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Địa điểm sẽ được lưu khi bạn cập nhật khách sạn
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    {selectedVenues.map((venue, index) => {
                                        const venueInfo = entertainmentVenuesByCategory
                                            .flatMap(cat => cat?.entertainmentVenues || [])
                                            .find(v => v?.id === venue.venueId);
                                        const isExistingInHotel = isVenueInHotel(venue.venueId);
                                        const originalDistance = getOriginalDistance(venue.venueId);
                                        const hasDistanceChanged = originalDistance !== null && Math.abs(venue.distance - originalDistance) > 0.01;

                                        return (
                                            <div key={`existing-${index}`} className={`flex items-center justify-between p-2 rounded-md border ${isExistingInHotel
                                                ? hasDistanceChanged
                                                    ? 'bg-yellow-50 border-yellow-300'
                                                    : 'bg-blue-50 border-blue-200'
                                                : 'bg-white border-gray-200'
                                                }`}>
                                                <div className="flex items-center gap-2 flex-1">
                                                    <span className="text-sm text-gray-700">
                                                        {venueInfo?.name || 'Không xác định'}
                                                    </span>
                                                    {isExistingInHotel && (
                                                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                                                            {hasDistanceChanged ? 'Cập nhật' : 'Đã có'}
                                                        </span>
                                                    )}
                                                    {!isExistingInHotel && (
                                                        <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                                                            Mới thêm
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-sm font-medium ${hasDistanceChanged ? 'text-yellow-700' : 'text-gray-600'
                                                        }`}>
                                                        {venue.distance} km
                                                    </span>
                                                    {originalDistance !== null && hasDistanceChanged && (
                                                        <span className="text-xs text-gray-400 line-through">
                                                            {originalDistance.toFixed(1)}km
                                                        </span>
                                                    )}
                                                    <button
                                                        type="button"
                                                        formNoValidate
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            if (e.nativeEvent) {
                                                                e.nativeEvent.stopImmediatePropagation();
                                                            }
                                                            // Xóa theo venueId để đảm bảo đúng venue và checkbox sẽ tự động uncheck
                                                            const venueIdToRemove = String(venue.venueId);
                                                            const updatedVenues = selectedVenues.filter(v => String(v.venueId) !== venueIdToRemove);
                                                            onSelectedVenuesChange([...updatedVenues]);
                                                            // Thêm venue vào danh sách cần xóa (nếu venue đã có trong hotel)
                                                            if (isExistingInHotel) {
                                                                setVenuesToRemove(prev => new Set([...prev, venueIdToRemove]));
                                                            }
                                                            if (onVenueRemove) {
                                                                onVenueRemove(venueIdToRemove);
                                                            }
                                                            return false;
                                                        }}
                                                        onMouseDown={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                        }}
                                                        className="text-red-600 hover:text-red-800 transition-colors p-1"
                                                        title={isExistingInHotel ? "Xóa khỏi hotel" : "Bỏ chọn"}
                                                    >
                                                        <XMarkIcon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {newVenues.map((venue, index) => (
                                        <div key={`new-${index}`} className="flex items-center justify-between p-2 bg-white rounded-md border border-gray-200">
                                            <span className="text-sm text-gray-700">
                                                {venue.name} <span className="text-xs text-blue-600">(Mới)</span>
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-600">{venue.distance} km</span>
                                                <button
                                                    type="button"
                                                    formNoValidate
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        if (e.nativeEvent) {
                                                            e.nativeEvent.stopImmediatePropagation();
                                                        }
                                                        onNewVenuesChange(newVenues.filter((_, i) => i !== index));
                                                        return false;
                                                    }}
                                                    onMouseDown={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                    }}
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    <XMarkIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

