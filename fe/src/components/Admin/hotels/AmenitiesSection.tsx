"use client";

import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import type { Amenity } from "@/lib/AdminAPI/amenityService";

interface AmenitiesSectionProps {
    amenities: Amenity[];
    selectedAmenityIds: Set<string>;
    onSelectedAmenityIdsChange: (ids: Set<string>) => void;
}

export default function AmenitiesSection({
    amenities,
    selectedAmenityIds,
    onSelectedAmenityIdsChange,
}: AmenitiesSectionProps) {
    const [searchAmenityQuery, setSearchAmenityQuery] = useState<string>('');
    const [showAllMainAmenities, setShowAllMainAmenities] = useState<boolean>(false);

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6 pb-3 border-b border-gray-200">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-800">Tiện ích</h3>
            </div>
            <div className="space-y-4">
                {/* Tiện ích chính */}
                {(() => {
                    const freeAmenities = amenities.filter(a => a.free);
                    const selectedOtherAmenities = amenities.filter(a => !a.free && selectedAmenityIds.has(a.id));
                    const displayLimit = 10;
                    const amenitiesToShow = showAllMainAmenities
                        ? [...freeAmenities, ...selectedOtherAmenities]
                        : [...freeAmenities, ...selectedOtherAmenities].slice(0, displayLimit);
                    const hasMore = (freeAmenities.length + selectedOtherAmenities.length) > displayLimit;

                    if (freeAmenities.length > 0 || selectedOtherAmenities.length > 0) {
                        return (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <h4 className="text-sm font-semibold text-green-800 mb-3 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Tiện ích chính
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                                    {amenitiesToShow
                                        .filter(amenity => amenity?.id && amenity?.name)
                                        .map((amenity) => (
                                            <div
                                                key={amenity.id}
                                                className="flex items-center gap-2 p-2 bg-white rounded-md border border-green-300 shadow-sm"
                                            >
                                                <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                <span className="text-sm text-gray-700 font-medium">{amenity.name || 'Không có tên'}</span>
                                            </div>
                                        ))}
                                </div>
                                {hasMore && (
                                    <button
                                        type="button"
                                        onClick={() => setShowAllMainAmenities(!showAllMainAmenities)}
                                        className="mt-3 text-sm font-medium text-green-700 hover:text-green-800 flex items-center gap-1 transition-colors"
                                    >
                                        {showAllMainAmenities ? (
                                            <>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                </svg>
                                                Thu gọn
                                            </>
                                        ) : (
                                            <>
                                                Xem thêm ({freeAmenities.length + selectedOtherAmenities.length - displayLimit} tiện ích)
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </>
                                        )}
                                    </button>
                                )}
                                <p className="text-xs text-green-700 mt-3">
                                    {freeAmenities.length > 0 && "Các tiện ích miễn phí phổ biến đã được tự động gán vào khách sạn"}
                                    {selectedOtherAmenities.length > 0 && freeAmenities.length > 0 && " • "}
                                    {selectedOtherAmenities.length > 0 && `${selectedOtherAmenities.length} tiện ích khác đã được thêm`}
                                </p>
                            </div>
                        );
                    }
                    return null;
                })()}

                {/* Thêm tiện ích khác */}
                <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-700">Thêm tiện ích khác (nếu có)</h4>
                    <div className="relative">
                        <input
                            type="text"
                            value={searchAmenityQuery}
                            onChange={(e) => setSearchAmenityQuery(e.target.value)}
                            placeholder="Tìm kiếm và chọn thêm tiện ích..."
                            className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                        />
                        {searchAmenityQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchAmenityQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        )}
                    </div>

                    {/* Danh sách amenities để chọn */}
                    {(() => {
                        const otherAmenities = amenities.filter(a => !a.free);
                        const filteredAmenities = searchAmenityQuery.trim()
                            ? otherAmenities.filter(a =>
                                a.name.toLowerCase().includes(searchAmenityQuery.toLowerCase())
                            )
                            : otherAmenities;

                        if (filteredAmenities.length > 0) {
                            return (
                                <div className="border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                                    <div className="space-y-2">
                                        {filteredAmenities
                                            .filter(amenity => amenity?.id && amenity?.name)
                                            .map((amenity) => (
                                                <label
                                                    key={amenity.id}
                                                    className="flex items-center space-x-3 cursor-pointer p-2 rounded-md hover:bg-gray-50 border border-gray-200"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedAmenityIds.has(amenity.id)}
                                                        onChange={(e) => {
                                                            const newSet = new Set(selectedAmenityIds);
                                                            if (e.target.checked) {
                                                                newSet.add(amenity.id);
                                                            } else {
                                                                newSet.delete(amenity.id);
                                                            }
                                                            onSelectedAmenityIdsChange(newSet);
                                                        }}
                                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                    />
                                                    <span className="text-sm text-gray-700 flex-1">
                                                        {amenity.name || 'Không có tên'}
                                                    </span>
                                                    {amenity?.category?.name && (
                                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                            {amenity.category.name}
                                                        </span>
                                                    )}
                                                </label>
                                            ))}
                                    </div>
                                </div>
                            );
                        } else if (searchAmenityQuery.trim()) {
                            return (
                                <div className="border border-gray-200 rounded-lg p-4 text-center text-sm text-gray-500">
                                    Không tìm thấy tiện ích nào phù hợp với "{searchAmenityQuery}"
                                </div>
                            );
                        }
                        return null;
                    })()}
                </div>
            </div>
        </div>
    );
}




















