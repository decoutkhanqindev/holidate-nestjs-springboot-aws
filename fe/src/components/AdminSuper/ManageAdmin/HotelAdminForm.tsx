// components/Admin/HotelAdminForm.tsx
"use client";
import { useState, useEffect } from 'react';
import type { HotelAdmin } from '@/types';
import { getHotelsForSelection } from '@/lib/Super_Admin/hotelAdminService';

interface FormProps {
    admin: HotelAdmin | null;
    onSave: (fd: FormData) => void;
    onCancel: () => void;
}

interface HotelOption {
    id: string;
    name: string;
}

export default function HotelAdminForm({ admin, onSave, onCancel }: FormProps) {
    const isEditing = !!admin;
    const [hotels, setHotels] = useState<HotelOption[]>([]);
    const [isLoadingHotels, setIsLoadingHotels] = useState(true);
    const [selectedHotelId, setSelectedHotelId] = useState<string>(admin?.managedHotel.id || '');

    useEffect(() => {
        const loadHotels = async () => {
            try {
                setIsLoadingHotels(true);
                const hotelsData = await getHotelsForSelection();
                setHotels(hotelsData);

                // Nếu đang edit và có hotel, set selected hotel
                if (admin?.managedHotel.id) {
                    setSelectedHotelId(admin.managedHotel.id);
                }
            } catch (error) {
            } finally {
                setIsLoadingHotels(false);
            }
        };

        loadHotels();
    }, [admin]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        if (admin) {
            formData.append('id', admin.id.toString());
        } else {
            // Khi tạo mới, cần authProvider
            formData.append('authProvider', 'LOCAL');
        }

        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* Ẩn mục chọn khách sạn - sẽ được gán tự động hoặc xử lý ở backend */}
            {false && (
                <div className="mb-3">
                    <label htmlFor="hotelId" className="form-label">
                        Khách sạn quản lý <span className="text-danger">*</span>
                    </label>
                    {isLoadingHotels ? (
                        <div className="form-select">Đang tải danh sách khách sạn...</div>
                    ) : (
                        <select
                            id="hotelId"
                            name="hotelId"
                            className="form-select"
                            value={selectedHotelId}
                            onChange={(e) => setSelectedHotelId(e.target.value)}
                            required
                            disabled={isEditing} // Hotel không thể đổi khi edit
                        >
                            <option value="">-- Chọn khách sạn --</option>
                            {hotels.map(hotel => (
                                <option key={hotel.id} value={hotel.id}>
                                    {hotel.name}
                                </option>
                            ))}
                        </select>
                    )}
                    {isEditing && (
                        <small className="form-text text-muted">Khách sạn không thể thay đổi</small>
                    )}
                </div>
            )}
            {/* Hidden input để vẫn gửi hotelId nếu có (khi edit) */}
            {isEditing && selectedHotelId && (
                <input type="hidden" name="hotelId" value={selectedHotelId} />
            )}
            <div className="mb-3">
                <label htmlFor="fullName" className="form-label">
                    Họ và tên <span className="text-danger">*</span>
                </label>
                <input
                    type="text"
                    className="form-control"
                    id="fullName"
                    name="fullName"
                    defaultValue={admin?.username || ''}
                    required
                    minLength={3}
                    maxLength={100}
                />
            </div>
            <div className="mb-3">
                <label htmlFor="email" className="form-label">
                    Email <span className="text-danger">*</span>
                </label>
                <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    defaultValue={admin?.email || ''}
                    required
                    disabled={isEditing} // Email không thể đổi khi edit
                />
                {isEditing && (
                    <small className="form-text text-muted">Email không thể thay đổi</small>
                )}
            </div>
            <div className="mb-3">
                <label htmlFor="phoneNumber" className="form-label">Số điện thoại</label>
                <input
                    type="tel"
                    className="form-control"
                    id="phoneNumber"
                    name="phoneNumber"
                    placeholder="VD: 0123456789"
                />
            </div>
            {!isEditing && (
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                        Mật khẩu <span className="text-danger">*</span>
                    </label>
                    <input
                        type="password"
                        className="form-control"
                        id="password"
                        name="password"
                        required
                        minLength={8}
                        placeholder="Tối thiểu 8 ký tự"
                    />
                    <small className="form-text text-muted">Mật khẩu phải có ít nhất 8 ký tự</small>
                </div>
            )}
            <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                <button type="button" className="btn btn-secondary" onClick={onCancel}>
                    Hủy
                </button>
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isLoadingHotels}
                >
                    {isEditing ? 'Cập nhật' : 'Thêm mới'}
                </button>
            </div>
        </form>
    );
}