// components/AdminSuper/discounts/DiscountFormModal.tsx
"use client";
import { Modal } from 'react-bootstrap';
import DiscountForm from './DiscountForm';
import type { SuperDiscount } from '@/types';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    discount: SuperDiscount | null;
    onSave: (fd: FormData) => void;
}

export default function DiscountFormModal({ isOpen, onClose, discount, onSave }: ModalProps) {
    const title = discount ? 'Chỉnh sửa Mã giảm giá' : 'Thêm Mã giảm giá mới';
    
    return (
        <Modal show={isOpen} onHide={onClose} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title as="h5">{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <DiscountForm discount={discount} onSave={onSave} onCancel={onClose} />
            </Modal.Body>
        </Modal>
    );
}

































