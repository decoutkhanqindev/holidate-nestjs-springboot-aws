// components/Admin/UserForm.tsx
"use client";
import { useState, useEffect } from 'react';
import type { User } from '@/types';
import { getRoles } from '@/lib/AdminAPI/userService';

interface Role {
    id: string;
    name: string;
    description?: string;
}

interface UserFormProps {
    user: User | null;
    onSave: (formData: FormData) => void;
    onCancel: () => void;
}

export default function UserForm({ user, onSave, onCancel }: UserFormProps) {
    const isEditing = !!user;
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoadingRoles, setIsLoadingRoles] = useState(true);
    const [userRoleId, setUserRoleId] = useState<string>('');

    useEffect(() => {
        const loadRoles = async () => {
            try {
                setIsLoadingRoles(true);
                const rolesData = await getRoles();

                // Filter: Admin khách sạn chỉ có thể tạo HOTEL_STAFF
                // Lấy roles HOTEL_STAFF và CUSTOMER (hoặc USER)
                const allowedRoles = rolesData.filter(role =>
                    role.name === 'HOTEL_STAFF' || role.name === 'CUSTOMER' || role.name === 'USER'
                );

                setRoles(allowedRoles);

                // Nếu đang edit, tìm roleId từ user.role
                if (user) {
                    const matchingRole = allowedRoles.find(role => {
                        const roleName = role.name.toUpperCase();
                        return (roleName === 'USER' && user.role === 'CUSTOMER') ||
                            roleName === user.role;
                    });
                    if (matchingRole) {
                        setUserRoleId(matchingRole.id);
                    }
                }
            } catch (error) {
                console.error('[UserForm] Error loading roles:', error);
            } finally {
                setIsLoadingRoles(false);
            }
        };

        loadRoles();
    }, [user]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        if (user) {
            formData.append('id', user.id.toString()); // Gửi ID lên khi sửa
        } else {
            // Khi tạo mới, cần roleId và authProvider
            const roleId = formData.get('roleId') as string;
            if (!roleId) {
                alert('Vui lòng chọn quyền');
                return;
            }
            formData.append('authProvider', 'LOCAL'); // Mặc định LOCAL
        }

        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-3">
                <label htmlFor="fullName" className="form-label">Họ và tên <span className="text-danger">*</span></label>
                <input
                    type="text"
                    className="form-control"
                    id="fullName"
                    name="fullName"
                    defaultValue={user?.username || ''}
                    required
                    minLength={3}
                    maxLength={100}
                />
            </div>
            <div className="mb-3">
                <label htmlFor="email" className="form-label">Email <span className="text-danger">*</span></label>
                <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    defaultValue={user?.email || ''}
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
                    <label htmlFor="password" className="form-label">Mật khẩu <span className="text-danger">*</span></label>
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
            <div className="mb-3">
                <label htmlFor="roleId" className="form-label">Quyền <span className="text-danger">*</span></label>
                {isLoadingRoles ? (
                    <div className="form-control">Đang tải...</div>
                ) : (
                    <select
                        id="roleId"
                        name="roleId"
                        className="form-select"
                        value={userRoleId}
                        onChange={(e) => setUserRoleId(e.target.value)}
                        required
                        disabled={isEditing} // Role không thể đổi khi edit
                    >
                        <option value="">-- Chọn quyền --</option>
                        {roles.map(role => (
                            <option key={role.id} value={role.id}>
                                {role.name === 'HOTEL_STAFF' ? 'Nhân viên khách sạn' :
                                    role.name === 'CUSTOMER' || role.name === 'USER' ? 'Khách hàng' :
                                        role.name}
                            </option>
                        ))}
                    </select>
                )}
                {isEditing && (
                    <small className="form-text text-muted">Quyền không thể thay đổi</small>
                )}
            </div>

            {/* Nút hành động */}
            <div className="d-flex justify-content-end gap-2 mt-4 border-top pt-3">
                <button type="button" className="btn btn-secondary" onClick={onCancel}>
                    Hủy
                </button>
                <button type="submit" className="btn btn-primary" disabled={isLoadingRoles || (!isEditing && !userRoleId)}>
                    {isEditing ? 'Cập nhật' : 'Thêm mới'}
                </button>
            </div>
        </form>
    );
}