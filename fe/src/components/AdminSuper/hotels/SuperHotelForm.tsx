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
import { PlusIcon, XMarkIcon, ChevronDownIcon, ChevronUpIcon, ClockIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import { getAmenities, getAmenityCategories, type Amenity, type AmenityCategory } from "@/lib/AdminAPI/amenityService";
import { getEntertainmentVenuesByCity, type EntertainmentVenueByCategory, type EntertainmentVenue } from "@/lib/AdminAPI/entertainmentVenueService";
import { getAllCancellationPolicies, getAllReschedulePolicies } from "@/lib/AdminAPI/policyService";

function SubmitButton({ isEditing }: { isEditing: boolean }) {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="inline-flex justify-center items-center gap-2 py-2.5 px-8 border border-transparent shadow-lg text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
        >
            {pending ? (
                <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang lưu...
                </>
            ) : (
                isEditing ? 'Cập nhật khách sạn' : 'Tạo khách sạn'
            )}
        </button>
    );
}

interface SuperHotelFormProps {
    hotel?: Hotel | null;
    formAction: (formData: FormData) => void;
}

export default function SuperHotelForm({ hotel, formAction }: SuperHotelFormProps) {
    const isEditing = !!hotel;
    const { effectiveUser } = useAuth();

    // Super-admin luôn có quyền admin và không phải partner
    const isAdmin = true; // Super-admin luôn có quyền admin
    const isPartner = false; // Super-admin không phải partner
    const currentPartnerId = ''; // Super-admin không tự động gán partnerId

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

    // State cho preview nhiều ảnh khi upload
    const [imagePreviews, setImagePreviews] = useState<Array<{ file: File; preview: string }>>([]);

    // State cho amenities
    const [amenities, setAmenities] = useState<Amenity[]>([]);
    const [selectedAmenityIds, setSelectedAmenityIds] = useState<Set<string>>(new Set());
    const [searchAmenityQuery, setSearchAmenityQuery] = useState<string>('');
    const [showAllMainAmenities, setShowAllMainAmenities] = useState<boolean>(false);

    // State cho policy
    const [checkInTime, setCheckInTime] = useState<string>('14:00');
    const [checkOutTime, setCheckOutTime] = useState<string>('12:00');
    const [allowsPayAtHotel, setAllowsPayAtHotel] = useState<boolean>(false);
    const [selectedDocumentIds, setSelectedDocumentIds] = useState<Set<string>>(new Set());
    // State cho policy (super-admin chọn từ danh sách)
    const [cancellationPolicyId, setCancellationPolicyId] = useState<string>('');
    const [reschedulePolicyId, setReschedulePolicyId] = useState<string>('');
    const [cancellationPolicies, setCancellationPolicies] = useState<Array<{ id: string; name: string; description?: string }>>([]);
    const [reschedulePolicies, setReschedulePolicies] = useState<Array<{ id: string; name: string; description?: string }>>([]);
    const [identificationDocuments, setIdentificationDocuments] = useState<Array<{ id: string; name: string }>>([]);

    // State cho entertainment venues
    const [entertainmentVenuesByCategory, setEntertainmentVenuesByCategory] = useState<EntertainmentVenueByCategory[]>([]);
    const [selectedVenues, setSelectedVenues] = useState<Array<{ venueId: string; distance: number }>>([]);
    const [newVenues, setNewVenues] = useState<Array<{ name: string; distance: number; categoryId: string }>>([]);
    const [newVenueName, setNewVenueName] = useState('');
    const [newVenueDistance, setNewVenueDistance] = useState<number>(0);
    const [newVenueCategoryId, setNewVenueCategoryId] = useState<string>('');
    // Lưu venue distance từ hotel data để dùng khi tích checkbox
    const [hotelVenueDistances, setHotelVenueDistances] = useState<Map<string, number>>(new Map());

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

            // Load amenities
            try {
                const amenitiesData = await getAmenities();
                setAmenities(amenitiesData);

                // Tự động chọn các amenities miễn phí (free = true) - tiện ích phổ biến
                const freeAmenityIds = new Set(amenitiesData.filter(a => a.free).map(a => a.id));
                setSelectedAmenityIds(freeAmenityIds);
            } catch (error) {
                console.error('[SuperHotelForm] Error loading amenities:', error);
            }

            // Super-admin luôn load partners
            setIsLoadingPartners(true);
            try {
                // Load roles để lấy roleId của "partner"
                const partnerRole = await getPartnerRole();
                if (partnerRole) {
                    setPartnerRoleId(partnerRole.id);
                    console.log(`[SuperHotelForm] Partner role ID: ${partnerRole.id}`);
                }

                // Load danh sách partners
                const partnersData = await getPartners();
                setPartners(partnersData);
                console.log(`[SuperHotelForm] Loaded ${partnersData.length} partners`);
            } catch (error: any) {
                console.error('[SuperHotelForm] Error loading partners:', error);
                // Không hiển thị lỗi cho user, chỉ log
            } finally {
                setIsLoadingPartners(false);
            }
        };
        loadInitialData();
    }, []); // Super-admin không phụ thuộc vào user role

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
            console.error('[SuperHotelForm] Invalid cityId:', cityId);
            setDistricts([]);
            return;
        }

        console.log(`[SuperHotelForm] Loading districts for cityId: ${cityId.trim()}`);

        // Load districts của cityId này - backend sẽ filter theo cityId
        const data = await getDistricts(cityId.trim(), selectedProvinceId);
        console.log(`[SuperHotelForm] Loaded ${data.length} districts for cityId: ${cityId.trim()}`);

        // Log để debug
        if (data.length > 0) {
            console.log('[SuperHotelForm] First few districts:', data.slice(0, 3).map(d => d.name));
        } else {
            console.warn('[SuperHotelForm] No districts found for cityId:', cityId);
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
        console.log(`[SuperHotelForm] Loaded ${data.length} wards for districtId: ${districtId}, cityId: ${cityId || selectedCityId}, provinceId: ${selectedProvinceId}`);
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
        console.log(`[SuperHotelForm] Loaded ${data.length} streets for wardId: ${wardId}, districtId: ${districtId || selectedDistrictId}, cityId: ${cityId || selectedCityId}, provinceId: ${selectedProvinceId}`);
        setStreets(data);
    };

    // Load entertainment venues khi city được chọn
    useEffect(() => {
        const loadVenues = async () => {
            if (selectedCityId) {
                try {
                    const venuesData = await getEntertainmentVenuesByCity(selectedCityId);
                    setEntertainmentVenuesByCategory(venuesData || []);

                    // Nếu hotel đã có venues (khi edit), load chúng và lưu distance map
                    // Backend trả về distance theo meters, form hiển thị theo km → cần convert meters → km (chia 1000)
                    if (isEditing && hotel) {
                        const hotelData = hotel as any;
                        const distanceMap = new Map<string, number>();

                        if (hotelData?.entertainmentVenues && Array.isArray(hotelData.entertainmentVenues)) {
                            // Flatten venues từ các categories
                            const allVenues: Array<{ id?: string; entertainmentVenueId?: string; distance: number }> = [];
                            hotelData.entertainmentVenues.forEach((categoryGroup: any) => {
                                if (categoryGroup?.entertainmentVenues && Array.isArray(categoryGroup.entertainmentVenues)) {
                                    categoryGroup.entertainmentVenues.forEach((venue: any) => {
                                        if (venue?.id && venue?.distance != null) {
                                            const venueId = venue.id;
                                            const distanceInMeters = venue.distance;
                                            // Lưu distance vào map (meters) để dùng sau
                                            distanceMap.set(venueId, distanceInMeters);

                                            allVenues.push({
                                                id: venueId,
                                                entertainmentVenueId: venueId,
                                                distance: distanceInMeters // meters từ backend
                                            });
                                        }
                                    });
                                }
                            });

                            // Lưu distance map để dùng khi tích checkbox
                            setHotelVenueDistances(distanceMap);

                            // Convert meters → km cho form
                            const existingVenues = allVenues.map((v: any) => ({
                                venueId: v.id || v.entertainmentVenueId,
                                // Convert meters → km (chia 1000) để hiển thị trong form
                                distance: v.distance ? (v.distance / 1000) : 1
                            })).filter((v: any) => v.venueId);
                            setSelectedVenues(existingVenues);
                        } else {
                            // Không có venues, reset map
                            setHotelVenueDistances(new Map());
                        }
                    }

                    // Tự động tìm category "Địa Điểm Lân Cận" để dùng cho venue mới
                    if (venuesData && venuesData.length > 0) {
                        const nearbyCategory = venuesData.find(cat =>
                            cat?.name && (
                                cat.name.toLowerCase().includes('lân cận') ||
                                cat.name.toLowerCase().includes('địa điểm lân cận') ||
                                cat.name.toLowerCase().includes('nearby')
                            )
                        );
                        if (nearbyCategory && nearbyCategory.id) {
                            setNewVenueCategoryId(nearbyCategory.id);
                        } else {
                            // Nếu không tìm thấy, dùng category đầu tiên
                            setNewVenueCategoryId(venuesData[0].id);
                        }
                    } else {
                        // Nếu không có venues nào, set ID mặc định "Địa Điểm Lân Cận"
                        // Backend sẽ xử lý nếu category chưa tồn tại
                        setNewVenueCategoryId('a4d8d350-a850-11f0-a7b7-0a6aab4924ab');
                    }
                } catch (error) {
                    console.error('[SuperHotelForm] Error loading entertainment venues:', error);
                    setEntertainmentVenuesByCategory([]);
                    // Set ID mặc định khi có lỗi
                    setNewVenueCategoryId('a4d8d350-a850-11f0-a7b7-0a6aab4924ab');
                }
            } else {
                setEntertainmentVenuesByCategory([]);
                // Reset categoryId khi không có city
                setNewVenueCategoryId('');
            }
        };
        loadVenues();
    }, [selectedCityId, isEditing, hotel]);

    // Load policies khi component mount (super-admin chọn từ danh sách)
    useEffect(() => {
        const loadPolicies = async () => {
            // Load cancellation policies (có thể không tồn tại API)
            try {
                const cancellationPoliciesData = await getAllCancellationPolicies();
                setCancellationPolicies(cancellationPoliciesData);
            } catch (error: any) {
                // Nếu API không tồn tại (404), để trống danh sách
                console.warn('[SuperHotelForm] Cancellation policies API không tồn tại hoặc có lỗi:', error?.response?.status || error?.message);
                setCancellationPolicies([]);
            }

            // Load reschedule policies (có thể không tồn tại API)
            try {
                const reschedulePoliciesData = await getAllReschedulePolicies();
                setReschedulePolicies(reschedulePoliciesData);
            } catch (error: any) {
                // Nếu API không tồn tại (404), để trống danh sách
                console.warn('[SuperHotelForm] Reschedule policies API không tồn tại hoặc có lỗi:', error?.response?.status || error?.message);
                setReschedulePolicies([]);
            }

            // Identification documents - API không tồn tại, để trống
            // TODO: Thêm API endpoint hoặc hardcode danh sách documents
            setIdentificationDocuments([]);
        };
        loadPolicies();
    }, []);

    // Load policy data từ hotel nếu đang edit
    useEffect(() => {
        if (hotel && 'policy' in hotel && hotel.policy) {
            const policy = hotel.policy as any;
            if (policy.checkInTime) {
                setCheckInTime(policy.checkInTime);
            }
            if (policy.checkOutTime) {
                setCheckOutTime(policy.checkOutTime);
            }
            if (policy.allowsPayAtHotel !== undefined) {
                setAllowsPayAtHotel(policy.allowsPayAtHotel);
            }
            if (policy.requiredIdentificationDocuments) {
                const docIds = new Set<string>(policy.requiredIdentificationDocuments.map((doc: { id: string }) => doc.id));
                setSelectedDocumentIds(docIds);
            }
            if (policy.cancellationPolicy?.id) {
                setCancellationPolicyId(policy.cancellationPolicy.id);
            }
            if (policy.reschedulePolicy?.id) {
                setReschedulePolicyId(policy.reschedulePolicy.id);
            }
        }
    }, [hotel]);

    // Handler để cập nhật venues riêng (test)
    const handleUpdateVenuesOnly = async () => {
        if (!isEditing || !hotel) {
            alert('Chỉ có thể cập nhật khi đang edit hotel');
            return;
        }

        try {
            const { updateHotelServer } = await import('@/lib/AdminAPI/hotelService');
            const { toast } = await import('react-toastify');

            const formData = new FormData();

            // Phân biệt venues cần ADD (mới) và UPDATE (đã có trong hotel)
            const existingVenueIds = new Set(hotelVenueDistances.keys());
            const venuesToUpdate: Array<{ venueId: string; distance: number }> = [];
            const venuesToAdd: Array<{ venueId: string; distance: number }> = [];

            selectedVenues.forEach((venue) => {
                if (existingVenueIds.has(venue.venueId)) {
                    venuesToUpdate.push(venue);
                } else {
                    venuesToAdd.push(venue);
                }
            });

            console.log('[SuperHotelForm] 🧪 Testing venue update:');
            console.log('  - Venues to UPDATE:', venuesToUpdate);
            console.log('  - Venues to ADD:', venuesToAdd);
            console.log('  - New venues:', newVenues);

            // Append venues cần UPDATE
            venuesToUpdate.forEach((venue, index) => {
                const distanceInMeters = Math.round(venue.distance * 1000);
                formData.append(`entertainmentVenuesWithDistanceToUpdate[${index}].entertainmentVenueId`, venue.venueId);
                formData.append(`entertainmentVenuesWithDistanceToUpdate[${index}].distance`, distanceInMeters.toString());
                console.log(`  - UPDATE[${index}]: ${venue.venueId} = ${distanceInMeters}m (${venue.distance}km)`);
            });

            // Append venues cần ADD
            venuesToAdd.forEach((venue, index) => {
                const distanceInMeters = Math.round(venue.distance * 1000);
                formData.append(`entertainmentVenuesWithDistanceToAdd[${index}].entertainmentVenueId`, venue.venueId);
                formData.append(`entertainmentVenuesWithDistanceToAdd[${index}].distance`, distanceInMeters.toString());
                console.log(`  - ADD[${index}]: ${venue.venueId} = ${distanceInMeters}m (${venue.distance}km)`);
            });

            // Append new venues
            newVenues.forEach((venue, index) => {
                const distanceInMeters = Math.round(venue.distance * 1000);
                formData.append(`entertainmentVenuesToAdd[${index}].name`, venue.name);
                formData.append(`entertainmentVenuesToAdd[${index}].distance`, distanceInMeters.toString());
                formData.append(`entertainmentVenuesToAdd[${index}].cityId`, selectedCityId);
                formData.append(`entertainmentVenuesToAdd[${index}].categoryId`, venue.categoryId);
                console.log(`  - NEW[${index}]: ${venue.name} = ${distanceInMeters}m (${venue.distance}km)`);
            });

            // Log tất cả FormData entries
            console.log('[SuperHotelForm] 📤 FormData entries:');
            for (const [key, value] of formData.entries()) {
                console.log(`  ${key}:`, value);
            }

            await updateHotelServer(hotel.id, formData);

            toast.success(`✅ Đã cập nhật ${venuesToUpdate.length} địa điểm và thêm ${venuesToAdd.length + newVenues.length} địa điểm mới!`, {
                position: "top-right",
                autoClose: 3000,
            });

            // Reload page để xem kết quả
            window.location.reload();
        } catch (error: any) {
            console.error('[SuperHotelForm] ❌ Error updating venues:', error);
            const { toast } = await import('react-toastify');
            toast.error(error.message || 'Không thể cập nhật địa điểm. Vui lòng thử lại.', {
                position: "top-right",
                autoClose: 3000,
            });
        }
    };

    // Handler để append nhiều ảnh vào FormData trước khi submit
    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);

        // Append tất cả các ảnh đã chọn vào FormData
        imagePreviews.forEach((item) => {
            formData.append('images', item.file);
        });

        // Append amenities (amenityIdsToAdd)
        selectedAmenityIds.forEach((amenityId) => {
            formData.append('amenityIdsToAdd[]', amenityId);
        });

        // Phân biệt venues cần ADD (mới) và UPDATE (đã có trong hotel)
        // Venues đã có trong hotel (có trong hotelVenueDistances) → dùng entertainmentVenuesWithDistanceToUpdate
        // Venues chưa có → dùng entertainmentVenuesWithDistanceToAdd

        const existingVenueIds = new Set(hotelVenueDistances.keys()); // Venues đã có trong hotel
        const venuesToUpdate: Array<{ venueId: string; distance: number }> = [];
        const venuesToAdd: Array<{ venueId: string; distance: number }> = [];

        console.log('[SuperHotelForm] 📋 Processing venues for submit:');
        console.log('  - Existing venue IDs from hotel:', Array.from(existingVenueIds));
        console.log('  - Selected venues:', selectedVenues);

        selectedVenues.forEach((venue) => {
            if (existingVenueIds.has(venue.venueId)) {
                // Venue đã có trong hotel → UPDATE
                venuesToUpdate.push(venue);
                console.log(`  ✅ Venue ${venue.venueId} → UPDATE (distance: ${venue.distance} km)`);
            } else {
                // Venue chưa có trong hotel → ADD
                venuesToAdd.push(venue);
                console.log(`  ➕ Venue ${venue.venueId} → ADD (distance: ${venue.distance} km)`);
            }
        });

        console.log(`[SuperHotelForm] 📊 Summary: ${venuesToUpdate.length} to UPDATE, ${venuesToAdd.length} to ADD`);

        // Append venues cần UPDATE (đã có trong hotel)
        // Backend lưu distance theo meters, form nhập theo km → cần convert km → meters
        venuesToUpdate.forEach((venue, index) => {
            formData.append(`entertainmentVenuesWithDistanceToUpdate[${index}].entertainmentVenueId`, venue.venueId);
            // Convert km → meters (nhân 1000)
            const distanceInMeters = Math.round(venue.distance * 1000);
            formData.append(`entertainmentVenuesWithDistanceToUpdate[${index}].distance`, distanceInMeters.toString());
            console.log(`[SuperHotelForm] 📤 UPDATE[${index}]: ${venue.venueId} = ${distanceInMeters}m (${venue.distance}km)`);
        });

        // Append venues cần ADD (chưa có trong hotel)
        // Backend lưu distance theo meters, form nhập theo km → cần convert km → meters
        venuesToAdd.forEach((venue, index) => {
            formData.append(`entertainmentVenuesWithDistanceToAdd[${index}].entertainmentVenueId`, venue.venueId);
            // Convert km → meters (nhân 1000)
            const distanceInMeters = Math.round(venue.distance * 1000);
            formData.append(`entertainmentVenuesWithDistanceToAdd[${index}].distance`, distanceInMeters.toString());
            console.log(`[SuperHotelForm] 📤 ADD[${index}]: ${venue.venueId} = ${distanceInMeters}m (${venue.distance}km)`);
        });

        // Append entertainment venues mới (entertainmentVenuesToAdd)
        // Backend lưu distance theo meters, form nhập theo km → cần convert km → meters
        newVenues.forEach((venue, index) => {
            formData.append(`entertainmentVenuesToAdd[${index}].name`, venue.name);
            // Convert km → meters (nhân 1000)
            const distanceInMeters = Math.round(venue.distance * 1000);
            formData.append(`entertainmentVenuesToAdd[${index}].distance`, distanceInMeters.toString());
            formData.append(`entertainmentVenuesToAdd[${index}].cityId`, selectedCityId);
            formData.append(`entertainmentVenuesToAdd[${index}].categoryId`, venue.categoryId);
        });

        // Append policy data
        if (checkInTime) {
            formData.append('policy.checkInTime', checkInTime);
        }
        if (checkOutTime) {
            formData.append('policy.checkOutTime', checkOutTime);
        }
        formData.append('policy.allowsPayAtHotel', allowsPayAtHotel.toString());

        // Append required identification documents
        selectedDocumentIds.forEach((docId) => {
            formData.append('policy.requiredIdentificationDocumentIdsToAdd[]', docId);
        });

        // Append cancellation and reschedule policy IDs (super-admin chọn từ danh sách)
        if (cancellationPolicyId) {
            formData.append('policy.cancellationPolicyId', cancellationPolicyId);
        }
        if (reschedulePolicyId) {
            formData.append('policy.reschedulePolicyId', reschedulePolicyId);
        }

        // Gọi formAction với FormData đã có ảnh, amenities, venues và policy
        formAction(formData);
    };

    return (
        <>
            <div className="bg-white rounded-xl shadow-sm">
                <form onSubmit={handleFormSubmit} className="space-y-8">
                    {/* Basic Information Section */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 pb-3 border-b border-gray-200">
                            <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
                            <h3 className="text-lg font-semibold text-gray-800">Thông tin cơ bản</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-1">
                                <label htmlFor="stt" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Số thứ tự (STT)
                                </label>
                                <input
                                    type="number"
                                    name="stt"
                                    id="stt"
                                    defaultValue={hotel?.stt || ''}
                                    placeholder="VD: 1"
                                    className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Tên khách sạn <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    required
                                    defaultValue={hotel?.name}
                                    placeholder="VD: Khách sạn Grand Saigon"
                                    className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                                />
                            </div>
                        </div>
                        <div className="mt-6">
                            <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">
                                Địa chỉ cụ thể
                                <span className="text-gray-500 text-xs ml-2 font-normal">(Có thể có hoặc không)</span>
                            </label>
                            <input
                                type="text"
                                name="address"
                                id="address"
                                defaultValue={hotel?.address}
                                placeholder="VD: 86 Đinh Bộ Lĩnh, số nhà, tên đường..."
                                className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                            />
                        </div>
                    </div>

                    {/* Location fields */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 pb-3 border-b border-gray-200">
                            <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
                            <h3 className="text-lg font-semibold text-gray-800">Thông tin địa chỉ</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="countryId" className="block text-sm font-semibold text-gray-700">
                                    Quốc gia <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="countryId"
                                    name="countryId"
                                    required
                                    value={selectedCountryId}
                                    onChange={(e) => {
                                        setSelectedCountryId(e.target.value);
                                        if (e.target.value) loadProvinces(e.target.value);
                                    }}
                                    className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
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
                                    <label htmlFor="provinceId" className="block text-sm font-semibold text-gray-700">
                                        Tỉnh/Thành phố <span className="text-red-500">*</span>
                                    </label>
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
                                    className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-50 disabled:cursor-not-allowed transition-all"
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
                                    <label htmlFor="cityId" className="block text-sm font-semibold text-gray-700">
                                        Thành phố/Quận <span className="text-red-500">*</span>
                                    </label>
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
                                        console.log('[SuperHotelForm] City changed to:', newCityId);
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
                                    className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-50 disabled:cursor-not-allowed transition-all"
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
                                    <label htmlFor="districtId" className="block text-sm font-semibold text-gray-700">
                                        Quận/Huyện <span className="text-red-500">*</span>
                                    </label>
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
                                    className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-50 disabled:cursor-not-allowed transition-all"
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
                                    <label htmlFor="wardId" className="block text-sm font-semibold text-gray-700">
                                        Phường/Xã <span className="text-red-500">*</span>
                                    </label>
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
                                    className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-50 disabled:cursor-not-allowed transition-all"
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
                                    <label htmlFor="streetId" className="block text-sm font-semibold text-gray-700">
                                        Đường <span className="text-red-500">*</span>
                                    </label>
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
                                    className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-50 disabled:cursor-not-allowed transition-all"
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
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 pb-3 border-b border-gray-200">
                            <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
                            <h3 className="text-lg font-semibold text-gray-800">Thông tin đối tác</h3>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="partnerId" className="block text-sm font-semibold text-gray-700">
                                Đối tác <span className="text-red-500">*</span>
                            </label>

                            {/* Super-admin luôn hiển thị dropdown để chọn partner */}
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
                                    className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
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
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 pb-3 border-b border-gray-200">
                            <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
                            <h3 className="text-lg font-semibold text-gray-800">Mô tả</h3>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">Mô tả khách sạn</label>
                            <textarea
                                id="description"
                                name="description"
                                rows={4}
                                defaultValue={hotel?.description || ''}
                                placeholder="Mô tả ngắn về khách sạn..."
                                className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm resize-y transition-all"
                            />
                        </div>
                        {/* Hidden input cho commission_rate - mặc định 15% */}
                        <input type="hidden" name="commissionRate" value="15" />
                    </div>

                    {/* Images */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 pb-3 border-b border-gray-200">
                            <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
                            <h3 className="text-lg font-semibold text-gray-800">Ảnh khách sạn</h3>
                        </div>
                        <div className="space-y-4">
                            <label htmlFor="images" className="block text-sm font-medium text-gray-700">
                                Ảnh khách sạn <span className="text-gray-500">(có thể chọn nhiều ảnh)</span>
                            </label>

                            {/* Hiển thị preview các ảnh đã chọn */}
                            {imagePreviews.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                    {imagePreviews.map((item, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={item.preview}
                                                alt={`Preview ${index + 1}`}
                                                className="h-32 w-full rounded-md object-cover border border-gray-300"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newPreviews = imagePreviews.filter((_, i) => i !== index);
                                                    setImagePreviews(newPreviews);
                                                }}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                                title="Xóa ảnh"
                                            >
                                                <XMarkIcon className="h-4 w-4" />
                                            </button>
                                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
                                                {item.file.name}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Hiển thị ảnh cũ nếu đang sửa */}
                            {isEditing && hotel?.imageUrl && imagePreviews.length === 0 && (
                                <div className="mb-4">
                                    <p className="text-sm text-gray-600 mb-2">Ảnh hiện tại:</p>
                                    <img
                                        src={hotel.imageUrl}
                                        alt="Ảnh hiện tại"
                                        className="h-32 w-48 rounded-md object-cover border border-gray-300"
                                    />
                                </div>
                            )}

                            <div className="flex-1">
                                <label htmlFor="images" className="cursor-pointer inline-flex items-center px-5 py-3 border-2 border-dashed border-gray-300 rounded-lg shadow-sm text-sm font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 hover:border-blue-400 transition-all">
                                    <PlusIcon className="h-5 w-5 mr-2 text-blue-600" />
                                    <span>Thêm ảnh</span>
                                    <input
                                        id="images"
                                        name="images"
                                        type="file"
                                        className="sr-only"
                                        accept="image/*"
                                        multiple
                                        onChange={(e) => {
                                            const files = Array.from(e.target.files || []);
                                            if (files.length === 0) return;

                                            const invalidFiles = files.filter(file => file.size > 10 * 1024 * 1024);
                                            if (invalidFiles.length > 0) {
                                                alert(`Các file sau vượt quá 10MB: ${invalidFiles.map(f => f.name).join(', ')}`);
                                                e.target.value = '';
                                                return;
                                            }

                                            const totalFiles = files.length;
                                            const results: Array<{ file: File; preview: string }> = [];
                                            let completedCount = 0;

                                            const checkComplete = () => {
                                                completedCount++;
                                                if (completedCount === totalFiles) {
                                                    if (results.length > 0) {
                                                        setImagePreviews(prev => [...prev, ...results]);
                                                    }
                                                    e.target.value = '';
                                                }
                                            };

                                            files.forEach((file) => {
                                                const reader = new FileReader();

                                                reader.onloadend = () => {
                                                    try {
                                                        if (reader.result && typeof reader.result === 'string') {
                                                            results.push({
                                                                file,
                                                                preview: reader.result
                                                            });
                                                        }
                                                    } catch (err) {
                                                        // Ignore errors when processing result
                                                    } finally {
                                                        checkComplete();
                                                    }
                                                };

                                                reader.onerror = () => {
                                                    checkComplete();
                                                };

                                                try {
                                                    reader.readAsDataURL(file);
                                                } catch (error) {
                                                    checkComplete();
                                                }
                                            });
                                        }}
                                    />
                                </label>
                                <p className="text-xs text-gray-500 mt-1.5">PNG, JPG, GIF tối đa 10MB mỗi ảnh. Có thể chọn nhiều ảnh cùng lúc.</p>
                                {imagePreviews.length > 0 && (
                                    <p className="text-xs text-green-600 mt-2 font-medium">
                                        ✓ Đã chọn {imagePreviews.length} ảnh
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tiện ích (Amenities) */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 pb-3 border-b border-gray-200">
                            <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
                            <h3 className="text-lg font-semibold text-gray-800">Tiện ích</h3>
                        </div>
                        <div className="space-y-4">

                            {/* Tiện ích chính */}
                            {(() => {
                                const freeAmenities = amenities.filter(a => a.free);
                                const selectedOtherAmenities = amenities.filter(a => !a.free && selectedAmenityIds.has(a.id));
                                const displayLimit = 10;
                                const amenitiesToShow = showAllMainAmenities
                                    ? [...freeAmenities, ...selectedOtherAmenities]
                                    : [...freeAmenities, ...selectedOtherAmenities].slice(0, displayLimit);
                                const hasMore = (freeAmenities.length + selectedOtherAmenities.length) > displayLimit;

                                if (freeAmenities.length > 0 || selectedOtherAmenities.length > 0) {
                                    return (
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                            <h4 className="text-sm font-semibold text-green-800 mb-3 flex items-center gap-2">
                                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Tiện ích chính
                                            </h4>
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                                                {amenitiesToShow
                                                    .filter(amenity => amenity?.id && amenity?.name)
                                                    .map((amenity) => (
                                                        <div
                                                            key={amenity.id}
                                                            className="flex items-center gap-2 p-2 bg-white rounded-md border border-green-300 shadow-sm"
                                                        >
                                                            <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                            <span className="text-sm text-gray-700 font-medium">{amenity.name || 'Không có tên'}</span>
                                                        </div>
                                                    ))}
                                            </div>
                                            {hasMore && (
                                                <button
                                                    type="button"
                                                    onClick={() => setShowAllMainAmenities(!showAllMainAmenities)}
                                                    className="mt-3 text-sm font-medium text-green-700 hover:text-green-800 flex items-center gap-1 transition-colors"
                                                >
                                                    {showAllMainAmenities ? (
                                                        <>
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                            </svg>
                                                            Thu gọn
                                                        </>
                                                    ) : (
                                                        <>
                                                            Xem thêm ({freeAmenities.length + selectedOtherAmenities.length - displayLimit} tiện ích)
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                            <p className="text-xs text-green-700 mt-3">
                                                {freeAmenities.length > 0 && "Các tiện ích miễn phí phổ biến đã được tự động gán vào khách sạn"}
                                                {selectedOtherAmenities.length > 0 && freeAmenities.length > 0 && " • "}
                                                {selectedOtherAmenities.length > 0 && `${selectedOtherAmenities.length} tiện ích khác đã được thêm`}
                                            </p>
                                        </div>
                                    );
                                }
                                return null;
                            })()}

                            {/* Thêm tiện ích khác (nếu có) */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-gray-700">Thêm tiện ích khác (nếu có)</h4>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={searchAmenityQuery}
                                        onChange={(e) => setSearchAmenityQuery(e.target.value)}
                                        placeholder="Tìm kiếm và chọn thêm tiện ích..."
                                        className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                                    />
                                    {searchAmenityQuery && (
                                        <button
                                            type="button"
                                            onClick={() => setSearchAmenityQuery('')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            <XMarkIcon className="h-5 w-5" />
                                        </button>
                                    )}
                                </div>

                                {/* Danh sách amenities để chọn (lọc theo search query, loại trừ free amenities) */}
                                {(() => {
                                    const otherAmenities = amenities.filter(a => !a.free);
                                    const filteredAmenities = searchAmenityQuery.trim()
                                        ? otherAmenities.filter(a =>
                                            a.name.toLowerCase().includes(searchAmenityQuery.toLowerCase())
                                        )
                                        : otherAmenities;

                                    if (filteredAmenities.length > 0) {
                                        return (
                                            <div className="border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                                                <div className="space-y-2">
                                                    {filteredAmenities
                                                        .filter(amenity => amenity?.id && amenity?.name)
                                                        .map((amenity) => (
                                                            <label
                                                                key={amenity.id}
                                                                className="flex items-center space-x-3 cursor-pointer p-2 rounded-md hover:bg-gray-50 border border-gray-200"
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedAmenityIds.has(amenity.id)}
                                                                    onChange={(e) => {
                                                                        const newSet = new Set(selectedAmenityIds);
                                                                        if (e.target.checked) {
                                                                            newSet.add(amenity.id);
                                                                        } else {
                                                                            newSet.delete(amenity.id);
                                                                        }
                                                                        setSelectedAmenityIds(newSet);
                                                                    }}
                                                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                                />
                                                                <span className="text-sm text-gray-700 flex-1">
                                                                    {amenity.name || 'Không có tên'}
                                                                </span>
                                                                {amenity?.category?.name && (
                                                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                                        {amenity.category.name}
                                                                    </span>
                                                                )}
                                                            </label>
                                                        ))}
                                                </div>
                                            </div>
                                        );
                                    } else if (searchAmenityQuery.trim()) {
                                        return (
                                            <div className="border border-gray-200 rounded-lg p-4 text-center text-sm text-gray-500">
                                                Không tìm thấy tiện ích nào phù hợp với "{searchAmenityQuery}"
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}
                            </div>
                        </div>
                    </div>

                    {/* Địa điểm lân cận (Entertainment Venues) */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 pb-3 border-b border-gray-200">
                            <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
                            <h3 className="text-lg font-semibold text-gray-800">Địa điểm lân cận</h3>
                        </div>
                        <div className="space-y-4">
                            {!selectedCityId ? (
                                <p className="text-sm text-gray-500">Vui lòng chọn thành phố để xem danh sách địa điểm lân cận</p>
                            ) : (
                                <>
                                    {/* Danh sách venues có sẵn */}
                                    {entertainmentVenuesByCategory.length > 0 && (
                                        <div className="space-y-4">
                                            {entertainmentVenuesByCategory
                                                .filter(categoryGroup => categoryGroup?.id && categoryGroup?.name)
                                                .map((categoryGroup) => (
                                                    <div key={categoryGroup.id || 'unknown'} className="border border-gray-200 rounded-lg p-4">
                                                        <h4 className="text-sm font-medium text-gray-700 mb-3">{categoryGroup.name || 'Không có tên'}</h4>
                                                        <div className="space-y-2">
                                                            {(categoryGroup.entertainmentVenues || []).map((venue) => {
                                                                if (!venue?.id || !venue?.name) return null;
                                                                const isSelected = selectedVenues.some(v => v.venueId === venue.id);
                                                                const selectedVenue = selectedVenues.find(v => v.venueId === venue.id);
                                                                return (
                                                                    <div key={venue.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 border border-gray-200">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={isSelected}
                                                                            onChange={(e) => {
                                                                                if (e.target.checked) {
                                                                                    // Nếu venue đã có trong selectedVenues, không thêm lại
                                                                                    const existingVenue = selectedVenues.find(v => v.venueId === venue.id);
                                                                                    if (existingVenue) {
                                                                                        // Đã có, không thêm lại
                                                                                        return;
                                                                                    }

                                                                                    // Chưa có, kiểm tra xem có distance từ hotel data không
                                                                                    let distanceToUse = 1; // Mặc định 1 km

                                                                                    // Nếu có distance từ hotel data (đã lưu trước), dùng nó
                                                                                    const savedDistanceInMeters = hotelVenueDistances.get(venue.id);
                                                                                    if (savedDistanceInMeters != null) {
                                                                                        // Convert meters → km
                                                                                        distanceToUse = savedDistanceInMeters / 1000;
                                                                                    } else if (venue.distance != null) {
                                                                                        // Nếu venue từ API có distance (meters), convert sang km
                                                                                        distanceToUse = venue.distance / 1000;
                                                                                    }

                                                                                    // Thêm venue với distance đã lấy được
                                                                                    setSelectedVenues([...selectedVenues, { venueId: venue.id, distance: distanceToUse }]);
                                                                                } else {
                                                                                    setSelectedVenues(selectedVenues.filter(v => v.venueId !== venue.id));
                                                                                }
                                                                            }}
                                                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                                        />
                                                                        <span className="flex-1 text-sm text-gray-700">{venue.name || 'Không có tên'}</span>
                                                                        {isSelected && (
                                                                            <input
                                                                                type="number"
                                                                                min="0.1"
                                                                                step="0.1"
                                                                                value={selectedVenue?.distance || 1}
                                                                                onChange={(e) => {
                                                                                    const distance = parseFloat(e.target.value);
                                                                                    // Chỉ update nếu distance hợp lệ (> 0)
                                                                                    if (!isNaN(distance) && distance > 0) {
                                                                                        setSelectedVenues(selectedVenues.map(v =>
                                                                                            v.venueId === venue.id ? { ...v, distance } : v
                                                                                        ));
                                                                                    }
                                                                                }}
                                                                                className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                                placeholder="Km"
                                                                            />
                                                                        )}
                                                                        {isSelected && (
                                                                            <span className="text-xs text-gray-500">km</span>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    )}

                                    {/* Form thêm venue mới */}
                                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                        <h4 className="text-sm font-medium text-gray-700 mb-3">Thêm địa điểm mới</h4>
                                        <p className="text-xs text-gray-500 mb-3">
                                            Địa điểm mới sẽ được tự động thêm vào danh mục "Địa Điểm Lân Cận"
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <input
                                                    type="text"
                                                    value={newVenueName}
                                                    onChange={(e) => setNewVenueName(e.target.value)}
                                                    placeholder="Tên địa điểm"
                                                    className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                                                />
                                            </div>
                                            <div>
                                                <input
                                                    type="number"
                                                    min="0.1"
                                                    step="0.1"
                                                    value={newVenueDistance > 0 ? newVenueDistance : ''}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        const numValue = value ? parseFloat(value) : 0;
                                                        setNewVenueDistance(numValue);
                                                        console.log('[SuperHotelForm] Distance changed:', numValue);
                                                    }}
                                                    placeholder="Khoảng cách (km)"
                                                    className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                // Tự động tìm category "Địa Điểm Lân Cận"
                                                let categoryIdToUse = newVenueCategoryId;

                                                // Nếu chưa có, tìm từ danh sách đã load hoặc dùng ID mặc định
                                                if (!categoryIdToUse) {
                                                    if (entertainmentVenuesByCategory.length > 0) {
                                                        // Tìm category có tên chứa "lân cận" hoặc "địa điểm lân cận"
                                                        const nearbyCategory = entertainmentVenuesByCategory.find(cat =>
                                                            cat?.name && (
                                                                cat.name.toLowerCase().includes('lân cận') ||
                                                                cat.name.toLowerCase().includes('địa điểm lân cận') ||
                                                                cat.name.toLowerCase().includes('nearby')
                                                            )
                                                        );
                                                        categoryIdToUse = nearbyCategory?.id || entertainmentVenuesByCategory[0].id;
                                                    }
                                                }

                                                // Luôn có fallback ID mặc định nếu vẫn chưa có
                                                if (!categoryIdToUse) {
                                                    categoryIdToUse = 'a4d8d350-a850-11f0-a7b7-0a6aab4924ab';
                                                }

                                                const isValid = newVenueName.trim() &&
                                                    newVenueDistance > 0 &&
                                                    categoryIdToUse &&
                                                    selectedCityId;

                                                if (isValid) {
                                                    // Thêm vào newVenues để backend tạo venue mới
                                                    setNewVenues([...newVenues, {
                                                        name: newVenueName.trim(),
                                                        distance: newVenueDistance,
                                                        categoryId: categoryIdToUse
                                                    }]);
                                                    // Reset form
                                                    setNewVenueName('');
                                                    setNewVenueDistance(0);
                                                } else {
                                                    console.log('[SuperHotelForm] Cannot add venue:', {
                                                        hasName: !!newVenueName.trim(),
                                                        hasDistance: newVenueDistance > 0,
                                                        hasCity: !!selectedCityId,
                                                        categoryId: categoryIdToUse
                                                    });
                                                }
                                            }}
                                            disabled={(() => {
                                                const isDisabled = !newVenueName.trim() ||
                                                    !newVenueDistance ||
                                                    newVenueDistance <= 0 ||
                                                    !selectedCityId;

                                                // Debug log khi button bị disabled
                                                if (isDisabled && newVenueName.trim() && newVenueDistance > 0) {
                                                    console.log('[SuperHotelForm] Button disabled - missing:', {
                                                        hasName: !!newVenueName.trim(),
                                                        hasDistance: newVenueDistance > 0,
                                                        hasCity: !!selectedCityId,
                                                        cityId: selectedCityId
                                                    });
                                                }

                                                return isDisabled;
                                            })()}
                                            className="mt-3 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-sm"
                                        >
                                            <PlusIcon className="h-4 w-4 inline mr-1" />
                                            Thêm địa điểm
                                        </button>
                                    </div>

                                    {/* Danh sách venues đã chọn */}
                                    {(selectedVenues.length > 0 || newVenues.length > 0) && (
                                        <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="text-sm font-medium text-gray-700">
                                                    Địa điểm đã chọn ({selectedVenues.length + newVenues.length})
                                                </h4>
                                                {isEditing && (
                                                    <button
                                                        type="button"
                                                        onClick={handleUpdateVenuesOnly}
                                                        className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all shadow-sm"
                                                    >
                                                        🔄 Cập nhật địa điểm
                                                    </button>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                {/* Venues có sẵn */}
                                                {selectedVenues.map((venue, index) => {
                                                    const venueInfo = entertainmentVenuesByCategory
                                                        .flatMap(cat => cat?.entertainmentVenues || [])
                                                        .find(v => v?.id === venue.venueId);
                                                    return (
                                                        <div key={`existing-${index}`} className="flex items-center justify-between p-2 bg-white rounded-md border border-gray-200">
                                                            <span className="text-sm text-gray-700">
                                                                {venueInfo?.name || 'Không xác định'}
                                                            </span>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm text-gray-600">{venue.distance} km</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setSelectedVenues(selectedVenues.filter((_, i) => i !== index));
                                                                    }}
                                                                    className="text-red-600 hover:text-red-800"
                                                                >
                                                                    <XMarkIcon className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                                {/* Venues mới */}
                                                {newVenues.map((venue, index) => (
                                                    <div key={`new-${index}`} className="flex items-center justify-between p-2 bg-white rounded-md border border-gray-200">
                                                        <span className="text-sm text-gray-700">
                                                            {venue.name} <span className="text-xs text-blue-600">(Mới)</span>
                                                        </span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm text-gray-600">{venue.distance} km</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setNewVenues(newVenues.filter((_, i) => i !== index));
                                                                }}
                                                                className="text-red-600 hover:text-red-800"
                                                            >
                                                                <XMarkIcon className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Chính sách (Policy) */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 pb-3 border-b border-gray-200">
                            <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
                            <h3 className="text-lg font-semibold text-gray-800">Chính sách</h3>
                        </div>
                        <div className="space-y-6">
                            {/* Check-in/Check-out Time */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="checkInTime" className="block text-sm font-medium text-gray-700 mb-2">
                                        Giờ nhận phòng <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="time"
                                        id="checkInTime"
                                        value={checkInTime}
                                        onChange={(e) => setCheckInTime(e.target.value)}
                                        required
                                        className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="checkOutTime" className="block text-sm font-medium text-gray-700 mb-2">
                                        Giờ trả phòng <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="time"
                                        id="checkOutTime"
                                        value={checkOutTime}
                                        onChange={(e) => setCheckOutTime(e.target.value)}
                                        required
                                        className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                                    />
                                </div>
                            </div>

                            {/* Allows Pay at Hotel */}
                            <div>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={allowsPayAtHotel}
                                        onChange={(e) => setAllowsPayAtHotel(e.target.checked)}
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-5 h-5"
                                    />
                                    <span className="text-sm font-medium text-gray-700">
                                        Cho phép thanh toán tại khách sạn
                                    </span>
                                </label>
                                <p className="text-xs text-gray-500 mt-1 ml-8">
                                    Khách hàng có thể thanh toán trực tiếp tại khách sạn khi check-in
                                </p>
                            </div>

                            {/* Required Identification Documents */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Giấy tờ tùy thân yêu cầu
                                </label>
                                {identificationDocuments.length > 0 ? (
                                    <div className="border border-gray-200 rounded-lg p-4 max-h-48 overflow-y-auto">
                                        <div className="space-y-2">
                                            {identificationDocuments.map((doc) => (
                                                <label
                                                    key={doc.id}
                                                    className="flex items-center space-x-3 cursor-pointer p-2 rounded-md hover:bg-gray-50 border border-gray-200"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedDocumentIds.has(doc.id)}
                                                        onChange={(e) => {
                                                            const newSet = new Set(selectedDocumentIds);
                                                            if (e.target.checked) {
                                                                newSet.add(doc.id);
                                                            } else {
                                                                newSet.delete(doc.id);
                                                            }
                                                            setSelectedDocumentIds(newSet);
                                                        }}
                                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                    />
                                                    <span className="text-sm text-gray-700 flex-1">{doc.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">Đang tải danh sách giấy tờ...</p>
                                )}
                            </div>

                            {/* Cancellation Policy - Super-admin chọn từ danh sách */}
                            <div>
                                <label htmlFor="cancellationPolicy" className="block text-sm font-medium text-gray-700 mb-2">
                                    Chính sách hủy phòng
                                </label>
                                {cancellationPolicies.length > 0 ? (
                                    <select
                                        id="cancellationPolicy"
                                        value={cancellationPolicyId}
                                        onChange={(e) => setCancellationPolicyId(e.target.value)}
                                        className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                                    >
                                        <option value="">-- Chọn chính sách hủy phòng --</option>
                                        {cancellationPolicies.map((policy) => (
                                            <option key={policy.id} value={policy.id}>
                                                {policy.name} {policy.description && `- ${policy.description}`}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <p className="text-sm text-gray-500">Đang tải danh sách chính sách hủy phòng...</p>
                                )}
                            </div>

                            {/* Reschedule Policy - Super-admin chọn từ danh sách */}
                            <div>
                                <label htmlFor="reschedulePolicy" className="block text-sm font-medium text-gray-700 mb-2">
                                    Chính sách đổi lịch
                                </label>
                                {reschedulePolicies.length > 0 ? (
                                    <select
                                        id="reschedulePolicy"
                                        value={reschedulePolicyId}
                                        onChange={(e) => setReschedulePolicyId(e.target.value)}
                                        className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                                    >
                                        <option value="">-- Chọn chính sách đổi lịch --</option>
                                        {reschedulePolicies.map((policy) => (
                                            <option key={policy.id} value={policy.id}>
                                                {policy.name} {policy.description && `- ${policy.description}`}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <p className="text-sm text-gray-500">Đang tải danh sách chính sách đổi lịch...</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Super-admin luôn có quyền quản lý status (cả khi create và edit) */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 pb-3 border-b border-gray-200">
                            <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
                            <h3 className="text-lg font-semibold text-gray-800">Trạng thái</h3>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                                Trạng thái <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="status"
                                name="status"
                                defaultValue={hotel?.status?.toLowerCase() || 'active'}
                                className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                            >
                                <option value="active">Đang hoạt động</option>
                                <option value="pending">Chờ duyệt</option>
                                <option value="inactive">Ngừng hoạt động</option>
                                <option value="maintenance">Bảo trì</option>
                                <option value="closed">Đóng cửa</option>
                                <option value="hidden">Đã ẩn</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                Super Admin có quyền quản lý trạng thái khách sạn
                            </p>
                        </div>
                    </div>

                    {/* Các nút hành động */}
                    <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                        {!isEditing && (
                            <button
                                type="button"
                                onClick={() => {
                                    // Check if form is inside a modal by checking for modal wrapper
                                    const formWrapper = document.getElementById('super-hotel-form-wrapper');
                                    if (formWrapper) {
                                        // If inside modal, trigger close - handled by parent
                                        const closeEvent = new CustomEvent('closeSuperHotelFormModal');
                                        window.dispatchEvent(closeEvent);
                                    }
                                }}
                                className="py-2.5 px-6 border-2 border-gray-300 rounded-lg shadow-sm text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all"
                            >
                                Hủy
                            </button>
                        )}
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
                                        className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
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
                                            placeholder={`VD: ${createModalType === 'province' ? 'HN' :
                                                createModalType === 'city' ? 'HCM' :
                                                    createModalType === 'district' ? 'Q1' :
                                                        createModalType === 'ward' ? 'P1' :
                                                            'D1'
                                                }`}
                                            maxLength={3}
                                            className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
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
                                            console.warn('[SuperHotelForm] Pre-check warning:', checkError);
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
                                            console.error('[SuperHotelForm] Error creating location:', error);
                                            console.error('[SuperHotelForm] Error details:', {
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
                                            className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
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
                                            className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
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
                                            className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
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
                                            className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
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
                                            console.log('[SuperHotelForm] Partner created:', createdPartner);

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
                                            console.error('[SuperHotelForm] Error creating partner:', error);
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
        </>
    );
}