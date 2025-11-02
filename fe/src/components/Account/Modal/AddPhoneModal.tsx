'use client';

import { useState } from 'react';
import styles from './AddPhoneModal.module.css';

interface AddPhoneModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (phoneNumber: string) => void;
}

export default function AddPhoneModal({ isOpen, onClose, onSave }: AddPhoneModalProps) {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) {
        return null;
    }

    const handleSave = async () => {
        setIsLoading(true);
        try {
            // Giả lập gọi API
            await new Promise(resolve => setTimeout(resolve, 1000));
            onSave(phoneNumber);
            onClose(); // Đóng modal 
        } catch (error) {
            console.error("Lỗi khi lưu số điện thoại:", error);
            alert("Đã xảy ra lỗi, vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.modalBackdrop} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <h4 className="fw-bold">THÊM SỐ ĐIỆN THOẠI</h4>
                <p className="text-muted">
                    Thêm số điện thoại đang sử dụng của bạn để đăng nhập và nhận thông báo
                </p>

                <div className="mb-3">
                    <label className="form-label">Điện thoại</label>
                    <div className="input-group">
                        <span className="input-group-text">+84</span>
                        <input
                            type="tel"
                            className="form-control"
                            placeholder="Ví dụ: 901234567"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                        />
                    </div>
                </div>

                <button
                    className="btn btn-primary btn-lg w-100 rounded-pill mb-2"
                    onClick={handleSave}
                    disabled={isLoading || phoneNumber.length < 9}
                >
                    {isLoading ? 'Đang lưu...' : 'Lưu'}
                </button>
                <button
                    className="btn btn-light btn-lg w-100 rounded-pill"
                    onClick={onClose}
                    disabled={isLoading}
                >
                    Hủy
                </button>
            </div>
        </div>
    );
}