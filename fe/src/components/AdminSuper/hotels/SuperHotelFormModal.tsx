"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SuperHotelForm from './SuperHotelForm';
import { createHotelAction } from '@/lib/actions/hotelActions';
import { toast } from 'react-toastify';
import { BuildingOfficeIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface SuperHotelFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function SuperHotelFormModal({ isOpen, onClose, onSuccess }: SuperHotelFormModalProps) {
    const router = useRouter();

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
            const result = await createHotelAction(formData);
            if (result?.success) {
                toast.success('Tạo khách sạn thành công!', {
                    position: "top-right",
                    autoClose: 2000,
                });
                onClose();
                onSuccess?.();
                router.refresh();
            } else {
                toast.error(result?.error || 'Không thể tạo khách sạn. Vui lòng thử lại.', {
                    position: "top-right",
                    autoClose: 3000,
                });
            }
        } catch (error: any) {
            console.error('[SuperHotelFormModal] Error creating hotel:', error);
            toast.error(error.message || 'Không thể tạo khách sạn. Vui lòng thử lại.', {
                position: "top-right",
                autoClose: 3000,
            });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Container */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all">
                    {/* Header with gradient */}
                    <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 px-6 py-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <BuildingOfficeIcon className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Thêm khách sạn mới</h2>
                                    <p className="text-blue-100 text-sm mt-0.5">Điền thông tin để tạo khách sạn trong hệ thống</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                                aria-label="Đóng"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                    </div>

                    {/* Body with custom scrollbar */}
                    <div className="max-h-[calc(90vh-140px)] overflow-y-auto px-6 py-6 bg-gray-50">
                        <style jsx>{`
                            div::-webkit-scrollbar {
                                width: 8px;
                            }
                            div::-webkit-scrollbar-track {
                                background: #f1f5f9;
                                border-radius: 4px;
                            }
                            div::-webkit-scrollbar-thumb {
                                background: #cbd5e1;
                                border-radius: 4px;
                            }
                            div::-webkit-scrollbar-thumb:hover {
                                background: #94a3b8;
                            }
                        `}</style>
                        <div id="super-hotel-form-wrapper">
                            <SuperHotelForm formAction={handleSubmit} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
