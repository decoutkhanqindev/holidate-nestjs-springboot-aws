"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
import type { EntertainmentVenueByCategory } from "@/lib/AdminAPI/entertainmentVenueService";

interface VenueRemoveSectionProps {
    venuesToRemove: string[];
    entertainmentVenuesByCategory: EntertainmentVenueByCategory[];
    onRemoveVenue?: (venueId: string) => void;
}

export default function VenueRemoveSection({
    venuesToRemove,
    entertainmentVenuesByCategory,
    onRemoveVenue,
}: VenueRemoveSectionProps) {
    if (venuesToRemove.length === 0) {
        return null;
    }

    // Lấy thông tin venues sẽ bị xóa
    const removedVenuesInfo = venuesToRemove.map(venueId => {
        const venueInfo = entertainmentVenuesByCategory
            .flatMap(cat => cat?.entertainmentVenues || [])
            .find(v => v?.id === venueId);
        return { id: venueId, name: venueInfo?.name || 'Không xác định' };
    });

    return (
        <div className="border border-red-200 rounded-lg p-4 bg-red-50 mb-4">
            <h4 className="text-sm font-medium text-red-800 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Địa điểm sẽ bị xóa ({venuesToRemove.length})
            </h4>
            <p className="text-xs text-red-700 mb-2">
                Các địa điểm sau sẽ bị xóa khỏi hotel khi bạn cập nhật:
            </p>
            <div className="space-y-1">
                {removedVenuesInfo.map((venue) => (
                    <div 
                        key={venue.id} 
                        className="flex items-center justify-between gap-2 text-sm text-red-700 bg-white rounded px-2 py-1 border border-red-200"
                    >
                        <div className="flex items-center gap-2 flex-1">
                            <XMarkIcon className="h-4 w-4 text-red-600 flex-shrink-0" />
                            <span>{venue.name}</span>
                        </div>
                        {onRemoveVenue && (
                            <button
                                type="button"
                                formNoValidate
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (e.nativeEvent) {
                                        e.nativeEvent.stopImmediatePropagation();
                                    }
                                    onRemoveVenue(venue.id);
                                    return false;
                                }}
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                                className="text-red-600 hover:text-red-800 transition-colors p-1"
                                title="Hủy xóa"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}





