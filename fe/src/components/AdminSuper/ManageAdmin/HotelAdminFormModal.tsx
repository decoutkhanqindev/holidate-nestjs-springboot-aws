// components/Admin/HotelAdminFormModal.tsx
"use client";
import { Modal } from 'react-bootstrap';
import HotelAdminForm from './HotelAdminForm';
import type { HotelAdmin } from '@/types';

interface ModalProps { isOpen: boolean; onClose: () => void; admin: HotelAdmin | null; onSave: (fd: FormData) => void; }

export default function HotelAdminFormModal({ isOpen, onClose, admin, onSave }: ModalProps) {
    const title = admin ? 'Chỉnh sửa Đối tác Khách sạn' : 'Thêm Đối tác Khách sạn mới';
    return (
        <Modal show={isOpen} onHide={onClose} centered>
            <Modal.Header closeButton><Modal.Title as="h5">{title}</Modal.Title></Modal.Header>
            <Modal.Body><HotelAdminForm admin={admin} onSave={onSave} onCancel={onClose} /></Modal.Body>
        </Modal>
    );
}