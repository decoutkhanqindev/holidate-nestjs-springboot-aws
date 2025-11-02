// components/Admin/UserForm.tsx
"use client";
import type { User } from '@/types';

interface UserFormProps {
    user: User | null;
    onSave: (formData: FormData) => void;
    onCancel: () => void;
}

export default function UserForm({ user, onSave, onCancel }: UserFormProps) {
    const isEditing = !!user;

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        if (user) {
            formData.append('id', user.id.toString()); // Gửi ID lên khi sửa
        }
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-3">
                <label htmlFor="username" className="form-label">Tên tài khoản</label>
                <input
                    type="text"
                    className="form-control"
                    id="username"
                    name="username"
                    defaultValue={user?.username || ''}
                    required
                />
            </div>
            <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    defaultValue={user?.email || ''}
                    required
                />
            </div>
            <div className="mb-3">
                <label htmlFor="password" className="form-label">Mật khẩu</label>
                <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    placeholder={isEditing ? "Để trống nếu không muốn đổi" : ""}
                    required={!isEditing} // Mật khẩu là bắt buộc khi thêm mới
                />
            </div>
            <div className="row">
                <div className="col-md-6 mb-3">
                    <label htmlFor="role" className="form-label">Quyền</label>
                    <select id="role" name="role" className="form-select" defaultValue={user?.role || 'CUSTOMER'}>
                        <option value="CUSTOMER">Khách hàng</option>
                        <option value="HOTEL_STAFF">Nhân viên</option>
                    </select>
                </div>
                <div className="col-md-6 mb-3">
                    <label htmlFor="status" className="form-label">Trạng thái</label>
                    <select id="status" name="status" className="form-select" defaultValue={user?.status || 'ACTIVE'}>
                        <option value="ACTIVE">Kích hoạt</option>
                        <option value="INACTIVE">Vô hiệu hóa</option>
                    </select>
                </div>
            </div>

            {/* Nút hành động */}
            <div className="d-flex justify-content-end gap-2 mt-4 border-top pt-3">
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