"use client";

import { useFormStatus } from "react-dom";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
    getAmenities,
    getAmenityCategories,
    createAmenity,
    createAmenityCategory,
    type Amenity,
    type AmenityCategory,
    type CreateAmenityRequest
} from "@/lib/AdminAPI/amenityService";
// Removed getBedTypes import - bedType is now a text input
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";

function SubmitButton({ isEditing }: { isEditing: boolean }) {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="inline-flex justify-center py-2.5 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
            {pending ? 'Đang lưu...' : (isEditing ? 'Cập nhật' : 'Tạo phòng')}
        </button>
    );
}

interface RoomFormProps {
    formAction: (formData: FormData) => void;
    hotelId: string;
    room?: any; // Optional room data for editing
}

export default function RoomForm({ formAction, hotelId, room }: RoomFormProps) {
    const isEditing = !!room;

    // State cho amenities, categories và bed types
    const [amenities, setAmenities] = useState<Amenity[]>([]);
    const [amenityCategories, setAmenityCategories] = useState<AmenityCategory[]>([]);
    const [bedTypeName, setBedTypeName] = useState<string>('');

    // Load bedTypeName khi room data thay đổi
    useEffect(() => {
        if (room?.bedType?.name) {
            setBedTypeName(room.bedType.name);
        }
    }, [room?.bedType?.name]);
    const [isLoadingAmenities, setIsLoadingAmenities] = useState(false);

    // State cho selected amenities (dạng multi-select dropdown)
    // Nếu đang edit, load amenities hiện có của phòng
    const [selectedAmenityIds, setSelectedAmenityIds] = useState<string[]>(
        room?.amenities?.map((a: { id: string; name: string }) => a.id) || []
    );
    const [amenitySearchQuery, setAmenitySearchQuery] = useState('');
    const [showAmenityDropdown, setShowAmenityDropdown] = useState(false);

    // Danh sách tiện ích phổ biến cần tự động gán
    const commonAmenityNames = [
        'TV',
        'Máy lạnh',
        'Tủ lạnh',
        'Két an toàn tại phòng',
        'Máy sấy tóc',
        'Quạt',
        'Máy pha cà phê/trà',
        'Bộ vệ sinh cá nhân',
        'Lò vi sóng',
        'Nước nóng'
    ];

    // State cho preview images
    // Nếu đang edit, load ảnh hiện có của phòng
    const [previewImages, setPreviewImages] = useState<string[]>(
        room?.images && room.images.length > 0 ? room.images : []
    );
    const [imageFiles, setImageFiles] = useState<File[]>([]);

    // State cho modal thêm amenity mới
    const [showCreateAmenityModal, setShowCreateAmenityModal] = useState(false);
    const [newAmenityName, setNewAmenityName] = useState('');
    const [newAmenityFree, setNewAmenityFree] = useState(true);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
    const [isCreatingAmenity, setIsCreatingAmenity] = useState(false);
    const [createAmenityError, setCreateAmenityError] = useState<string | null>(null);

    // State cho modal thêm category mới
    const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryDescription, setNewCategoryDescription] = useState('');
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    const [createCategoryError, setCreateCategoryError] = useState<string | null>(null);

    // Load amenities và categories (không load bed types nữa vì user tự nhập)
    useEffect(() => {
        const loadData = async () => {
            setIsLoadingAmenities(true);

            try {
                const [amenitiesData, categoriesData] = await Promise.all([
                    getAmenities(),
                    getAmenityCategories()
                ]);

                setAmenities(amenitiesData);
                setAmenityCategories(categoriesData);

                console.log(`[RoomForm] Loaded ${amenitiesData.length} amenities and ${categoriesData.length} categories`);

                // Tự động chọn các tiện ích phổ biến (miễn phí) nếu có trong database
                if (!isEditing && amenitiesData.length > 0) {
                    const commonAmenityIds = amenitiesData
                        .filter(amenity =>
                            amenity.free && // Chỉ lấy tiện ích miễn phí
                            commonAmenityNames.some(commonName =>
                                amenity.name.toLowerCase().includes(commonName.toLowerCase()) ||
                                commonName.toLowerCase().includes(amenity.name.toLowerCase())
                            )
                        )
                        .map(amenity => amenity.id);

                    if (commonAmenityIds.length > 0) {
                        setSelectedAmenityIds(commonAmenityIds);
                        console.log(`[RoomForm] Auto-selected ${commonAmenityIds.length} common amenities:`, commonAmenityIds);
                    }
                }
            } catch (error) {
                console.error("[RoomForm] Error loading data:", error);
            } finally {
                setIsLoadingAmenities(false);
            }
        };

        loadData();
    }, [isEditing]);

    // Filter amenities based on search query - Loại bỏ những amenities đã được chọn
    const filteredAmenities = amenities.filter(amenity => {
        // Loại bỏ những amenities đã được chọn (selected)
        if (selectedAmenityIds.includes(amenity.id)) return false;

        // Loại bỏ những amenities đã được auto-select trong common amenities (chỉ khi chưa có trong selected)
        const isCommonAmenity = commonAmenityNames.some(commonName =>
            amenity.free && (
                amenity.name.toLowerCase().includes(commonName.toLowerCase()) ||
                commonName.toLowerCase().includes(amenity.name.toLowerCase())
            )
        );

        // Chỉ hiển thị nếu không phải common amenity (để tránh duplicate) và match search query
        if (isCommonAmenity) return false;
        return amenity.name.toLowerCase().includes(amenitySearchQuery.toLowerCase());
    });

    // Lấy danh sách các amenities đã chọn (không phải common amenities) để hiển thị tags
    const selectedOtherAmenities = selectedAmenityIds
        .map(id => amenities.find(a => a.id === id))
        .filter((amenity): amenity is Amenity => {
            if (!amenity) return false;
            // Loại bỏ common amenities khỏi danh sách hiển thị trong phần "Thêm tiện ích khác"
            const isCommonAmenity = commonAmenityNames.some(commonName =>
                amenity.free && (
                    amenity.name.toLowerCase().includes(commonName.toLowerCase()) ||
                    commonName.toLowerCase().includes(amenity.name.toLowerCase())
                )
            );
            return !isCommonAmenity;
        });

    // Handle image selection preview
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const fileArray = Array.from(files);
        const newFiles: File[] = [];
        const newPreviewUrls: string[] = [];

        fileArray.forEach((file) => {
            newFiles.push(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                newPreviewUrls.push(reader.result as string);
                if (newPreviewUrls.length === fileArray.length) {
                    setPreviewImages(prev => [...prev, ...newPreviewUrls]);
                    setImageFiles(prev => [...prev, ...newFiles]);
                }
            };
            reader.readAsDataURL(file);
        });
    };

    // Remove image from preview
    const handleRemoveImage = (index: number) => {
        setPreviewImages(prev => prev.filter((_, i) => i !== index));
        setImageFiles(prev => prev.filter((_, i) => i !== index));
    };

    // Handle amenity selection (multi-select)
    const handleAmenityToggle = (amenityId: string) => {
        setSelectedAmenityIds((prev) => {
            if (prev.includes(amenityId)) {
                return prev.filter(id => id !== amenityId);
            } else {
                return [...prev, amenityId];
            }
        });
    };

    // Handle create amenity
    const handleCreateAmenity = async () => {
        if (!newAmenityName.trim()) {
            setCreateAmenityError('Vui lòng nhập tên tiện ích');
            return;
        }

        if (!selectedCategoryId) {
            setCreateAmenityError('Vui lòng chọn hoặc tạo danh mục tiện ích');
            return;
        }

        setIsCreatingAmenity(true);
        setCreateAmenityError(null);

        try {
            const newAmenity = await createAmenity({
                name: newAmenityName.trim(),
                free: newAmenityFree,
                categoryId: selectedCategoryId,
            });

            // Refresh amenities list
            const updatedAmenities = await getAmenities();
            setAmenities(updatedAmenities);

            // Auto-select newly created amenity
            setSelectedAmenityIds(prev => [...prev, newAmenity.id]);

            // Reset form
            setNewAmenityName('');
            setSelectedCategoryId('');
            setShowCreateAmenityModal(false);
        } catch (error: any) {
            console.error("[RoomForm] Error creating amenity:", error);
            setCreateAmenityError(error.message || 'Không thể tạo tiện ích mới');
        } finally {
            setIsCreatingAmenity(false);
        }
    };

    // Handle create category
    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) {
            setCreateCategoryError('Vui lòng nhập tên danh mục');
            return;
        }

        setIsCreatingCategory(true);
        setCreateCategoryError(null);

        try {
            const newCategory = await createAmenityCategory({
                name: newCategoryName.trim(),
                description: newCategoryDescription.trim() || undefined,
            });

            // Refresh categories list
            const updatedCategories = await getAmenityCategories();
            setAmenityCategories(updatedCategories);

            // Auto-select newly created category in amenity modal
            setSelectedCategoryId(newCategory.id);

            // Reset form
            setNewCategoryName('');
            setNewCategoryDescription('');
            setShowCreateCategoryModal(false);
        } catch (error: any) {
            console.error("[RoomForm] Error creating category:", error);
            setCreateCategoryError(error.message || 'Không thể tạo danh mục mới');
        } finally {
            setIsCreatingCategory(false);
        }
    };

    // Handle form submit với client-side logging
    const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        // Log ra browser console
        console.log("=".repeat(80));
        console.log("[RoomForm] ===== CLIENT-SIDE: Form submitted =====");

        const formData = new FormData(event.currentTarget);
        const formDataEntries: Array<{ key: string; value: string }> = [];

        for (const [key, value] of formData.entries()) {
            if (value instanceof File) {
                formDataEntries.push({
                    key,
                    value: `File: ${value.name} (${value.size} bytes)`
                });
            } else {
                formDataEntries.push({
                    key,
                    value: String(value)
                });
            }
        }

        console.log("[RoomForm] FormData entries (client-side):");
        formDataEntries.forEach((entry, index) => {
            console.log(`  [${index + 1}] ${entry.key} = ${entry.value}`);
        });
        console.log("[RoomForm] Total fields:", formDataEntries.length);
        console.log("=".repeat(80));
        console.log("[RoomForm] NOTE: Server-side logs will appear in TERMINAL, not browser console!");
        console.log("[RoomForm] Calling server action now...");

        // Gọi server action
        await formAction(formData);
    };

    return (
        <div className="bg-white rounded-lg shadow-md mt-4">
            <form action={formAction} onSubmit={handleFormSubmit} className="p-8 space-y-8">
                {/* Hidden field cho hotelId - luôn có để đảm bảo không bị thiếu */}
                <input type="hidden" name="hotelId" value={hotelId || room?.hotelId || ''} />

                {/* Hidden fields cho selected amenityIds */}
                {selectedAmenityIds.map((id) => (
                    <input key={id} type="hidden" name="amenityIds" value={id} />
                ))}

                {/* Section 1: Thông tin cơ bản */}
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">1. Thông tin cơ bản</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Tên phòng *
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                required
                                defaultValue={room?.name || ''}
                                placeholder="VD: Deluxe Ocean View"
                                className="block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="view" className="block text-sm font-medium text-gray-700">
                                Hướng phòng (View) *
                            </label>
                            <input
                                type="text"
                                id="view"
                                name="view"
                                required
                                defaultValue={room?.view || ''}
                                placeholder="VD: Hướng biển, Hướng thành phố, Hướng vườn"
                                className="block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="area" className="block text-sm font-medium text-gray-700">
                                Diện tích (m²) *
                            </label>
                            <input
                                type="number"
                                id="area"
                                name="area"
                                required
                                min="1"
                                step="0.1"
                                defaultValue={room?.area ? String(room.area) : ''}
                                placeholder="VD: 30"
                                className="block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="bedTypeName" className="block text-sm font-medium text-gray-700">
                                Loại giường *
                            </label>
                            <input
                                type="text"
                                id="bedTypeName"
                                name="bedTypeName"
                                required
                                value={bedTypeName}
                                onChange={(e) => setBedTypeName(e.target.value)}
                                placeholder="VD: Giường đôi, Giường King, 2 giường đơn, ..."
                                className="block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Nhập tên loại giường (VD: Giường đôi, Giường King, 2 giường đơn, ...)
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="maxAdults" className="block text-sm font-medium text-gray-700">
                                Số người lớn tối đa *
                            </label>
                            <input
                                type="number"
                                id="maxAdults"
                                name="maxAdults"
                                required
                                min="1"
                                defaultValue={room?.maxAdults ? String(room.maxAdults) : ''}
                                placeholder="VD: 2"
                                className="block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="maxChildren" className="block text-sm font-medium text-gray-700">
                                Số trẻ em tối đa *
                            </label>
                            <input
                                type="number"
                                id="maxChildren"
                                name="maxChildren"
                                required
                                min="0"
                                defaultValue={room?.maxChildren !== undefined && room?.maxChildren !== null ? String(room.maxChildren) : '0'}
                                placeholder="VD: 0"
                                className="block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="basePricePerNight" className="block text-sm font-medium text-gray-700">
                                Giá cơ bản / đêm (VNĐ) *
                            </label>
                            <input
                                type="number"
                                id="basePricePerNight"
                                name="basePricePerNight"
                                required
                                min="0"
                                step="1000"
                                defaultValue={room?.basePricePerNight ? String(room.basePricePerNight) : ''}
                                placeholder="VD: 2000000"
                                className="block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                                Số lượng phòng *
                            </label>
                            <input
                                type="number"
                                id="quantity"
                                name="quantity"
                                required
                                min="1"
                                defaultValue={room?.quantity ? String(room.quantity) : ''}
                                placeholder="VD: 10"
                                className="block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Section 2: Trạng thái */}
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">2. Trạng thái phòng</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                                Trạng thái *
                            </label>
                            <select
                                id="status"
                                name="status"
                                required
                                defaultValue={room?.status || 'AVAILABLE'}
                                className="block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                                <option value="AVAILABLE">Hoạt động</option>
                                <option value="INACTIVE">Ngưng hoạt động</option>
                                <option value="MAINTENANCE">Bảo trì</option>
                                <option value="CLOSED">Đóng cửa</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                Chọn trạng thái hiện tại của phòng
                            </p>
                        </div>
                    </div>
                </div>

                {/* Section 3: Tùy chọn */}
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">3. Tùy chọn</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <label className="flex items-center space-x-2 cursor-pointer p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                            <input
                                type="checkbox"
                                name="smokingAllowed"
                                value="true"
                                defaultChecked={room?.smokingAllowed || false}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <span className="text-sm text-gray-700">Cho phép hút thuốc</span>
                        </label>

                        <label className="flex items-center space-x-2 cursor-pointer p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                            <input
                                type="checkbox"
                                name="wifiAvailable"
                                value="true"
                                defaultChecked={room?.wifiAvailable || false}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <span className="text-sm text-gray-700">Wi-Fi có sẵn</span>
                        </label>

                        <label className="flex items-center space-x-2 cursor-pointer p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                            <input
                                type="checkbox"
                                name="breakfastIncluded"
                                value="true"
                                defaultChecked={room?.breakfastIncluded || false}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <span className="text-sm text-gray-700">Bao gồm bữa sáng</span>
                        </label>
                    </div>
                </div>

                {/* Section 4: Tiện ích - Dropdown với search */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex-1">4. Tiện ích phòng *</h3>
                        <button
                            type="button"
                            onClick={() => {
                                setShowCreateAmenityModal(true);
                                setCreateAmenityError(null);
                                setNewAmenityName('');
                                setSelectedCategoryId('');
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                        >
                            <PlusIcon className="h-4 w-4" />
                            Thêm tiện ích mới
                        </button>
                    </div>

                    {isLoadingAmenities ? (
                        <div className="text-center py-8 text-gray-500">
                            Đang tải danh sách tiện ích...
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Tiện ích phổ biến - Tự động gán */}
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <h4 className="text-sm font-semibold text-green-800 mb-3">
                                    ✓ Tiện ích phổ biến (Đã tự động gán)
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                                    {commonAmenityNames.map((commonName) => {
                                        // Tìm amenity trong database có tên tương tự
                                        const matchingAmenity = amenities.find(a =>
                                            a.free && (
                                                a.name.toLowerCase().includes(commonName.toLowerCase()) ||
                                                commonName.toLowerCase().includes(a.name.toLowerCase())
                                            )
                                        );

                                        if (matchingAmenity && selectedAmenityIds.includes(matchingAmenity.id)) {
                                            return (
                                                <div
                                                    key={commonName}
                                                    className="flex items-center gap-2 px-2 py-1 bg-white rounded border border-green-300"
                                                >
                                                    <svg className="h-4 w-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    <span className="text-xs text-gray-700">{matchingAmenity.name}</span>
                                                </div>
                                            );
                                        }
                                        return null;
                                    })}
                                </div>
                                <p className="text-xs text-green-700 mt-2">
                                    Các tiện ích miễn phí phổ biến đã được tự động gán vào phòng
                                </p>
                            </div>

                            {/* Dropdown search và select cho các tiện ích khác */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Thêm tiện ích khác (nếu có)
                                </label>
                                <div className="relative">
                                    {/* Hiển thị các tiện ích đã chọn dưới dạng tags */}
                                    {selectedOtherAmenities.length > 0 && (
                                        <div className="mb-2 p-2 border border-gray-200 rounded-md bg-gray-50 min-h-[60px]">
                                            <div className="flex flex-wrap gap-2">
                                                {selectedOtherAmenities.map((amenity) => (
                                                    <span
                                                        key={amenity.id}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-800 border border-blue-300 rounded-full text-sm font-medium shadow-sm"
                                                    >
                                                        {amenity.name}
                                                        {amenity.free && (
                                                            <span className="text-xs text-green-700">(Miễn phí)</span>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                handleAmenityToggle(amenity.id);
                                                            }}
                                                            className="ml-1 -mr-0.5 h-4 w-4 text-blue-600 hover:text-blue-800 hover:bg-blue-200 rounded-full transition-colors flex items-center justify-center"
                                                            title="Xóa tiện ích này"
                                                        >
                                                            <XMarkIcon className="h-3.5 w-3.5" />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            placeholder={selectedOtherAmenities.length > 0 ? "Tìm kiếm thêm tiện ích..." : "Tìm kiếm và chọn thêm tiện ích..."}
                                            value={amenitySearchQuery}
                                            onChange={(e) => {
                                                setAmenitySearchQuery(e.target.value);
                                                setShowAmenityDropdown(true);
                                            }}
                                            onFocus={() => setShowAmenityDropdown(true)}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowAmenityDropdown(true);
                                            }}
                                            className="flex-1 block px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                    </div>

                                    {/* Dropdown list - Grid layout đều đẹp */}
                                    {showAmenityDropdown && (
                                        <div
                                            className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-xl max-h-96 overflow-y-auto"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {filteredAmenities.length > 0 ? (
                                                <div className="p-2">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                                        {filteredAmenities.map((amenity) => {
                                                            const isSelected = selectedAmenityIds.includes(amenity.id);
                                                            return (
                                                                <label
                                                                    key={amenity.id}
                                                                    className={`flex items-start gap-2 p-2 rounded-md border cursor-pointer transition-colors ${isSelected
                                                                        ? 'bg-blue-50 border-blue-300'
                                                                        : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                                                        }`}
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        handleAmenityToggle(amenity.id);
                                                                        setAmenitySearchQuery(''); // Clear search after selection
                                                                        setShowAmenityDropdown(false); // Close dropdown after selection
                                                                    }}
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={isSelected}
                                                                        onChange={(e) => {
                                                                            e.stopPropagation();
                                                                            handleAmenityToggle(amenity.id);
                                                                            setAmenitySearchQuery(''); // Clear search after selection
                                                                            setShowAmenityDropdown(false); // Close dropdown after selection
                                                                        }}
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        className="mt-0.5 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded flex-shrink-0"
                                                                    />
                                                                    <span className="text-sm text-gray-700 flex-1 leading-tight">
                                                                        <span className="font-medium">{amenity.name}</span>
                                                                        {amenity.free && (
                                                                            <span className="ml-1 text-xs text-green-600 font-medium">(Miễn phí)</span>
                                                                        )}
                                                                    </span>
                                                                </label>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                                    {amenitySearchQuery ? (
                                                        <>
                                                            Không tìm thấy tiện ích nào. Vui lòng thử tìm kiếm khác hoặc{" "}
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setShowAmenityDropdown(false);
                                                                    setShowCreateAmenityModal(true);
                                                                }}
                                                                className="text-blue-600 hover:text-blue-800 underline"
                                                            >
                                                                thêm tiện ích mới
                                                            </button>
                                                        </>
                                                    ) : (
                                                        'Nhập từ khóa để tìm kiếm tiện ích...'
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Selected amenities display - Tất cả amenities đã chọn */}
                            {selectedAmenityIds.length > 0 && (
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-2">
                                        Đã chọn {selectedAmenityIds.length} tiện ích:
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedAmenityIds.map((amenityId) => {
                                            const amenity = amenities.find(a => a.id === amenityId);
                                            if (!amenity) return null;
                                            return (
                                                <span
                                                    key={amenityId}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-sm"
                                                >
                                                    {amenity.name}
                                                    {amenity.free && (
                                                        <span className="text-xs text-green-600">(Miễn phí)</span>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleAmenityToggle(amenityId)}
                                                        className="text-blue-600 hover:text-blue-800"
                                                    >
                                                        <XMarkIcon className="h-4 w-4" />
                                                    </button>
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {selectedAmenityIds.length === 0 && (
                                <p className="text-xs text-gray-500">
                                    Chưa chọn tiện ích nào. Vui lòng chọn từ danh sách hoặc thêm mới.
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Section 5: Hình ảnh - Upload nhiều ảnh */}
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">5. Hình ảnh phòng *</h3>

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="photos" className="block text-sm font-medium text-gray-700 mb-2">
                                Tải lên ảnh phòng (ít nhất 1 ảnh, có thể chọn nhiều) *
                            </label>
                            <input
                                type="file"
                                id="photos"
                                name="photos"
                                accept="image/*"
                                multiple
                                required={!isEditing || previewImages.length === 0}
                                onChange={handleImageChange}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                PNG, JPG, GIF tối đa 10MB mỗi ảnh. Có thể chọn nhiều ảnh cùng lúc.
                            </p>
                        </div>

                        {/* Preview images grid với nút xóa */}
                        {previewImages.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                {previewImages.map((preview, index) => (
                                    <div key={index} className="relative h-32 rounded-md overflow-hidden border border-gray-200 shadow-sm">
                                        <img
                                            src={preview}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveImage(index)}
                                            className="absolute top-1 right-1 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md transition-colors z-10"
                                            title="Xóa ảnh"
                                        >
                                            <XMarkIcon className="h-4 w-4" />
                                        </button>
                                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs px-2 py-1">
                                            Ảnh {index + 1}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Nút hành động */}
                <div className="flex justify-end gap-4 pt-5 border-t border-gray-200">
                    <Link
                        href="/admin-rooms"
                        className="py-2.5 px-6 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                        Hủy
                    </Link>
                    <SubmitButton isEditing={isEditing} />
                </div>
            </form>

            {/* Modal thêm tiện ích mới */}
            {showCreateAmenityModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowCreateAmenityModal(false)}>
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="text-lg font-semibold text-gray-900">Thêm tiện ích mới</h3>
                            <button
                                onClick={() => {
                                    setShowCreateAmenityModal(false);
                                    setNewAmenityName('');
                                    setSelectedCategoryId('');
                                    setCreateAmenityError(null);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            {createAmenityError && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                                    {createAmenityError}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tên tiện ích *
                                </label>
                                <input
                                    type="text"
                                    value={newAmenityName}
                                    onChange={(e) => setNewAmenityName(e.target.value)}
                                    placeholder="VD: Máy lạnh, Tủ lạnh, Ban công"
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Danh mục tiện ích *
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowCreateCategoryModal(true);
                                            setCreateCategoryError(null);
                                            setNewCategoryName('');
                                            setNewCategoryDescription('');
                                        }}
                                        className="text-xs text-blue-600 hover:text-blue-800"
                                    >
                                        + Tạo danh mục mới
                                    </button>
                                </div>
                                <select
                                    value={selectedCategoryId}
                                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                >
                                    <option value="">Chọn danh mục</option>
                                    {amenityCategories.map(category => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={newAmenityFree}
                                        onChange={(e) => setNewAmenityFree(e.target.checked)}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                    <span className="text-sm text-gray-700">Tiện ích miễn phí</span>
                                </label>
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowCreateAmenityModal(false);
                                    setNewAmenityName('');
                                    setSelectedCategoryId('');
                                    setCreateAmenityError(null);
                                }}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                disabled={isCreatingAmenity}
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                onClick={handleCreateAmenity}
                                disabled={isCreatingAmenity || !newAmenityName.trim() || !selectedCategoryId}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {isCreatingAmenity ? 'Đang tạo...' : 'Tạo tiện ích'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal thêm danh mục tiện ích mới */}
            {showCreateCategoryModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowCreateCategoryModal(false)}>
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="text-lg font-semibold text-gray-900">Thêm danh mục tiện ích mới</h3>
                            <button
                                onClick={() => {
                                    setShowCreateCategoryModal(false);
                                    setNewCategoryName('');
                                    setNewCategoryDescription('');
                                    setCreateCategoryError(null);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            {createCategoryError && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                                    {createCategoryError}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tên danh mục *
                                </label>
                                <input
                                    type="text"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    placeholder="VD: Tiện nghi phòng, Tiện nghi phòng tắm"
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mô tả (tùy chọn)
                                </label>
                                <textarea
                                    value={newCategoryDescription}
                                    onChange={(e) => setNewCategoryDescription(e.target.value)}
                                    rows={3}
                                    placeholder="Mô tả về danh mục này..."
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowCreateCategoryModal(false);
                                    setNewCategoryName('');
                                    setNewCategoryDescription('');
                                    setCreateCategoryError(null);
                                }}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                disabled={isCreatingCategory}
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                onClick={handleCreateCategory}
                                disabled={isCreatingCategory || !newCategoryName.trim()}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {isCreatingCategory ? 'Đang tạo...' : 'Tạo danh mục'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Click outside để đóng dropdown */}
            {showAmenityDropdown && (
                <div
                    className="fixed inset-0 z-[15]"
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowAmenityDropdown(false);
                        setAmenitySearchQuery('');
                    }}
                />
            )}
        </div>
    );
}
