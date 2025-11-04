"use client";

import { useState } from 'react';
import type { Review } from '@/types';

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
        <div className="flex items-center gap-1">
            {Array.from({ length: fullStars }).map((_, i) => (
                <span key={i} className="text-yellow-400 text-lg">★</span>
            ))}
            {hasHalfStar && <span className="text-yellow-400 text-lg">☆</span>}
            {Array.from({ length: emptyStars }).map((_, i) => (
                <span key={i} className="text-gray-300 text-lg">★</span>
            ))}
            <span className="ml-2 text-sm text-gray-600">({score}/10)</span>
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
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người đánh giá</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách sạn</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phòng</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Điểm đánh giá</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bình luận</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ảnh</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {reviews.map((review, index) => (
                            <tr key={review.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{index + 1}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        {review.userAvatar && (
                                            <img 
                                                src={review.userAvatar} 
                                                alt={review.userName}
                                                className="h-10 w-10 rounded-full mr-3"
                                            />
                                        )}
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{review.userName}</div>
                                            {review.userId && (
                                                <div className="text-sm text-gray-500">{review.userId}</div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <div className="font-medium text-gray-900">
                                        {review.hotelName !== 'N/A' ? review.hotelName : (
                                            <span className="text-gray-400 italic">Chưa có thông tin</span>
                                        )}
                                    </div>
                                    {review.hotelId && review.hotelId !== '' && (
                                        <div className="text-xs text-gray-500">ID: {review.hotelId.substring(0, 8)}...</div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <div className="font-medium text-gray-700">
                                        {review.roomName !== 'N/A' ? review.roomName : (
                                            <span className="text-gray-400 italic">Chưa có thông tin</span>
                                        )}
                                    </div>
                                    {review.roomId && review.roomId !== '' && (
                                        <div className="text-xs text-gray-500">ID: {review.roomId.substring(0, 8)}...</div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <StarRating score={review.score} />
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                                    <div className="truncate" title={review.comment || 'Không có bình luận'}>
                                        {review.comment || <span className="text-gray-400 italic">Không có bình luận</span>}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                    {review.photos && review.photos.length > 0 ? (
                                        <PhotoGallery photos={review.photos} />
                                    ) : (
                                        <span className="text-gray-400">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">
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

