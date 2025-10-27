// components/Admin/UserFormModal.tsx
"use client";

import { Modal } from 'react-bootstrap';
import UserForm from './UserForm';
import type { User } from '@/types';

interface UserFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    onSave: (formData: FormData) => void;
}

export default function UserFormModal({ isOpen, onClose, user, onSave }: UserFormModalProps) {
    const isEditing = !!user;
    const title = isEditing ? 'Chỉnh sửa Người dùng' : 'Thêm Người dùng mới';

    return (
        <Modal show={isOpen} onHide={onClose} centered>
            <Modal.Header closeButton>
                <Modal.Title as="h5">{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <UserForm
                    user={user}
                    onSave={onSave}
                    onCancel={onClose}
                />
            </Modal.Body>
        </Modal>
    );
}