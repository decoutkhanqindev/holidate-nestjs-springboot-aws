// components/Deal/DiscountDetailModal.tsx
'use client';

import { Modal } from 'react-bootstrap';
import type { SuperDiscount } from '@/types';

// Helper để format ngày
function formatDate(date: Date | string): string {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

interface DiscountDetailModalProps {
    discount: SuperDiscount | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function DiscountDetailModal({ discount, isOpen, onClose }: DiscountDetailModalProps) {
    if (!discount) return null;

    return (
        <>
            {/* Custom CSS for responsive modal */}
            <style dangerouslySetInnerHTML={{
                __html: `
                    .discount-detail-modal .modal-dialog {
                        margin: 0.5rem;
                        max-width: 600px;
                    }
                    @media (max-width: 768px) {
                        .discount-detail-modal .modal-dialog {
                            margin: 0.5rem;
                            max-width: calc(100% - 1rem);
                        }
                        .discount-detail-modal .modal-content {
                            border-radius: 12px;
                        }
                        .discount-detail-modal .modal-header {
                            padding: 1rem;
                        }
                        .discount-detail-modal .modal-body {
                            padding: 1rem !important;
                            font-size: 14px;
                        }
                        .discount-detail-modal .modal-title {
                            font-size: 16px !important;
                        }
                    }
                `
            }} />
        <Modal 
            show={isOpen} 
            onHide={onClose} 
            centered 
            size="lg"
            style={{ zIndex: 1050 }}
            dialogClassName="discount-detail-modal"
        >
            <Modal.Header closeButton className="border-bottom">
                <Modal.Title className="fw-bold" style={{ fontSize: '18px', lineHeight: '1.4' }}>
                    {discount.description || `Giảm ${discount.percentage}%`}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ padding: '1.5rem' }}>
                {/* Mô tả của mã */}
                <div className="mb-4">
                    <h6 className="fw-bold mb-2">Mô tả:</h6>
                    <p className="text-muted mb-0">{discount.description || 'Áp dụng cho đơn hàng của bạn.'}</p>
                </div>

                {/* Điều kiện áp mã */}
                <div className="mb-4">
                    <h6 className="fw-bold mb-2">Điều kiện áp mã:</h6>
                    <ul className="text-muted mb-0" style={{ paddingLeft: '20px' }}>
                        <li className="mb-1">
                            Giảm giá <strong>{discount.percentage}%</strong> cho đơn hàng tối thiểu <strong>{new Intl.NumberFormat('vi-VN').format(discount.minBookingPrice)} VNĐ</strong>
                        </li>
                        {discount.minBookingCount > 1 && (
                            <li className="mb-1">
                                Số lượng phòng tối thiểu: <strong>{discount.minBookingCount} phòng</strong>
                            </li>
                        )}
                        <li className="mb-1">
                            Mã chỉ được sử dụng <strong>{discount.usageLimit} lần</strong> (đã sử dụng: {discount.timesUsed})
                        </li>
                        <li className="mb-1">
                            Mỗi mã chỉ áp dụng cho <strong>1 đơn hàng</strong>
                        </li>
                    </ul>
                </div>

                {/* Thời hạn đặt phòng (thời gian mã còn hiệu lực) */}
                <div className="mb-4">
                    <h6 className="fw-bold mb-2">Thời hạn đặt phòng:</h6>
                    <p className="text-muted mb-2">
                        Đặt phòng từ <strong>{formatDate(discount.validFrom)}</strong> đến hết ngày <strong>{formatDate(discount.validTo)}</strong>
                    </p>
                    <p className="text-muted small mb-0">
                        Mã giảm giá có hiệu lực trong khoảng thời gian trên. Đặt phòng trước ngày {formatDate(discount.validTo)} để áp dụng mã.
                    </p>
                </div>

                {/* Footer với mã và nút Copy */}
                <div className="mt-4 p-3" style={{ backgroundColor: '#3b82f6', borderRadius: '8px' }}>
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
                        <div className="flex-grow-1">
                            <span className="text-white small d-block mb-1">Mã giảm giá:</span>
                            <strong className="text-white" style={{ fontSize: '16px', letterSpacing: '1px' }}>
                                📋 {discount.code}
                            </strong>
                        </div>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(discount.code);
                                alert(`Đã sao chép mã: ${discount.code}`);
                            }}
                            className="btn btn-light btn-sm fw-semibold w-100 w-md-auto"
                            style={{ minWidth: '80px' }}
                        >
                            Copy
                        </button>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
        </>
    );
}

