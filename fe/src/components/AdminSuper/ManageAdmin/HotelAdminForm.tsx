// components/Admin/HotelAdminForm.tsx
"use client";
import type { HotelAdmin } from '@/types';

// Giả lập danh sách khách sạn để chọn
const hotels = [
    { id: 'hotel-001', name: 'Grand Saigon' },
    { id: 'hotel-002', name: 'Hanoi Pearl' },
    { id: 'hotel-003', name: 'Furama Resort Danang' },
];

interface FormProps { admin: HotelAdmin | null; onSave: (fd: FormData) => void; onCancel: () => void; }

export default function HotelAdminForm({ admin, onSave, onCancel }: FormProps) {
    const isEditing = !!admin;
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        if (admin) formData.append('id', admin.id.toString());
        onSave(formData);
    };
    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-3">
                <label htmlFor="managedHotel" className="form-label">Khách sạn quản lý</label>
                <select id="managedHotel" name="managedHotelId" className="form-select" defaultValue={admin?.managedHotel.id} required>
                    {hotels.map(hotel => <option key={hotel.id} value={hotel.id}>{hotel.name}</option>)}
                </select>
            </div>
            <div className="mb-3">
                <label htmlFor="username" className="form-label">Tên tài khoản</label>
                <input type="text" className="form-control" id="username" name="username" defaultValue={admin?.username} required />
            </div>
            <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input type="email" className="form-control" id="email" name="email" defaultValue={admin?.email} required />
            </div>
            <div className="mb-3">
                <label htmlFor="password" className="form-label">Mật khẩu</label>
                <input type="password" className="form-control" id="password" name="password" placeholder={isEditing ? "Để trống nếu không đổi" : ""} required={!isEditing} />
            </div>
            <div className="mb-3">
                <label htmlFor="status" className="form-label">Trạng thái</label>
                <select id="status" name="status" className="form-select" defaultValue={admin?.status || 'ACTIVE'}>
                    <option value="ACTIVE">Hoạt động</option>
                    <option value="INACTIVE">Vô hiệu hóa</option>
                </select>
            </div>
            <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                <button type="button" className="btn btn-secondary" onClick={onCancel}>Hủy</button>
                <button type="submit" className="btn btn-primary">{isEditing ? 'Cập nhật' : 'Thêm mới'}</button>
            </div>
        </form>
    );
}