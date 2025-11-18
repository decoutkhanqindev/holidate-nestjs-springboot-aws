"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SuperHotelForm from './SuperHotelForm';
import { createHotelActionSuperAdmin } from '@/lib/actions/hotelActions';
import { toast } from 'react-toastify';
import { BuildingOfficeIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface SuperHotelFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function SuperHotelFormModal({ isOpen, onClose, onSuccess }: SuperHotelFormModalProps) {
    const router = useRouter();

    // Tắt scroll của body khi modal mở
    useEffect(() => {
        if (isOpen) {
            // Lưu lại scroll position và overflow hiện tại
            const scrollY = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';
            document.body.style.overflow = 'hidden';

            return () => {
                // Khôi phục lại scroll khi đóng modal
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.width = '';
                document.body.style.overflow = '';
                window.scrollTo(0, scrollY);
            };
        }
    }, [isOpen]);

    // Listen for close event from form
    useEffect(() => {
        const handleCloseForm = () => {
            onClose();
        };

        if (isOpen) {
            window.addEventListener('closeSuperHotelFormModal', handleCloseForm);
            return () => {
                window.removeEventListener('closeSuperHotelFormModal', handleCloseForm);
            };
        }
    }, [isOpen, onClose]);

    const handleSubmit = async (formData: FormData) => {
        try {
            const result = await createHotelActionSuperAdmin(formData);
            if (result?.success) {
                toast.success('Tạo khách sạn thành công!', {
                    position: "top-right",
                    autoClose: 2000,
                });
                // Đóng modal trước, sau đó refresh
                onClose();
                // Delay refresh để tránh unmount component khi state đang update
                setTimeout(() => {
                    onSuccess?.();
                    router.refresh();
                }, 100);
            } else {
                toast.error(result?.error || 'Không thể tạo khách sạn. Vui lòng thử lại.', {
                    position: "top-right",
                    autoClose: 3000,
                });
            }
        } catch (error: any) {
            toast.error(error.message || 'Không thể tạo khách sạn. Vui lòng thử lại.', {
                position: "top-right",
                autoClose: 3000,
            });
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div
                className="relative w-full max-w-6xl bg-white rounded-xl shadow-2xl flex flex-col"
                style={{
                    maxHeight: '90vh'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header - Fixed */}
                <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 px-5 py-3 flex-shrink-0 border-b border-blue-800/30">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm shadow-lg">
                                <BuildingOfficeIcon className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white leading-tight">Thêm khách sạn mới</h2>
                                <p className="text-xs text-blue-100 mt-0.5">Điền thông tin để tạo khách sạn trong hệ thống</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-white transition-all hover:bg-white/20 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50"
                            aria-label="Đóng"
                        >
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Body - Scrollable */}
                <div
                    className="flex-1 overflow-y-auto bg-gray-50 min-h-0"
                >
                    <style jsx>{`
                        #modal-scroll-container::-webkit-scrollbar {
                            width: 10px;
                        }
                        #modal-scroll-container::-webkit-scrollbar-track {
                            background: #f1f5f9;
                            border-radius: 5px;
                        }
                        #modal-scroll-container::-webkit-scrollbar-thumb {
                            background: linear-gradient(to bottom, #cbd5e1, #94a3b8);
                            border-radius: 5px;
                            border: 2px solid #f1f5f9;
                        }
                        #modal-scroll-container::-webkit-scrollbar-thumb:hover {
                            background: linear-gradient(to bottom, #94a3b8, #64748b);
                        }
                    `}</style>
                    <div id="modal-scroll-container" className="px-5 py-4">
                        <div id="super-hotel-form-wrapper">
                            {isOpen && <SuperHotelForm formAction={handleSubmit} />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
