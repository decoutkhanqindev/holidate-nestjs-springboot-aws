"use client";

import { useState, useRef } from 'react';
import { createReview, CreateReviewPayload } from '@/service/reviewService';
import styles from './CreateReviewForm.module.css';

interface CreateReviewFormProps {
    bookingId: string;
    hotelName: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function CreateReviewForm({ bookingId, hotelName, onSuccess, onCancel }: CreateReviewFormProps) {
    const [score, setScore] = useState<number>(10);
    const [comment, setComment] = useState('');
    const [photos, setPhotos] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleScoreChange = (newScore: number) => {
        if (newScore >= 1 && newScore <= 10) {
            setScore(newScore);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setPhotos(prev => [...prev, ...files].slice(0, 5)); // Giới hạn 5 ảnh
        }
    };

    const handleRemovePhoto = (index: number) => {
        setPhotos(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (score < 1 || score > 10) {
            setError('Điểm đánh giá phải từ 1 đến 10');
            return;
        }

        setIsSubmitting(true);

        try {
            const payload: CreateReviewPayload = {
                bookingId,
                score,
                comment: comment.trim() || undefined,
                photos: photos.length > 0 ? photos : undefined,
            };

            await createReview(payload);
            
            if (onSuccess) {
                onSuccess();
            }
        } catch (err: any) {
            setError(err.message || 'Không thể tạo đánh giá. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.formContainer}>
            <h3 className={styles.formTitle}>Viết đánh giá cho {hotelName}</h3>
            
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Điểm đánh giá (1-10 sao)</label>
                    <div className={styles.scoreSelector}>
                        <button
                            type="button"
                            onClick={() => handleScoreChange(score - 1)}
                            disabled={score <= 1}
                            className={styles.scoreButton}
                        >
                            -
                        </button>
                        <div className={styles.scoreDisplay}>
                            <span className={styles.scoreValue}>{score}</span>
                            <span className={styles.scoreStars}>
                                {Array.from({ length: score }).map((_, i) => (
                                    <span key={i} className={styles.star}>★</span>
                                ))}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleScoreChange(score + 1)}
                            disabled={score >= 10}
                            className={styles.scoreButton}
                        >
                            +
                        </button>
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="comment" className={styles.label}>
                        Bình luận (tùy chọn)
                    </label>
                    <textarea
                        id="comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className={styles.textarea}
                        rows={5}
                        placeholder="Chia sẻ trải nghiệm của bạn về khách sạn này..."
                        maxLength={1000}
                    />
                    <div className={styles.charCount}>
                        {comment.length}/1000 ký tự
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Ảnh (tùy chọn, tối đa 5 ảnh)</label>
                    <div className={styles.photosSection}>
                        {photos.length > 0 && (
                            <div className={styles.photosPreview}>
                                {photos.map((photo, index) => (
                                    <div key={index} className={styles.photoPreviewItem}>
                                        <img
                                            src={URL.createObjectURL(photo)}
                                            alt={`Preview ${index + 1}`}
                                            className={styles.photoPreview}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemovePhoto(index)}
                                            className={styles.removePhotoButton}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {photos.length < 5 && (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className={styles.addPhotoButton}
                            >
                                <span>+</span>
                                Thêm ảnh
                            </button>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileChange}
                            className={styles.fileInput}
                        />
                    </div>
                </div>

                {error && (
                    <div className={styles.errorMessage}>
                        {error}
                    </div>
                )}

                <div className={styles.formActions}>
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isSubmitting}
                            className={styles.cancelButton}
                        >
                            Hủy
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={styles.submitButton}
                    >
                        {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                    </button>
                </div>
            </form>
        </div>
    );
}










































