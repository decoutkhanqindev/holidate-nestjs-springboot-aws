"use client";

import { Modal } from 'react-bootstrap';
import HotelForm from '@/components/Admin/hotels/HotelForm';
import { createHotelAction } from '@/lib/actions/hotelActions';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

interface SuperHotelFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function SuperHotelFormModal({ isOpen, onClose, onSuccess }: SuperHotelFormModalProps) {
    const router = useRouter();

    const handleSubmit = async (formData: FormData) => {
        try {
            // Pass noRedirect=true để không redirect trong modal
            const result = await createHotelAction(formData, true);
            
            if (result?.error) {
                toast.error(result.error, {
                    position: "top-right",
                    autoClose: 3000,
                });
                return;
            }

            toast.success('Tạo khách sạn thành công!', {
                position: "top-right",
                autoClose: 2000,
            });

            // Đóng modal và reload data
            onClose();
            if (onSuccess) {
                onSuccess();
            } else {
                router.refresh();
            }
        } catch (error: any) {
            console.error('[SuperHotelFormModal] Error creating hotel:', error);
            
            // NEXT_REDIRECT không phải là error thực sự
            if (error.message === 'NEXT_REDIRECT' || error.digest?.includes('NEXT_REDIRECT')) {
                // Nếu có redirect nhưng đã pass noRedirect, coi như success
                toast.success('Tạo khách sạn thành công!', {
                    position: "top-right",
                    autoClose: 2000,
                });
                onClose();
                if (onSuccess) {
                    onSuccess();
                }
                return;
            }
            
            // Hiển thị error message chi tiết
            const errorMessage = error.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
            toast.error(errorMessage, {
                position: "top-right",
                autoClose: 4000, // Tăng thời gian hiển thị để user đọc được message
            });
        }
    };

    return (
        <Modal show={isOpen} onHide={onClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title as="h5">Thêm khách sạn mới</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                <HotelForm formAction={handleSubmit} isSuperAdmin={true} />
            </Modal.Body>
        </Modal>
    );
}

