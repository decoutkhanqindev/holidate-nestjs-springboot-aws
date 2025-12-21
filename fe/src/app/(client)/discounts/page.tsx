import type { Metadata } from 'next';
import apiClient, { ApiResponse } from '@/service/apiClient';
import type { SuperDiscount, PagedResponse } from '@/types';
import DiscountsPageClient from './DiscountsPageClient';

// ============================================
// ISR CONFIGURATION
// ============================================
// Revalidate mỗi 30 phút (1800 giây) để đảm bảo mã giảm giá luôn mới nhất
export const revalidate = 1800; // 30 phút

// ============================================
// HELPER FUNCTION - Fetch Discounts trên Server
// ============================================
async function getPublicDiscountsOnServer(page: number = 0, size: number = 12): Promise<PagedResponse<SuperDiscount>> {
    try {
        const params: any = {
            page,
            size,
            sortBy: 'validTo',
            sortDir: 'asc',
            active: true,
            currentlyValid: true,
        };

        const response = await apiClient.get<ApiResponse<PagedResponse<SuperDiscount>>>('/discounts', {
            params,
        });

        if (response.data?.statusCode === 200 && response.data?.data) {
            const data = response.data.data;
            
            // Map dates từ string sang Date
            const mappedContent = data.content.map(discount => ({
                ...discount,
                validFrom: new Date(discount.validFrom),
                validTo: new Date(discount.validTo),
                createdAt: discount.createdAt ? new Date(discount.createdAt) : new Date(),
                updatedAt: discount.updatedAt ? new Date(discount.updatedAt) : undefined,
            }));

            return {
                ...data,
                content: mappedContent,
            };
        }

        return {
            content: [],
            page: 0,
            size: 12,
            totalItems: 0,
            totalPages: 0,
            first: true,
            last: true,
            hasNext: false,
            hasPrevious: false,
        };
    } catch (error) {
        return {
            content: [],
            page: 0,
            size: 12,
            totalItems: 0,
            totalPages: 0,
            first: true,
            last: true,
            hasNext: false,
            hasPrevious: false,
        };
    }
}

// ============================================
// METADATA CHO SEO
// ============================================
export const metadata: Metadata = {
    title: 'Mã Giảm Giá & Ưu Đãi Đặc Biệt | Holidate',
    description: 'Khám phá các mã giảm giá và ưu đãi đặc biệt tại Holidate. Giảm giá lên đến 50% cho đặt phòng khách sạn. Áp dụng ngay mã giảm giá để tiết kiệm hơn!',
    keywords: [
        'mã giảm giá',
        'voucher',
        'ưu đãi',
        'khuyến mãi',
        'giảm giá khách sạn',
        'promo code',
        'discount code',
        'Holidate',
    ],
    openGraph: {
        title: 'Mã Giảm Giá & Ưu Đãi Đặc Biệt | Holidate',
        description: 'Giảm giá lên đến 50% cho đặt phòng khách sạn. Áp dụng ngay mã giảm giá để tiết kiệm hơn!',
        type: 'website',
        siteName: 'Holidate',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Mã Giảm Giá & Ưu Đãi Đặc Biệt | Holidate',
        description: 'Giảm giá lên đến 50% cho đặt phòng khách sạn.',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
};

// ============================================
// SERVER COMPONENT
// ============================================
export default async function DiscountsPage() {
    // Fetch discounts từ server
    const discountsData = await getPublicDiscountsOnServer(0, 12);

    return (
        <DiscountsPageClient
            initialDiscounts={discountsData.content}
            initialTotalPages={discountsData.totalPages}
            initialPage={discountsData.page}
        />
    );
}
