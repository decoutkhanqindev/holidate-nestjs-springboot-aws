"use client";

import { useState } from 'react';
import Image from 'next/image';
import type { Review } from '@/types';
import styles from './ReviewsList.module.css';

interface ReviewsListProps {
    reviews: Review[];
    isLoading?: boolean;
    onLoadMore?: () => void;
    hasMore?: boolean;
}

// Component hiển thị số sao
function StarRating({ score }: { score: number }) {
    const fullStars = Math.floor(score);
    const hasHalfStar = score % 1 >= 0.5;
    const emptyStars = 10 - fullStars - (hasHalfStar ? 1 : 0);

    return (
        <div className={styles.starRating}>
            <div className={styles.stars}>
                {Array.from({ length: fullStars }).map((_, i) => (
                    <span key={i} className={styles.starFull}>★</span>
                ))}
                {hasHalfStar && <span className={styles.starHalf}>☆</span>}
                {Array.from({ length: emptyStars }).map((_, i) => (
                    <span key={i} className={styles.starEmpty}>★</span>
                ))}
            </div>
            <span className={styles.scoreText}>({score}/10)</span>
        </div>
    );
}

// Component hiển thị gallery ảnh
function PhotoGallery({ photos }: { photos: Array<{ id: string; url: string }> }) {
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

    if (photos.length === 0) return null;

    return (
        <>
            <div className={styles.photoGallery}>
                {photos.slice(0, 3).map((photo, idx) => (
                    <img
                        key={photo.id}
                        src={photo.url}
                        alt={`Review photo ${idx + 1}`}
                        className={styles.photoThumbnail}
                        onClick={() => setSelectedPhoto(photo.url)}
                    />
                ))}
                {photos.length > 3 && (
                    <span className={styles.photoCount}>+{photos.length - 3}</span>
                )}
            </div>

            {/* Modal xem ảnh */}
            {selectedPhoto && (
                <div
                    className={styles.photoModal}
                    onClick={() => setSelectedPhoto(null)}
                >
                    <div className={styles.photoModalContent}>
                        <img
                            src={selectedPhoto}
                            alt="Review photo"
                            className={styles.photoModalImage}
                            onClick={(e) => e.stopPropagation()}
                        />
                        <button
                            onClick={() => setSelectedPhoto(null)}
                            className={styles.photoModalClose}
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
                            className={styles.photoModalNav}
                            style={{ left: '16px' }}
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
                            className={styles.photoModalNav}
                            style={{ right: '16px' }}
                        >
                            ›
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

export default function ReviewsList({ reviews, isLoading, onLoadMore, hasMore }: ReviewsListProps) {
    if (isLoading && reviews.length === 0) {
        return (
            <div className={styles.reviewsContainer}>
                <div className={styles.loading}>Đang tải đánh giá...</div>
            </div>
        );
    }

    if (reviews.length === 0) {
        return (
            <div className={styles.reviewsContainer}>
                <div className={styles.emptyState}>
                    <p>Chưa có đánh giá nào cho khách sạn này.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.reviewsContainer}>
            <div className={styles.reviewsList}>
                {reviews.map((review) => (
                    <div key={review.id} className={styles.reviewCard}>
                        <div className={styles.reviewHeader}>
                            <div className={styles.reviewUser}>
                                {review.userAvatar ? (
                                    <Image
                                        src={review.userAvatar}
                                        alt={review.userName}
                                        width={48}
                                        height={48}
                                        className={styles.userAvatar}
                                    />
                                ) : (
                                    <div className={styles.userAvatarPlaceholder}>
                                        {review.userName.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div className={styles.userInfo}>
                                    <div className={styles.userName}>{review.userName}</div>
                                    <div className={styles.reviewDate}>
                                        {review.createdAt.toLocaleDateString('vi-VN', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </div>
                                </div>
                            </div>
                            <StarRating score={review.score} />
                        </div>

                        {review.comment && (
                            <div className={styles.reviewComment}>
                                {review.comment}
                            </div>
                        )}

                        {review.photos && review.photos.length > 0 && (
                            <div className={styles.reviewPhotos}>
                                <PhotoGallery photos={review.photos} />
                            </div>
                        )}

                        {review.roomName && review.roomName !== 'N/A' && (
                            <div className={styles.reviewRoom}>
                                <span className={styles.roomLabel}>Phòng:</span> {review.roomName}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {hasMore && onLoadMore && (
                <div className={styles.loadMoreContainer}>
                    <button
                        onClick={onLoadMore}
                        disabled={isLoading}
                        className={styles.loadMoreButton}
                    >
                        {isLoading ? 'Đang tải...' : 'Tải thêm đánh giá'}
                    </button>
                </div>
            )}
        </div>
    );
}







