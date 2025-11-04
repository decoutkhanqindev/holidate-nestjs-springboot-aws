"use client";

import { useState, useEffect } from 'react';
import type { Review } from '@/types';
import { getRoomById } from '@/lib/AdminAPI/roomService';

interface ReviewsTableProps {
    reviews: Review[];
}

// Component để hiển thị gallery ảnh
function PhotoGallery({ photos }: { photos: Array<{ id: string; url: string }> }) {
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

    if (photos.length === 0) return null;

    return (
        <>
            <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                    {photos.slice(0, 3).map((photo, idx) => (
                        <img
                            key={photo.id}
                            src={photo.url}
                            alt={`Review photo ${idx + 1}`}
                            className="h-10 w-10 rounded-full border-2 border-white object-cover cursor-pointer hover:opacity-80"
                            onClick={() => setSelectedPhoto(photo.url)}
                        />
                    ))}
                </div>
                {photos.length > 3 && (
                    <span className="text-xs text-gray-500">+{photos.length - 3}</span>
                )}
            </div>

            {/* Modal xem ảnh */}
            {selectedPhoto && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedPhoto(null)}
                >
                    <div className="relative max-w-4xl max-h-full">
                        <img
                            src={selectedPhoto}
                            alt="Review photo"
                            className="max-w-full max-h-[90vh] object-contain rounded-lg"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <button
                            onClick={() => setSelectedPhoto(null)}
                            className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
                        >
                            ✕
                        </button>
                        {/* Navigation buttons */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                const currentIndex = photos.findIndex(p => p.url === selectedPhoto);
                                const prevIndex = currentIndex > 0 ? currentIndex - 1 : photos.length - 1;
                                setSelectedPhoto(photos[prevIndex].url);
                            }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
                        >
                            ‹
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                const currentIndex = photos.findIndex(p => p.url === selectedPhoto);
                                const nextIndex = currentIndex < photos.length - 1 ? currentIndex + 1 : 0;
                                setSelectedPhoto(photos[nextIndex].url);
                            }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
                        >
                            ›
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

// Component để hiển thị số sao
function StarRating({ score }: { score: number }) {
    const fullStars = Math.floor(score);
    const hasHalfStar = score % 1 >= 0.5;
    const emptyStars = 10 - fullStars - (hasHalfStar ? 1 : 0);

    return (
        <div className="flex items-center justify-center gap-1 flex-wrap">
            <div className="flex items-center gap-0.5">
                {Array.from({ length: fullStars }).map((_, i) => (
                    <span key={i} className="text-yellow-400 text-base">★</span>
                ))}
                {hasHalfStar && <span className="text-yellow-400 text-base">☆</span>}
                {Array.from({ length: emptyStars }).map((_, i) => (
                    <span key={i} className="text-gray-300 text-base">★</span>
                ))}
            </div>
            <span className="ml-1 text-xs text-gray-600 whitespace-nowrap">({score}/10)</span>
        </div>
    );
}

// Component để hiển thị ảnh phòng
function RoomImageDisplay({ roomId, roomName }: { roomId: string; roomName: string }) {
    const [roomImage, setRoomImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRoomImage = async () => {
            try {
                const roomData = await getRoomById(roomId);
                if (roomData && roomData.photos) {
                    // Lấy ảnh đầu tiên từ photos array
                    // photos có cấu trúc: photos[].photos[].url
                    for (const photoCategory of roomData.photos) {
                        if (photoCategory.photos && photoCategory.photos.length > 0) {
                            const firstPhoto = photoCategory.photos[0]?.url;
                            if (firstPhoto) {
                                setRoomImage(firstPhoto);
                                break;
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('[RoomImageDisplay] Error fetching room image:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (roomId) {
            fetchRoomImage();
        } else {
            setIsLoading(false);
        }
    }, [roomId]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-16 w-20 bg-gray-100 rounded-md">
                <span className="text-xs text-gray-400">Đang tải...</span>
            </div>
        );
    }

    if (roomImage) {
        return (
            <img
                src={roomImage}
                alt={roomName !== 'N/A' ? roomName : 'Phòng'}
                className="h-16 w-20 object-cover rounded-md border border-gray-200 mx-auto"
            />
        );
    }

    return (
        <div className="flex items-center justify-center h-16 w-20 bg-gray-100 rounded-md border border-gray-200 mx-auto">
            <span className="text-xs text-gray-400 text-center px-1">Chưa có ảnh</span>
        </div>
    );
}

export default function ReviewsTable({ reviews }: ReviewsTableProps) {
    return (
        <div className="mt-6 bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-12">STT</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '180px' }}>NGƯỜI ĐÁNH GIÁ</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '180px' }}>KHÁCH SẠN</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '120px' }}>PHÒNG</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '180px' }}>ĐIỂM ĐÁNH GIÁ</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '200px' }}>BÌNH LUẬN</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '120px' }}>ẢNH</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '120px' }}>NGÀY TẠO</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {reviews.map((review, index) => (
                            <tr key={review.id} className="hover:bg-gray-50">
                                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{index + 1}</td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        {review.userAvatar && (
                                            <img
                                                src={review.userAvatar}
                                                alt={review.userName}
                                                className="h-10 w-10 rounded-full mr-3 flex-shrink-0"
                                            />
                                        )}
                                        <div className="text-sm font-medium text-gray-900 truncate">
                                            {review.userName}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm">
                                    <div className="font-medium text-gray-900 truncate">
                                        {review.hotelName !== 'N/A' ? review.hotelName : (
                                            <span className="text-gray-400 italic">Chưa có thông tin</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-center">
                                    {review.roomId && review.roomId !== '' ? (
                                        <RoomImageDisplay roomId={review.roomId} roomName={review.roomName} />
                                    ) : (
                                        <span className="text-gray-400 italic text-sm">Chưa có thông tin</span>
                                    )}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-center">
                                    <StarRating score={review.score} />
                                </td>
                                <td className="px-4 py-4 text-sm text-gray-700">
                                    <div className="truncate" title={review.comment || 'Không có bình luận'}>
                                        {review.comment || <span className="text-gray-400 italic">Không có bình luận</span>}
                                    </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-center text-sm">
                                    {review.photos && review.photos.length > 0 ? (
                                        <PhotoGallery photos={review.photos} />
                                    ) : (
                                        <span className="text-gray-400">-</span>
                                    )}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 text-center">
                                    {review.createdAt.toLocaleDateString('vi-VN')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

