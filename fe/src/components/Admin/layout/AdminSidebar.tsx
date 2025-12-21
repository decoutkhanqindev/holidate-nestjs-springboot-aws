// file: src/components/admin/layout/AdminSidebar.tsx

"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    ChartBarIcon, BuildingOffice2Icon, KeyIcon, CalendarDaysIcon,
    CreditCardIcon, TicketIcon, MegaphoneIcon, UserGroupIcon,
    ChatBubbleLeftRightIcon, DocumentChartBarIcon, DocumentTextIcon,
} from '@heroicons/react/24/outline';

const navLinks = [
    { href: '/admin-dashboard', label: 'Thống kê', icon: ChartBarIcon },
    { href: '/admin-reports', label: 'Báo cáo', icon: DocumentChartBarIcon },
    { href: '/admin-hotels', label: 'Khách sạn', icon: BuildingOffice2Icon },
    { href: '/admin-rooms', label: 'Phòng', icon: KeyIcon },
    { href: '/admin-bookings', label: 'Đặt phòng', icon: CalendarDaysIcon },
    { href: '/admin-payments', label: 'Thanh Toán', icon: CreditCardIcon },
    { href: '/admin-discounts', label: 'Mã giảm giá', icon: TicketIcon },
    { href: '/admin-users', label: 'Người dùng', icon: UserGroupIcon },
    { href: '/admin-reviews', label: 'Đánh giá', icon: ChatBubbleLeftRightIcon },
    { href: '/admin-policies', label: 'Chính sách', icon: DocumentTextIcon },
    { href: '/admin-tickets', label: 'Trợ giúp', icon: MegaphoneIcon },
];

interface AdminSidebarProps {
    isCollapsed: boolean;
}

export default function AdminSidebar({ isCollapsed }: AdminSidebarProps) {
    const pathname = usePathname();

    return (
        <aside
            className={`
                fixed left-0 top-0 bottom-0 bg-white shadow-md z-50
                flex flex-col
                transition-all duration-300 ease-in-out
                ${isCollapsed ? 'w-20' : 'w-[250px]'}
            `}
        >
            <div className="h-[70px] flex items-center justify-center border-b border-gray-200">
                <Link href="/admin-dashboard" className="text-2xl font-bold text-blue-600 no-underline transition-all">
                    {isCollapsed ? 'A' : 'Đối tác khách sạn'}
                </Link>
            </div>

            <nav className="flex-grow p-2 mt-4 space-y-2">
                <ul>
                    {navLinks.map((link) => {
                        const isActive = pathname.startsWith(link.href);
                        const Icon = link.icon;

                        return (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    prefetch={false}
                                    className={`
    flex items-center gap-x-4 py-3 rounded-lg transition-colors duration-100 ease-in-out
    ${isCollapsed ? 'px-3 justify-center' : 'px-4'}
    ${isActive
                                            ? 'bg-blue-50 text-blue-500 font-medium border-l-4 border-blue-400'
                                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                        }
    no-underline hover:no-underline focus:no-underline
  `}
                                    title={isCollapsed ? link.label : ''}
                                >
                                    <Icon className="h-6 w-6 flex-shrink-0" />
                                    {!isCollapsed && <span className="truncate">{link.label}</span>}
                                </Link>


                            </li>
                        );
                    })}
                </ul>
            </nav>
        </aside>
    );
}