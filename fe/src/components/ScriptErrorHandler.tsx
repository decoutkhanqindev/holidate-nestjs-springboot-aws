'use client';

import { useEffect } from 'react';

/**
 * Component để xử lý lỗi từ external scripts (như VNPay, custom.min.js)
 * Fix lỗi "timer is not defined" từ các script bên ngoài
 */
export default function ScriptErrorHandler() {
    useEffect(() => {
        // Fix lỗi timer is not defined từ external scripts
        if (typeof window !== 'undefined') {
            // Khởi tạo timer nếu chưa có
            if (typeof (window as any).timer === 'undefined') {
                (window as any).timer = null;
            }

            // Wrap updateTime function để tránh lỗi
            const originalUpdateTime = (window as any).updateTime;
            if (originalUpdateTime) {
                (window as any).updateTime = function(...args: any[]) {
                    try {
                        // Kiểm tra timer trước khi sử dụng
                        if (typeof (window as any).timer !== 'undefined' && (window as any).timer !== null) {
                            return originalUpdateTime.apply(this, args);
                        }
                    } catch (e: any) {
                        // Silently ignore timer errors từ external scripts
                        console.warn('[ScriptErrorHandler] External script timer error ignored:', e?.message);
                    }
                };
            }

            // Global error handler để catch lỗi từ external scripts
            const handleError = (event: ErrorEvent) => {
                // Nếu lỗi liên quan đến timer từ external scripts, ignore
                if (event.message && (
                    event.message.includes('timer is not defined') ||
                    event.message.includes('timer') && event.filename?.includes('custom.min.js') ||
                    event.filename?.includes('jquery.bundles.js')
                )) {
                    event.preventDefault();
                    console.warn('[ScriptErrorHandler] External script error caught and ignored:', event.message);
                    return false;
                }
            };

            window.addEventListener('error', handleError);

            return () => {
                window.removeEventListener('error', handleError);
            };
        }
    }, []);

    return null;
}

