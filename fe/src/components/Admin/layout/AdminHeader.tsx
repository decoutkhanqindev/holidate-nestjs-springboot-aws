"use client";
import { Bars3Icon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

interface AdminHeaderProps {
    onToggleSidebar: () => void;
}

export default function AdminHeader({ onToggleSidebar }: AdminHeaderProps) {
    return (
        <header className="bg-white h-full px-6 flex justify-between items-center">
            <button
                onClick={onToggleSidebar}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <Bars3Icon className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-x-4">
                <span className="text-sm text-gray-600">
                    Chào, <span className="font-semibold text-gray-800">Partner</span>!
                </span>
                <button
                    className="flex items-center gap-x-2 text-sm font-medium text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50"
                    onClick={() => window.location.href = '/admin-login'}
                >
                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                    Đăng xuất
                </button>
            </div>
        </header>
    );
}