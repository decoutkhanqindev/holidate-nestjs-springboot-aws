// components/AdminSuper/discounts/DiscountForm.tsx
"use client";
import { useState } from 'react';
import type { SuperDiscount } from '@/types';

interface FormProps {
    discount: SuperDiscount | null;
    onSave: (fd: FormData) => void;
    onCancel: () => void;
}

// Helper để format ngày cho input type="date" (YYYY-MM-DD)
function formatDateForInput(date: Date | string | undefined): string {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export default function DiscountForm({ discount, onSave, onCancel }: FormProps) {
    const isEditing = !!discount;
    const [active, setActive] = useState(discount?.active ?? true);

    // Type guard để TypeScript hiểu discount có thể là SuperDiscount
    const discountData: SuperDiscount | null = discount;

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        if (discount) {
            formData.append('id', discount.id);
        }

        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-3">
                <label htmlFor="code" className="form-label">
                    Mã giảm giá <span className="text-danger">*</span>
                </label>
                <input
                    type="text"
                    className="form-control"
                    id="code"
                    name="code"
                    defaultValue={discount?.code || ''}
                    required
                    maxLength={50}
                    placeholder="VD: SUMMER2024"
                    disabled={isEditing} // Mã không thể đổi khi edit
                />
                {isEditing && (
                    <small className="form-text text-muted">Mã giảm giá không thể thay đổi</small>
                )}
            </div>

            <div className="mb-3">
                <label htmlFor="description" className="form-label">
                    Mô tả <span className="text-danger">*</span>
                </label>
                <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    rows={3}
                    defaultValue={discount?.description || ''}
                    required
                    placeholder="Mô tả về mã giảm giá..."
                />
            </div>

            <div className="row">
                <div className="col-md-6 mb-3">
                    <label htmlFor="percentage" className="form-label">
                        Phần trăm giảm giá (%) <span className="text-danger">*</span>
                    </label>
                    <input
                        type="number"
                        className="form-control"
                        id="percentage"
                        name="percentage"
                        defaultValue={discount?.percentage || ''}
                        required
                        min="0"
                        max="100"
                        step="0.1"
                        placeholder="10"
                    />
                    <small className="form-text text-muted">Từ 0 đến 100%</small>
                </div>

                <div className="col-md-6 mb-3">
                    <label htmlFor="usageLimit" className="form-label">
                        Giới hạn sử dụng <span className="text-danger">*</span>
                    </label>
                    <input
                        type="number"
                        className="form-control"
                        id="usageLimit"
                        name="usageLimit"
                        defaultValue={discount?.usageLimit || ''}
                        required
                        min="1"
                        placeholder="100"
                    />
                    <small className="form-text text-muted">Số lần tối đa có thể sử dụng</small>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6 mb-3">
                    <label htmlFor="timesUsed" className="form-label">
                        Đã sử dụng
                    </label>
                    <input
                        type="number"
                        className="form-control"
                        id="timesUsed"
                        name="timesUsed"
                        defaultValue={discount?.timesUsed || 0}
                        min="0"
                        placeholder="0"
                    />
                    <small className="form-text text-muted">Số lần đã sử dụng (mặc định: 0)</small>
                </div>

                <div className="col-md-6 mb-3">
                    <label htmlFor="minBookingPrice" className="form-label">
                        Giá đặt phòng tối thiểu (VNĐ) <span className="text-danger">*</span>
                    </label>
                    <input
                        type="number"
                        className="form-control"
                        id="minBookingPrice"
                        name="minBookingPrice"
                        defaultValue={discount?.minBookingPrice || ''}
                        required
                        min="0"
                        placeholder="100000"
                    />
                </div>
            </div>

            <div className="row">
                <div className="col-md-6 mb-3">
                    <label htmlFor="minBookingCount" className="form-label">
                        Số lượng đặt phòng tối thiểu <span className="text-danger">*</span>
                    </label>
                    <input
                        type="number"
                        className="form-control"
                        id="minBookingCount"
                        name="minBookingCount"
                        defaultValue={discount?.minBookingCount || ''}
                        required
                        min="1"
                        placeholder="1"
                    />
                </div>

                {isEditing && (
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Trạng thái</label>
                        <div className="form-check form-switch mt-2">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                id="active"
                                name="active"
                                checked={active}
                                onChange={(e) => setActive(e.target.checked)}
                                value={active ? 'true' : 'false'}
                            />
                            <label className="form-check-label" htmlFor="active">
                                {active ? 'Đang hoạt động' : 'Vô hiệu hóa'}
                            </label>
                        </div>
                        <input type="hidden" name="activeValue" value={active ? 'true' : 'false'} />
                    </div>
                )}
            </div>

            <div className="row">
                <div className="col-md-6 mb-3">
                    <label htmlFor="validFrom" className="form-label">
                        Ngày bắt đầu <span className="text-danger">*</span>
                    </label>
                    {isEditing ? (
                        // Khi edit: dùng readOnly (không disabled) để vẫn gửi value
                        <>
                            <input
                                type="date"
                                className="form-control"
                                id="validFrom"
                                name="validFrom"
                                defaultValue={formatDateForInput(discount?.validFrom)}
                                readOnly
                                style={{ backgroundColor: '#e9ecef', cursor: 'not-allowed' }}
                            />
                            <small className="form-text text-muted">Ngày bắt đầu không thể thay đổi</small>
                        </>
                    ) : (
                        // Khi tạo mới: chỉ được chọn từ ngày hiện tại trở đi (không được chọn ngày quá khứ)
                        <>
                            <input
                                type="date"
                                className="form-control"
                                id="validFrom"
                                name="validFrom"
                                defaultValue={discountData?.validFrom ? formatDateForInput(discountData.validFrom) : ''}
                                required
                                min={new Date().toISOString().split('T')[0]} // Chỉ được chọn từ ngày hiện tại trở đi
                            />
                            <small className="form-text text-muted">Ngày bắt đầu không được chọn ngày quá khứ (từ hôm nay trở đi)</small>
                        </>
                    )}
                </div>

                <div className="col-md-6 mb-3">
                    <label htmlFor="validTo" className="form-label">
                        Ngày kết thúc <span className="text-danger">*</span>
                    </label>
                    <input
                        type="date"
                        className="form-control"
                        id="validTo"
                        name="validTo"
                        defaultValue={formatDateForInput(discount?.validTo)}
                        required
                        min={isEditing && discount?.validFrom
                            ? formatDateForInput(discount.validFrom)
                            : new Date().toISOString().split('T')[0]} // Ít nhất phải từ ngày bắt đầu hoặc hôm nay
                    />
                    {isEditing && (
                        <small className="form-text text-muted">Ngày kết thúc phải sau ngày bắt đầu</small>
                    )}
                </div>
            </div>

            {/* Note: hotelId và specialDayId có thể thêm sau nếu cần */}
            {/* <div className="mb-3">
                <label htmlFor="hotelId" className="form-label">Khách sạn (tùy chọn)</label>
                <input
                    type="text"
                    className="form-control"
                    id="hotelId"
                    name="hotelId"
                    defaultValue={discount?.hotel?.id || ''}
                    placeholder="ID khách sạn (nếu áp dụng cho khách sạn cụ thể)"
                />
            </div> */}

            <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                <button type="button" className="btn btn-secondary" onClick={onCancel}>
                    Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                    {isEditing ? 'Cập nhật' : 'Thêm mới'}
                </button>
            </div>
        </form>
    );
}

