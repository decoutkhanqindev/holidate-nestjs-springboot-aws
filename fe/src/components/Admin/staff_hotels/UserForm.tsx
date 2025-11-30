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
    const [roleName, setRoleName] = useState<string>(''); // Tên quyền tự do nhập (VD: "Nhân viên lễ tân", "Bảo trì")

    useEffect(() => {
        const loadRoles = async () => {
            try {
                setIsLoadingRoles(true);
                const rolesData = await getRoles();

                // Filter: Admin khách sạn chỉ có thể tạo nhân viên
                // Tìm role HOTEL_STAFF hoặc các biến thể, nếu không có thì lấy role đầu tiên (trừ ADMIN và SUPER_ADMIN)
                const hotelStaffRole = rolesData.find(role => {
                    const name = role.name?.toUpperCase();
                    return name === 'HOTEL_STAFF' || 
                           name === 'HOTEL_STAFF' ||
                           name === 'STAFF' ||
                           (name && name.includes('STAFF') && !name.includes('ADMIN'));
                });
                
                // Nếu không tìm thấy HOTEL_STAFF, lấy role đầu tiên không phải ADMIN/SUPER_ADMIN
                let selectedRole = hotelStaffRole;
                if (!selectedRole && rolesData.length > 0) {
                    // Lọc bỏ ADMIN và SUPER_ADMIN
                    const nonAdminRoles = rolesData.filter(role => {
                        const name = role.name?.toUpperCase();
                        return name !== 'ADMIN' && name !== 'SUPER_ADMIN';
                    });
                    selectedRole = nonAdminRoles.length > 0 ? nonAdminRoles[0] : rolesData[0];
                }
                
                if (selectedRole) {
                    setRoles([selectedRole]);
                    setUserRoleId(selectedRole.id);
                } else {
                    console.error('[UserForm] ❌ No role available! Available roles:', rolesData.map(r => r.name));
                    // Nếu vẫn không có, set userRoleId = '' để button disable và hiển thị lỗi
                    setUserRoleId('');
                }

                // Nếu đang edit, lấy role name từ localStorage hoặc user (nếu có)
                if (user) {
                    // Ưu tiên lấy từ localStorage (roleName tự do nhập)
                    const savedRoleName = typeof window !== 'undefined' 
                        ? localStorage.getItem(`user_role_${user.id}`) 
                        : null;
                    if (savedRoleName) {
                        setRoleName(savedRoleName);
                    } else if (typeof user.role === 'string') {
                        setRoleName(user.role);
                    } else if (user.role?.description) {
                        setRoleName(user.role.description);
                    }
                }
            } catch (error) {
                // Nếu lỗi, vẫn set isLoadingRoles = false để không bị disable button mãi
                // Nhưng không set userRoleId, button sẽ bị disable vì không có roleId
                setUserRoleId('');
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
            // Khi edit, gửi roleName mới (nếu có)
            const roleNameInput = formData.get('roleName') as string;
            if (roleNameInput) {
                formData.append('roleName', roleNameInput);
            }
        } else {
            // Khi tạo mới, cần roleId và authProvider
            // RoleId mặc định là HOTEL_STAFF (đã được set trong useEffect)
            if (!userRoleId) {
                alert('Vui lòng đợi hệ thống tải quyền');
                return;
            }
            formData.append('roleId', userRoleId);
            formData.append('authProvider', 'LOCAL'); // Mặc định LOCAL
            
            // Gửi roleName tự do nhập (VD: "Nhân viên lễ tân", "Bảo trì")
            const roleNameInput = formData.get('roleName') as string;
            if (roleNameInput) {
                formData.append('roleName', roleNameInput);
            }
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
                <label htmlFor="roleName" className="form-label">Quyền <span className="text-danger">*</span></label>
                <input
                    type="text"
                    className="form-control"
                    id="roleName"
                    name="roleName"
                    value={roleName}
                    onChange={(e) => {
                        const value = e.target.value;
                        setRoleName(value);
                    }}
                    placeholder="VD: Nhân viên lễ tân, Bảo trì, Nhân viên vệ sinh..."
                    required
                />
                <small className="form-text text-muted">Nhập tên quyền/chức vụ của nhân viên (VD: Nhân viên lễ tân, Bảo trì, Nhân viên vệ sinh...)</small>
                {!roleName.trim() && (
                    <small className="form-text text-danger d-block mt-1">⚠️ Vui lòng nhập quyền/chức vụ để tiếp tục</small>
                )}
            </div>

            {/* Nút hành động */}
            <div className="d-flex justify-content-end gap-2 mt-4 border-top pt-3">
                <button type="button" className="btn btn-secondary" onClick={onCancel}>
                    Hủy
                </button>
                <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={(() => {
                        const disabled = isLoadingRoles || (!isEditing && !userRoleId) || !roleName.trim();
                        // Chỉ log khi state thay đổi để tránh spam console
                        if (disabled !== (isLoadingRoles || (!isEditing && !userRoleId) || !roleName.trim())) {
                            console.log('[UserForm] Button disabled state changed:', {
                                isLoadingRoles,
                                userRoleId,
                                roleName: roleName.trim(),
                                isEditing,
                                disabled
                            });
                        }
                        return disabled;
                    })()}
                    title={
                        isLoadingRoles ? 'Đang tải quyền...' :
                        (!isEditing && !userRoleId) ? 'Không tìm thấy quyền. Vui lòng refresh trang.' :
                        !roleName.trim() ? 'Vui lòng nhập quyền/chức vụ' :
                        ''
                    }
                    onClick={(e) => {
                        if (isLoadingRoles || (!isEditing && !userRoleId) || !roleName.trim()) {
                            e.preventDefault();
                            console.warn('[UserForm] ⚠️ Button clicked but form is not ready:', {
                                isLoadingRoles,
                                userRoleId,
                                roleName,
                                isEditing
                            });
                            if (!isEditing && !userRoleId) {
                                alert('Không tìm thấy quyền. Vui lòng refresh trang và thử lại.');
                            }
                            return false;
                        }
                    }}
                >
                    {isLoadingRoles ? 'Đang tải...' : (isEditing ? 'Cập nhật' : 'Thêm mới')}
                </button>
                {!isEditing && !userRoleId && !isLoadingRoles && (
                    <div className="alert alert-warning mt-2">
                        <small>⚠️ Không tìm thấy quyền. Vui lòng refresh trang hoặc liên hệ quản trị viên.</small>
                    </div>
                )}
            </div>
        </form>
    );
}