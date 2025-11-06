"use client";

import { useFormStatus } from "react-dom";
import Link from "next/link";
import { useState, useEffect } from "react";
import type { Hotel } from "@/types";
import {
    getCountries, getProvinces, getCities, getDistricts, getWards, getStreets,
    createStreet, createWard, createDistrict, createCity, createProvince,
    type LocationOption
} from "@/lib/AdminAPI/locationService";
import { getPartners, createPartner, type Partner, type CreatePartnerRequest } from "@/lib/AdminAPI/partnerService";
import { getPartnerRole } from "@/lib/AdminAPI/roleService";
import { useAuth } from "@/components/Admin/AuthContext_Admin/AuthContextAdmin";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";

function SubmitButton({ isEditing }: { isEditing: boolean }) {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
        >
            {pending ? 'Đang lưu...' : (isEditing ? 'Cập nhật' : 'Gửi duyệt')}
        </button>
    );
}

interface HotelFormProps {
    hotel?: Hotel | null;
    formAction: (formData: FormData) => void;
    // Thêm prop này để kiểm soát vai trò, ví dụ: isSuperAdmin={user.role.name.toLowerCase() === 'admin'}
    isSuperAdmin?: boolean;
}

export default function HotelForm({ hotel, formAction, isSuperAdmin = false }: HotelFormProps) {
    const isEditing = !!hotel;
    const { effectiveUser } = useAuth();

    // Kiểm tra role của user hiện tại
    const isAdmin = effectiveUser?.role.name.toLowerCase() === 'admin';
    const isPartner = effectiveUser?.role.name.toLowerCase() === 'partner';
    const currentPartnerId = effectiveUser?.id || '';

    // State cho location dropdowns
    const [countries, setCountries] = useState<LocationOption[]>([]);
    const [provinces, setProvinces] = useState<LocationOption[]>([]);
    const [cities, setCities] = useState<LocationOption[]>([]);
    const [districts, setDistricts] = useState<LocationOption[]>([]);
    const [wards, setWards] = useState<LocationOption[]>([]);
    const [streets, setStreets] = useState<LocationOption[]>([]);

    // Selected values
    const [selectedCountryId, setSelectedCountryId] = useState<string>('');
    const [selectedProvinceId, setSelectedProvinceId] = useState<string>('');
    const [selectedCityId, setSelectedCityId] = useState<string>('');
    const [selectedDistrictId, setSelectedDistrictId] = useState<string>('');
    const [selectedWardId, setSelectedWardId] = useState<string>('');
    const [selectedStreetId, setSelectedStreetId] = useState<string>('');

    // State cho partners (chỉ dùng khi là admin)
    const [partners, setPartners] = useState<Partner[]>([]);
    const [selectedPartnerId, setSelectedPartnerId] = useState<string>('');
    const [isLoadingPartners, setIsLoadingPartners] = useState(false);

    // Modal state cho "Thêm mới location"
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createModalType, setCreateModalType] = useState<'street' | 'ward' | 'district' | 'city' | 'province'>('street');
    const [newLocationName, setNewLocationName] = useState('');
    const [newLocationCode, setNewLocationCode] = useState(''); // Mã cho province và city
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);

    // Modal state cho "Tạo partner mới"
    const [showCreatePartnerModal, setShowCreatePartnerModal] = useState(false);
    const [newPartnerEmail, setNewPartnerEmail] = useState('');
    const [newPartnerPassword, setNewPartnerPassword] = useState('');
    const [newPartnerFullName, setNewPartnerFullName] = useState('');
    const [newPartnerPhone, setNewPartnerPhone] = useState('');
    const [isCreatingPartner, setIsCreatingPartner] = useState(false);
    const [createPartnerError, setCreatePartnerError] = useState<string | null>(null);
    const [partnerRoleId, setPartnerRoleId] = useState<string>('');

    // State cho preview ảnh khi upload
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

    // Load countries and partners on mount
    useEffect(() => {
        const loadInitialData = async () => {
            // Load countries
            const countriesData = await getCountries();
            setCountries(countriesData);
            // Mặc định chọn Việt Nam nếu có
            const vietnam = countriesData.find(c => c.name.toLowerCase().includes('việt') || c.code === 'VN');
            if (vietnam) {
                setSelectedCountryId(vietnam.id);
                loadProvinces(vietnam.id);
            }

            // Chỉ load partners nếu user là admin (vì partner không có quyền truy cập /users)
            const userRole = effectiveUser?.role.name.toLowerCase();
            if (userRole === 'admin') {
                setIsLoadingPartners(true);
                try {
                    // Load roles để lấy roleId của "partner"
                    const partnerRole = await getPartnerRole();
                    if (partnerRole) {
                        setPartnerRoleId(partnerRole.id);
                        console.log(`[HotelForm] Partner role ID: ${partnerRole.id}`);
                    }

                    // Load danh sách partners
                    const partnersData = await getPartners();
                    setPartners(partnersData);
                    console.log(`[HotelForm] Loaded ${partnersData.length} partners`);
                } catch (error: any) {
                    console.error('[HotelForm] Error loading partners:', error);
                    // Không hiển thị lỗi cho user, chỉ log
                } finally {
                    setIsLoadingPartners(false);
                }
            } else if (userRole === 'partner' && currentPartnerId) {
                // Nếu là partner, tự động set partnerId của chính họ
                setSelectedPartnerId(currentPartnerId);
                console.log(`[HotelForm] Auto-set partnerId for partner user: ${currentPartnerId}`);
            }
        };
        loadInitialData();
    }, [effectiveUser?.role.name, effectiveUser?.id, currentPartnerId]);

    const loadProvinces = async (countryId: string) => {
        // Reset tất cả state phía dưới
        setSelectedProvinceId('');
        setSelectedCityId('');
        setSelectedDistrictId('');
        setSelectedWardId('');
        setSelectedStreetId('');
        setCities([]);
        setDistricts([]);
        setWards([]);
        setStreets([]);

        const data = await getProvinces(countryId);
        setProvinces(data);
    };

    const loadCities = async (provinceId: string) => {
        // Reset tất cả state phía dưới city
        setSelectedCityId('');
        setSelectedDistrictId('');
        setSelectedWardId('');
        setSelectedStreetId('');
        setDistricts([]);
        setWards([]);
        setStreets([]);

        const data = await getCities(provinceId);
        setCities(data);

        // Nếu chỉ có 1 city, tự động chọn và load districts
        if (data.length === 1) {
            const firstCity = data[0];
            setSelectedCityId(firstCity.id);
            await loadDistricts(firstCity.id);
        }
    };

    const loadDistricts = async (cityId: string) => {
        // Reset tất cả state phía dưới district
        setSelectedDistrictId('');
        setSelectedWardId('');
        setSelectedStreetId('');
        setWards([]);
        setStreets([]);

        // Validate cityId
        if (!cityId || cityId.trim() === '') {
            console.error('[HotelForm] Invalid cityId:', cityId);
            setDistricts([]);
            return;
        }

        console.log(`[HotelForm] Loading districts for cityId: ${cityId.trim()}`);

        // Load districts của cityId này - backend sẽ filter theo cityId
        const data = await getDistricts(cityId.trim(), selectedProvinceId);
        console.log(`[HotelForm] Loaded ${data.length} districts for cityId: ${cityId.trim()}`);

        // Log để debug
        if (data.length > 0) {
            console.log('[HotelForm] First few districts:', data.slice(0, 3).map(d => d.name));
        } else {
            console.warn('[HotelForm] No districts found for cityId:', cityId);
        }

        setDistricts(data);

        // Nếu chỉ có 1 district, tự động chọn và load wards
        if (data.length === 1) {
            const firstDistrict = data[0];
            setSelectedDistrictId(firstDistrict.id);
            await loadWards(firstDistrict.id, cityId);
        }
    };

    const loadWards = async (districtId: string, cityId?: string) => {
        // Reset tất cả state phía dưới ward
        setSelectedWardId('');
        setSelectedStreetId('');
        setStreets([]);

        // Load wards của districtId này, kèm cityId và provinceId để filter tốt hơn
        const data = await getWards(districtId, cityId || selectedCityId, selectedProvinceId);
        console.log(`[HotelForm] Loaded ${data.length} wards for districtId: ${districtId}, cityId: ${cityId || selectedCityId}, provinceId: ${selectedProvinceId}`);
        setWards(data);

        // Nếu chỉ có 1 ward, tự động chọn và load streets
        if (data.length === 1) {
            const firstWard = data[0];
            setSelectedWardId(firstWard.id);
            await loadStreets(firstWard.id, districtId, cityId || selectedCityId);
        }
    };

    const loadStreets = async (wardId: string, districtId?: string, cityId?: string) => {
        // Reset street selection
        setSelectedStreetId('');

        // Load streets của wardId này, kèm districtId, cityId và provinceId để filter tốt hơn
        const data = await getStreets(wardId, districtId || selectedDistrictId, cityId || selectedCityId, selectedProvinceId);
        console.log(`[HotelForm] Loaded ${data.length} streets for wardId: ${wardId}, districtId: ${districtId || selectedDistrictId}, cityId: ${cityId || selectedCityId}, provinceId: ${selectedProvinceId}`);
        setStreets(data);
    };

    return (
        <div className="bg-white rounded-lg shadow-md mt-4">
            <form action={formAction} className="p-8 space-y-8">
                {/* ... Các trường STT, Tên, Địa chỉ, Mô tả giữ nguyên ... */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1"><label htmlFor="stt" className="block text-sm font-medium text-gray-700">Số thứ tự (STT)</label><input type="number" name="stt" id="stt" defaultValue={hotel?.stt || ''} placeholder="VD: 1" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" /></div>
                    <div className="md:col-span-2"><label htmlFor="name" className="block text-sm font-medium text-gray-700">Tên khách sạn *</label><input type="text" name="name" id="name" required defaultValue={hotel?.name} placeholder="VD: Khách sạn Grand Saigon" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" /></div>
                </div>
                <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                        Địa chỉ cụ thể
                        <span className="text-gray-500 text-xs ml-1">(Có thể có hoặc không)</span>
                    </label>
                    <input
                        type="text"
                        name="address"
                        id="address"
                        defaultValue={hotel?.address}
                        placeholder="VD: 86 Đinh Bộ Lĩnh, số nhà, tên đường..."
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>

                {/* Location fields */}
                <div className="space-y-6">
                    <div>
                        <h3 className="text-base font-semibold text-gray-800 mb-2">Thông tin địa chỉ</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label htmlFor="countryId" className="block text-sm font-medium text-gray-700">Quốc gia *</label>
                            <select
                                id="countryId"
                                name="countryId"
                                required
                                value={selectedCountryId}
                                onChange={(e) => {
                                    setSelectedCountryId(e.target.value);
                                    if (e.target.value) loadProvinces(e.target.value);
                                }}
                                className="block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                                <option value="">Chọn quốc gia</option>
                                {countries
                                    .filter(c => c.id && String(c.id).trim())
                                    .filter((c, index, self) => self.findIndex(item => String(item.id) === String(c.id)) === index) // Remove duplicates
                                    .map((country, index) => (
                                        <option key={`country-${country.id}-${index}`} value={country.id}>{country.name}</option>
                                    ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label htmlFor="provinceId" className="block text-sm font-medium text-gray-700">Tỉnh/Thành phố *</label>
                                {isAdmin && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!selectedCountryId) {
                                                alert('Vui lòng chọn Quốc gia trước khi thêm tỉnh/thành phố mới');
                                                return;
                                            }
                                            setCreateModalType('province');
                                            setNewLocationName('');
                                            setNewLocationCode('');
                                            setCreateError(null);
                                            setShowCreateModal(true);
                                        }}
                                        disabled={!selectedCountryId}
                                        className="inline-flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                                        title="Thêm tỉnh/thành phố mới"
                                    >
                                        <PlusIcon className="h-4 w-4" />
                                        Thêm mới
                                    </button>
                                )}
                            </div>
                            <select
                                id="provinceId"
                                name="provinceId"
                                required
                                value={selectedProvinceId}
                                onChange={(e) => {
                                    setSelectedProvinceId(e.target.value);
                                    if (e.target.value) loadCities(e.target.value);
                                }}
                                disabled={!selectedCountryId}
                                className="block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
                            >
                                <option value="">Chọn tỉnh/thành phố</option>
                                {provinces
                                    .filter(p => p.id && String(p.id).trim())
                                    .filter((p, index, self) => self.findIndex(item => String(item.id) === String(p.id)) === index) // Remove duplicates
                                    .map((province, index) => (
                                        <option key={`province-${province.id}-${index}`} value={province.id}>{province.name}</option>
                                    ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label htmlFor="cityId" className="block text-sm font-medium text-gray-700">Thành phố/Quận *</label>
                                {isAdmin && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!selectedProvinceId) {
                                                alert('Vui lòng chọn Tỉnh/Thành phố trước khi thêm thành phố/quận mới');
                                                return;
                                            }
                                            setCreateModalType('city');
                                            setNewLocationName('');
                                            setNewLocationCode('');
                                            setCreateError(null);
                                            setShowCreateModal(true);
                                        }}
                                        disabled={!selectedProvinceId}
                                        className="inline-flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                                        title="Thêm thành phố/quận mới"
                                    >
                                        <PlusIcon className="h-4 w-4" />
                                        Thêm mới
                                    </button>
                                )}
                            </div>
                            <select
                                id="cityId"
                                name="cityId"
                                required
                                value={selectedCityId}
                                onChange={async (e) => {
                                    const newCityId = e.target.value;
                                    console.log('[HotelForm] City changed to:', newCityId);
                                    setSelectedCityId(newCityId);
                                    if (newCityId && newCityId.trim() !== '') {
                                        await loadDistricts(newCityId);
                                    } else {
                                        // Reset districts khi bỏ chọn city
                                        setDistricts([]);
                                        setSelectedDistrictId('');
                                        setWards([]);
                                        setStreets([]);
                                    }
                                }}
                                disabled={!selectedProvinceId}
                                className="block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
                            >
                                <option value="">Chọn thành phố/quận (của {provinces.find(p => p.id === selectedProvinceId)?.name || 'tỉnh đã chọn'})</option>
                                {cities
                                    .filter(c => c.id && String(c.id).trim())
                                    .filter((c, index, self) => self.findIndex(item => String(item.id) === String(c.id)) === index) // Remove duplicates
                                    .map((city, index) => (
                                        <option key={`city-${city.id}-${index}`} value={city.id}>{city.name}</option>
                                    ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label htmlFor="districtId" className="block text-sm font-medium text-gray-700">Quận/Huyện *</label>
                                {isAdmin && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!selectedCityId) {
                                                alert('Vui lòng chọn Thành phố/Quận trước khi thêm quận/huyện mới');
                                                return;
                                            }
                                            setCreateModalType('district');
                                            setNewLocationName('');
                                            setNewLocationCode('');
                                            setCreateError(null);
                                            setShowCreateModal(true);
                                        }}
                                        disabled={!selectedCityId}
                                        className="inline-flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                                        title="Thêm quận/huyện mới"
                                    >
                                        <PlusIcon className="h-4 w-4" />
                                        Thêm mới
                                    </button>
                                )}
                            </div>
                            <select
                                id="districtId"
                                name="districtId"
                                required={!selectedDistrictId}
                                value={selectedDistrictId}
                                onChange={async (e) => {
                                    setSelectedDistrictId(e.target.value);
                                    if (e.target.value) {
                                        await loadWards(e.target.value, selectedCityId);
                                    } else {
                                        // Reset wards khi bỏ chọn district
                                        setWards([]);
                                        setSelectedWardId('');
                                    }
                                }}
                                disabled={!selectedCityId}
                                className="block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
                            >
                                <option value="">Chọn quận/huyện (của {cities.find(c => c.id === selectedCityId)?.name || 'thành phố đã chọn'})</option>
                                {districts
                                    .filter(d => d.id && String(d.id).trim())
                                    .filter((d, index, self) => self.findIndex(item => String(item.id) === String(d.id)) === index) // Remove duplicates
                                    .map((district, index) => (
                                        <option key={`district-${district.id}-${index}`} value={district.id}>{district.name}</option>
                                    ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label htmlFor="wardId" className="block text-sm font-medium text-gray-700">Phường/Xã *</label>
                                {isAdmin && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!selectedDistrictId) {
                                                alert('Vui lòng chọn Quận/Huyện trước khi thêm phường/xã mới');
                                                return;
                                            }
                                            setCreateModalType('ward');
                                            setNewLocationName('');
                                            setNewLocationCode('');
                                            setCreateError(null);
                                            setShowCreateModal(true);
                                        }}
                                        disabled={!selectedDistrictId}
                                        className="inline-flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                                        title="Thêm phường/xã mới"
                                    >
                                        <PlusIcon className="h-4 w-4" />
                                        Thêm mới
                                    </button>
                                )}
                            </div>
                            <select
                                id="wardId"
                                name="wardId"
                                required={!selectedWardId}
                                value={selectedWardId}
                                onChange={async (e) => {
                                    setSelectedWardId(e.target.value);
                                    if (e.target.value) {
                                        await loadStreets(e.target.value, selectedDistrictId, selectedCityId);
                                    } else {
                                        // Reset streets khi bỏ chọn ward
                                        setStreets([]);
                                        setSelectedStreetId('');
                                    }
                                }}
                                disabled={!selectedDistrictId}
                                className="block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
                            >
                                <option value="">Chọn phường/xã (của {districts.find(d => d.id === selectedDistrictId)?.name || 'quận/huyện đã chọn'})</option>
                                {wards
                                    .filter(w => w.id && String(w.id).trim())
                                    .filter((w, index, self) => self.findIndex(item => String(item.id) === String(w.id)) === index) // Remove duplicates
                                    .map((ward, index) => (
                                        <option key={`ward-${ward.id}-${index}`} value={ward.id}>{ward.name}</option>
                                    ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label htmlFor="streetId" className="block text-sm font-medium text-gray-700">Đường *</label>
                                {isAdmin && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!selectedWardId) {
                                                alert('Vui lòng chọn Phường/Xã trước khi thêm đường mới');
                                                return;
                                            }
                                            setCreateModalType('street');
                                            setNewLocationName('');
                                            setNewLocationCode('');
                                            setCreateError(null);
                                            setShowCreateModal(true);
                                        }}
                                        disabled={!selectedWardId}
                                        className="inline-flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                                        title="Thêm đường mới"
                                    >
                                        <PlusIcon className="h-4 w-4" />
                                        Thêm mới
                                    </button>
                                )}
                            </div>
                            <select
                                id="streetId"
                                name="streetId"
                                required={!selectedStreetId}
                                value={selectedStreetId}
                                onChange={(e) => setSelectedStreetId(e.target.value)}
                                disabled={!selectedWardId}
                                className="block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
                            >
                                <option value="">Chọn đường (của {wards.find(w => w.id === selectedWardId)?.name || 'phường/xã đã chọn'})</option>
                                {streets
                                    .filter(s => s.id && String(s.id).trim())
                                    .filter((s, index, self) => self.findIndex(item => String(item.id) === String(s.id)) === index) // Remove duplicates
                                    .map((street, index) => (
                                        <option key={`street-${street.id}-${index}`} value={street.id}>{street.name}</option>
                                    ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Partner Selection */}
                <div className="space-y-2">
                    <label htmlFor="partnerId" className="block text-sm font-medium text-gray-700">
                        Đối tác *
                        {isPartner && (
                            <span className="ml-2 text-xs text-gray-500 font-normal">
                                (Bạn đang tạo khách sạn cho chính mình)
                            </span>
                        )}
                    </label>

                    {/* Nếu là partner: hiển thị thông tin và dùng hidden input */}
                    {isPartner ? (
                        <div>
                            <input
                                type="hidden"
                                name="partnerId"
                                id="partnerId"
                                value={currentPartnerId}
                            />
                            <div className="block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-700 text-sm">
                                {effectiveUser?.fullName} ({effectiveUser?.email})
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Khách sạn sẽ được tạo cho tài khoản của bạn
                            </p>
                        </div>
                    ) : isAdmin ? (
                        // Nếu là admin: hiển thị dropdown để chọn partner
                        <>
                            {isLoadingPartners ? (
                                <div className="block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 text-sm">
                                    Đang tải danh sách đối tác...
                                </div>
                            ) : partners.length === 0 ? (
                                <div className="block w-full px-3 py-2.5 border border-yellow-300 rounded-md shadow-sm bg-yellow-50 text-yellow-700 text-sm">
                                    ⚠️ Chưa có đối tác nào trong hệ thống. Vui lòng tạo đối tác trước khi tạo khách sạn.
                                </div>
                            ) : (
                                <select
                                    id="partnerId"
                                    name="partnerId"
                                    required
                                    value={selectedPartnerId}
                                    onChange={(e) => setSelectedPartnerId(e.target.value)}
                                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                >
                                    <option value="">Chọn đối tác</option>
                                    {partners.filter(p => p.id && String(p.id).trim()).map((partner, index) => (
                                        <option key={`partner-${partner.id}-${index}`} value={partner.id}>
                                            {partner.fullName} ({partner.email})
                                        </option>
                                    ))}
                                </select>
                            )}
                            <div className="mt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreatePartnerModal(true);
                                        setCreatePartnerError(null);
                                        setNewPartnerEmail('');
                                        setNewPartnerPassword('');
                                        setNewPartnerFullName('');
                                        setNewPartnerPhone('');
                                    }}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                                >
                                    <PlusIcon className="h-4 w-4" />
                                    {partners.length === 0 ? 'Tạo đối tác mới' : 'Thêm đối tác mới'}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="block w-full px-3 py-2.5 border border-red-300 rounded-md shadow-sm bg-red-50 text-red-700 text-sm">
                            ⚠️ Bạn không có quyền tạo khách sạn
                        </div>
                    )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Mô tả</label>
                    <textarea
                        id="description"
                        name="description"
                        rows={4}
                        defaultValue={hotel?.description || ''}
                        placeholder="Mô tả ngắn về khách sạn..."
                        className="block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm resize-y"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                        Ảnh đại diện khách sạn
                    </label>
                    <div className="flex items-start gap-x-4">
                        {/* Hiển thị preview ảnh đã chọn hoặc ảnh cũ nếu đang sửa */}
                        {(imagePreview || (isEditing && hotel?.imageUrl)) && (
                            <div className="relative">
                                <img 
                                    src={imagePreview || hotel?.imageUrl || ''} 
                                    alt="Ảnh đại diện" 
                                    className="h-32 w-48 rounded-md object-cover border border-gray-300"
                                />
                                {imagePreview && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setImagePreview(null);
                                            setSelectedImageFile(null);
                                            // Reset file input
                                            const fileInput = document.getElementById('image') as HTMLInputElement;
                                            if (fileInput) fileInput.value = '';
                                        }}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                        title="Xóa ảnh"
                                    >
                                        <XMarkIcon className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        )}
                        <div className="flex-1">
                            <label htmlFor="image" className="cursor-pointer inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                                <span>{imagePreview || (isEditing && hotel?.imageUrl) ? 'Thay đổi ảnh' : 'Tải ảnh lên'}</span>
                                <input 
                                    id="image" 
                                    name="image" 
                                    type="file" 
                                    className="sr-only" 
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            // Kiểm tra kích thước file (10MB)
                                            if (file.size > 10 * 1024 * 1024) {
                                                alert('Kích thước file không được vượt quá 10MB');
                                                return;
                                            }
                                            // Tạo preview
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setImagePreview(reader.result as string);
                                            };
                                            reader.readAsDataURL(file);
                                            setSelectedImageFile(file);
                                        }
                                    }}
                                />
                            </label>
                            <p className="text-xs text-gray-500 mt-1.5">PNG, JPG, GIF tối đa 10MB</p>
                            {selectedImageFile && (
                                <p className="text-xs text-green-600 mt-1">
                                    Đã chọn: {selectedImageFile.name}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
                {isEditing && isSuperAdmin && (
                    <div className="space-y-2">
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                            Trạng thái (chỉ Super Admin có thể sửa)
                        </label>
                        <select
                            id="status"
                            name="status"
                            defaultValue={hotel?.status}
                            className="block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                            <option value="ACTIVE">Đang hoạt động</option>
                            <option value="PENDING">Chờ duyệt</option>
                            <option value="HIDDEN">Ẩn</option>
                        </select>
                    </div>
                )}

                {/* Hiển thị trạng thái hiện tại (chỉ đọc) cho admin thường khi sửa */}
                {isEditing && !isSuperAdmin && (
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Trạng thái hiện tại</label>
                        <p className="px-3 py-2.5 bg-gray-100 border border-gray-200 rounded-md text-gray-600">
                            {hotel?.status === 'ACTIVE' ? 'Đã được duyệt' : hotel?.status === 'PENDING' ? 'Đang chờ duyệt' : 'Đã ẩn'}
                        </p>
                    </div>
                )}

                {/* Các nút hành động */}
                <div className="flex justify-end gap-4 pt-5 border-t border-gray-200">
                    <Link href="/admin-hotels" className="py-2 px-6 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                        Hủy
                    </Link>
                    <SubmitButton isEditing={isEditing} />
                </div>
            </form>

            {/* Modal để thêm location mới */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Thêm {createModalType === 'street' ? 'Đường' : createModalType === 'ward' ? 'Phường/Xã' : createModalType === 'district' ? 'Quận/Huyện' : createModalType === 'city' ? 'Thành phố/Quận' : 'Tỉnh/Thành phố'} mới
                            </h3>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setNewLocationName('');
                                    setCreateError(null);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-4">
                            {createError && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                                    {createError}
                                </div>
                            )}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tên {createModalType === 'street' ? 'đường' : createModalType === 'ward' ? 'phường/xã' : createModalType === 'district' ? 'quận/huyện' : createModalType === 'city' ? 'thành phố/quận' : 'tỉnh/thành phố'} *
                                </label>
                                <input
                                    type="text"
                                    value={newLocationName}
                                    onChange={(e) => setNewLocationName(e.target.value)}
                                    placeholder={`VD: ${createModalType === 'street' ? 'Đinh Bộ Lĩnh' : createModalType === 'ward' ? 'Phường 2' : createModalType === 'district' ? 'Quận Tân Bình' : createModalType === 'city' ? 'Thành phố Hồ Chí Minh' : 'Hồ Chí Minh'}`}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    autoFocus
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Thêm {createModalType === 'street' ? 'đường' : createModalType === 'ward' ? 'phường/xã' : createModalType === 'district' ? 'quận/huyện' : createModalType === 'city' ? 'thành phố/quận' : 'tỉnh/thành phố'} mới vào hệ thống
                                </p>
                            </div>
                            {/* Thêm trường mã cho province, city, district, ward và street */}
                            {(createModalType === 'province' || createModalType === 'city' || createModalType === 'district' || createModalType === 'ward' || createModalType === 'street') && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Mã {
                                            createModalType === 'province' ? 'tỉnh/thành phố' :
                                            createModalType === 'city' ? 'thành phố/quận' :
                                            createModalType === 'district' ? 'quận/huyện' :
                                            createModalType === 'ward' ? 'phường/xã' :
                                            'đường'
                                        } * (2-3 ký tự)
                                    </label>
                                    <input
                                        type="text"
                                        value={newLocationCode}
                                        onChange={(e) => {
                                            // Chỉ cho phép nhập tối đa 3 ký tự
                                            const value = e.target.value.toUpperCase().slice(0, 3);
                                            setNewLocationCode(value);
                                        }}
                                        placeholder={`VD: ${
                                            createModalType === 'province' ? 'HN' :
                                            createModalType === 'city' ? 'HCM' :
                                            createModalType === 'district' ? 'Q1' :
                                            createModalType === 'ward' ? 'P1' :
                                            'D1'
                                        }`}
                                        maxLength={3}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Mã phải có từ 2 đến 3 ký tự (VD: {
                                            createModalType === 'province' ? 'HN, HCM' :
                                            createModalType === 'city' ? 'HCM, Q1' :
                                            createModalType === 'district' ? 'Q1, H1' :
                                            createModalType === 'ward' ? 'P1, X1' :
                                            'D1, D2'
                                        })
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setNewLocationName('');
                                    setNewLocationCode('');
                                    setCreateError(null);
                                }}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                disabled={isCreating}
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                onClick={async () => {
                                    if (!newLocationName.trim()) {
                                        setCreateError('Vui lòng nhập tên');
                                        return;
                                    }

                                    // Validate code cho province, city, district, ward và street
                                    if ((createModalType === 'province' || createModalType === 'city' || createModalType === 'district' || createModalType === 'ward' || createModalType === 'street')) {
                                        if (!newLocationCode.trim()) {
                                            setCreateError('Vui lòng nhập mã (2-3 ký tự)');
                                            return;
                                        }
                                        if (newLocationCode.trim().length < 2 || newLocationCode.trim().length > 3) {
                                            setCreateError('Mã phải có từ 2 đến 3 ký tự');
                                            return;
                                        }
                                    }

                                    // Kiểm tra trùng trước khi tạo (optional check - chỉ để thông báo)
                                    setIsCreating(true);
                                    setCreateError(null);
                                    
                                    // Note: Backend sẽ kiểm tra trùng chính xác, nhưng có thể thông báo trước
                                    try {
                                        if (createModalType === 'province') {
                                            // Kiểm tra xem có tỉnh nào cùng tên không
                                            const existingProvinces = await getProvinces(selectedCountryId, newLocationName.trim());
                                            if (existingProvinces.length > 0) {
                                                const found = existingProvinces.find(p => 
                                                    p.name.toLowerCase() === newLocationName.trim().toLowerCase()
                                                );
                                                if (found) {
                                                    setCreateError(`Tỉnh "${newLocationName}" đã tồn tại trong hệ thống (ID: ${found.id}). Vui lòng chọn tên khác.`);
                                                    setIsCreating(false);
                                                    return;
                                                }
                                            }
                                        }
                                    } catch (checkError: any) {
                                        // Nếu check fail, vẫn tiếp tục tạo (backend sẽ validate)
                                        console.warn('[HotelForm] Pre-check warning:', checkError);
                                    }

                                    try {
                                        let newLocation: LocationOption;

                                        switch (createModalType) {
                                            case 'street':
                                                if (!selectedWardId) {
                                                    throw new Error('Vui lòng chọn Phường/Xã trước');
                                                }
                                                newLocation = await createStreet(newLocationName, selectedWardId, newLocationCode.trim());
                                                // Refresh streets và tự động chọn
                                                await loadStreets(selectedWardId, selectedDistrictId, selectedCityId);
                                                setSelectedStreetId(newLocation.id);
                                                break;

                                            case 'ward':
                                                if (!selectedDistrictId) {
                                                    throw new Error('Vui lòng chọn Quận/Huyện trước');
                                                }
                                                newLocation = await createWard(newLocationName, selectedDistrictId, newLocationCode.trim());
                                                await loadWards(selectedDistrictId, selectedCityId);
                                                setSelectedWardId(newLocation.id);
                                                break;

                                            case 'district':
                                                if (!selectedCityId) {
                                                    throw new Error('Vui lòng chọn Thành phố/Quận trước');
                                                }
                                                newLocation = await createDistrict(newLocationName, selectedCityId, newLocationCode.trim());
                                                await loadDistricts(selectedCityId);
                                                setSelectedDistrictId(newLocation.id);
                                                break;

                                            case 'city':
                                                if (!selectedProvinceId) {
                                                    throw new Error('Vui lòng chọn Tỉnh/Thành phố trước');
                                                }
                                                newLocation = await createCity(newLocationName, newLocationCode.trim(), selectedProvinceId);
                                                await loadCities(selectedProvinceId);
                                                setSelectedCityId(newLocation.id);
                                                break;

                                            case 'province':
                                                if (!selectedCountryId) {
                                                    throw new Error('Vui lòng chọn Quốc gia trước');
                                                }
                                                newLocation = await createProvince(newLocationName, newLocationCode.trim(), selectedCountryId);
                                                await loadProvinces(selectedCountryId);
                                                setSelectedProvinceId(newLocation.id);
                                                break;
                                        }

                                        setShowCreateModal(false);
                                        setNewLocationName('');
                                        setNewLocationCode('');
                                    } catch (error: any) {
                                        console.error('[HotelForm] Error creating location:', error);
                                        console.error('[HotelForm] Error details:', {
                                            message: error.message,
                                            response: error.response?.data,
                                            stack: error.stack,
                                        });
                                        
                                        // Xử lý error message chi tiết hơn
                                        let errorMessage = error.message || error.response?.data?.message || 'Không thể tạo location. Vui lòng thử lại.';
                                        
                                        // Nếu là lỗi "đã tồn tại", hiển thị rõ hơn
                                        if (errorMessage.includes('đã tồn tại') || errorMessage.includes('already exists')) {
                                            const locationType = createModalType === 'province' ? 'tỉnh/thành phố' :
                                                               createModalType === 'city' ? 'thành phố/quận' :
                                                               createModalType === 'district' ? 'quận/huyện' :
                                                               createModalType === 'ward' ? 'phường/xã' : 'đường';
                                            
                                            errorMessage = `${locationType.charAt(0).toUpperCase() + locationType.slice(1)} đã tồn tại trong hệ thống.\n\n` +
                                                          `Có thể:\n` +
                                                          `- Tên "${newLocationName}" đã được sử dụng\n` +
                                                          `${(createModalType === 'province' || createModalType === 'city' || createModalType === 'district' || createModalType === 'ward' || createModalType === 'street') ? `- Mã "${newLocationCode}" đã được sử dụng\n` : ''}` +
                                                          `\nVui lòng thử tên/mã khác hoặc kiểm tra lại danh sách.`;
                                        }
                                        
                                        setCreateError(errorMessage);
                                    } finally {
                                        setIsCreating(false);
                                    }
                                }}
                                disabled={
                                    isCreating || 
                                    !newLocationName.trim() || 
                                    ((createModalType === 'province' || createModalType === 'city' || createModalType === 'district' || createModalType === 'ward' || createModalType === 'street') && 
                                     (!newLocationCode.trim() || newLocationCode.trim().length < 2 || newLocationCode.trim().length > 3))
                                }
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {isCreating ? 'Đang tạo...' : 'Tạo mới'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal để tạo partner mới */}
            {showCreatePartnerModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Tạo đối tác mới
                            </h3>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowCreatePartnerModal(false);
                                    setNewPartnerEmail('');
                                    setNewPartnerPassword('');
                                    setNewPartnerFullName('');
                                    setNewPartnerPhone('');
                                    setCreatePartnerError(null);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-4">
                            {createPartnerError && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                                    {createPartnerError}
                                </div>
                            )}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        value={newPartnerEmail}
                                        onChange={(e) => setNewPartnerEmail(e.target.value)}
                                        placeholder="VD: partner@example.com"
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Mật khẩu * (tối thiểu 8 ký tự)
                                    </label>
                                    <input
                                        type="password"
                                        value={newPartnerPassword}
                                        onChange={(e) => setNewPartnerPassword(e.target.value)}
                                        placeholder="Nhập mật khẩu"
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Họ và tên *
                                    </label>
                                    <input
                                        type="text"
                                        value={newPartnerFullName}
                                        onChange={(e) => setNewPartnerFullName(e.target.value)}
                                        placeholder="VD: Nguyễn Văn A"
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Số điện thoại (tùy chọn)
                                    </label>
                                    <input
                                        type="tel"
                                        value={newPartnerPhone}
                                        onChange={(e) => setNewPartnerPhone(e.target.value)}
                                        placeholder="VD: 0123456789"
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowCreatePartnerModal(false);
                                    setNewPartnerEmail('');
                                    setNewPartnerPassword('');
                                    setNewPartnerFullName('');
                                    setNewPartnerPhone('');
                                    setCreatePartnerError(null);
                                }}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                disabled={isCreatingPartner}
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                onClick={async () => {
                                    if (!newPartnerEmail.trim() || !newPartnerPassword.trim() || !newPartnerFullName.trim()) {
                                        setCreatePartnerError('Vui lòng điền đầy đủ các trường bắt buộc');
                                        return;
                                    }

                                    if (newPartnerPassword.length < 8) {
                                        setCreatePartnerError('Mật khẩu phải có ít nhất 8 ký tự');
                                        return;
                                    }

                                    if (!partnerRoleId) {
                                        setCreatePartnerError('Không tìm thấy role "partner". Vui lòng thử lại.');
                                        return;
                                    }

                                    setIsCreatingPartner(true);
                                    setCreatePartnerError(null);

                                    try {
                                        const newPartner: CreatePartnerRequest = {
                                            email: newPartnerEmail.trim(),
                                            password: newPartnerPassword,
                                            fullName: newPartnerFullName.trim(),
                                            phoneNumber: newPartnerPhone.trim() || undefined,
                                            roleId: partnerRoleId,
                                            authProvider: 'LOCAL',
                                        };

                                        const createdPartner = await createPartner(newPartner);
                                        console.log('[HotelForm] Partner created:', createdPartner);

                                        // Refresh danh sách partners
                                        const partnersData = await getPartners();
                                        setPartners(partnersData);

                                        // Tự động chọn partner vừa tạo
                                        setSelectedPartnerId(createdPartner.id);

                                        // Đóng modal
                                        setShowCreatePartnerModal(false);
                                        setNewPartnerEmail('');
                                        setNewPartnerPassword('');
                                        setNewPartnerFullName('');
                                        setNewPartnerPhone('');
                                    } catch (error: any) {
                                        console.error('[HotelForm] Error creating partner:', error);
                                        setCreatePartnerError(error.message || 'Không thể tạo đối tác. Vui lòng thử lại.');
                                    } finally {
                                        setIsCreatingPartner(false);
                                    }
                                }}
                                disabled={isCreatingPartner || !newPartnerEmail.trim() || !newPartnerPassword.trim() || !newPartnerFullName.trim() || !partnerRoleId}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {isCreatingPartner ? 'Đang tạo...' : 'Tạo đối tác'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}