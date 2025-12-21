"use client";

import { useFormStatus } from "react-dom";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
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
import { getAmenities, getAmenityCategories, type Amenity, type AmenityCategory } from "@/lib/AdminAPI/amenityService";
import { getEntertainmentVenuesByCity, type EntertainmentVenueByCategory, type EntertainmentVenue } from "@/lib/AdminAPI/entertainmentVenueService";
import { getAllCancellationPolicies, getAllReschedulePolicies, getAllIdentificationDocuments } from "@/lib/AdminAPI/policyService";
import AmenitiesSection from "./AmenitiesSection";
import PoliciesSection from "./PoliciesSection";
import NearbyLocationsSection from "./NearbyLocationsSection";

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

interface HotelFormProps {
    hotel?: Hotel | null;
    formAction: (formData: FormData) => void;
    isSuperAdmin?: boolean;
}

export default function HotelForm({ hotel, formAction, isSuperAdmin = false }: HotelFormProps) {
    const isEditing = !!hotel;
    const { effectiveUser } = useAuth();
    const isAdmin = effectiveUser?.role.name.toLowerCase() === 'admin';
    const isPartner = effectiveUser?.role.name.toLowerCase() === 'partner';
    const currentPartnerId = effectiveUser?.id || '';

    const [countries, setCountries] = useState<LocationOption[]>([]);
    const [provinces, setProvinces] = useState<LocationOption[]>([]);
    const [cities, setCities] = useState<LocationOption[]>([]);
    const [districts, setDistricts] = useState<LocationOption[]>([]);
    const [wards, setWards] = useState<LocationOption[]>([]);
    const [streets, setStreets] = useState<LocationOption[]>([]);

    const [selectedCountryId, setSelectedCountryId] = useState<string>('');
    const [selectedProvinceId, setSelectedProvinceId] = useState<string>('');
    const [selectedCityId, setSelectedCityId] = useState<string>('');
    const [selectedDistrictId, setSelectedDistrictId] = useState<string>('');
    const [selectedWardId, setSelectedWardId] = useState<string>('');
    const [selectedStreetId, setSelectedStreetId] = useState<string>('');

    const [partners, setPartners] = useState<Partner[]>([]);
    const [selectedPartnerId, setSelectedPartnerId] = useState<string>('');
    const [isLoadingPartners, setIsLoadingPartners] = useState(false);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createModalType, setCreateModalType] = useState<'street' | 'ward' | 'district' | 'city' | 'province'>('street');
    const [newLocationName, setNewLocationName] = useState('');
    const [newLocationCode, setNewLocationCode] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);

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

    // State cho amenities (chỉ dùng khi edit)
    const [amenities, setAmenities] = useState<Amenity[]>([]);
    const [selectedAmenityIds, setSelectedAmenityIds] = useState<Set<string>>(new Set());

    // State cho policy (chỉ dùng khi edit)
    const [checkInTime, setCheckInTime] = useState<string>('14:00');
    const [checkOutTime, setCheckOutTime] = useState<string>('12:00');
    const [allowsPayAtHotel, setAllowsPayAtHotel] = useState<boolean>(false);
    const [selectedDocumentIds, setSelectedDocumentIds] = useState<Set<string>>(new Set());
    // State cho policy (chọn từ danh sách)
    const [cancellationPolicyId, setCancellationPolicyId] = useState<string>('');
    const [reschedulePolicyId, setReschedulePolicyId] = useState<string>('');
    const [cancellationPolicies, setCancellationPolicies] = useState<Array<{ id: string; name: string; description?: string }>>([]);
    const [reschedulePolicies, setReschedulePolicies] = useState<Array<{ id: string; name: string; description?: string }>>([]);
    const [identificationDocuments, setIdentificationDocuments] = useState<Array<{ id: string; name: string }>>([]);

    // State cho entertainment venues (chỉ dùng khi edit)
    const [entertainmentVenuesByCategory, setEntertainmentVenuesByCategory] = useState<EntertainmentVenueByCategory[]>([]);
    const [selectedVenues, setSelectedVenues] = useState<Array<{ venueId: string; distance: number }>>([]);
    const [newVenues, setNewVenues] = useState<Array<{ name: string; distance: number; categoryId: string }>>([]);
    // State để lưu danh sách venue IDs cần xóa (khi user bấm nút X)
    const [venuesToRemove, setVenuesToRemove] = useState<Set<string>>(new Set());
    // State để lưu dữ liệu venues từ NearbyLocationsSection
    const [venuesDataForSubmit, setVenuesDataForSubmit] = useState<{
        venuesToUpdate: Array<{ venueId: string; distance: number }>;
        venuesToAdd: Array<{ venueId: string; distance: number }>;
        venuesToRemove: string[];
        newVenues: Array<{ name: string; distance: number; categoryId: string }>;
    } | null>(null);


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

            // Chỉ load amenities, venues và policies khi đang EDIT (partner update hotel)
            if (isEditing) {
                // Load amenities
                try {
                    const amenitiesData = await getAmenities();
                    setAmenities(amenitiesData);

                    // Tạo Set các amenity IDs hợp lệ từ danh sách amenities hiện tại
                    const validAmenityIdsSet = new Set(amenitiesData.map(a => a.id));

                    // Nếu hotel đã có amenities, load chúng (chỉ lấy các IDs hợp lệ và tồn tại)
                    const hotelData = hotel as any;
                    if (hotelData?.amenities && Array.isArray(hotelData.amenities)) {
                        const existingAmenityIds = new Set<string>(
                            hotelData.amenities
                                .map((a: any) => a.id || a.amenityId)
                                .filter((id: any) => id && typeof id === 'string' && id.trim() !== '' && validAmenityIdsSet.has(id))
                        );
                        setSelectedAmenityIds(existingAmenityIds);

                        // Log warning nếu có amenity IDs không hợp lệ
                        const allHotelAmenityIds = hotelData.amenities.map((a: any) => a.id || a.amenityId).filter(Boolean);
                        const invalidIds = allHotelAmenityIds.filter((id: string) => !validAmenityIdsSet.has(id));
                        if (invalidIds.length > 0) {
                            // Một số amenity IDs từ hotel không tồn tại trong danh sách amenities hiện tại
                        }
                    } else {
                        // Nếu không có, tự động chọn các amenities miễn phí
                        const freeAmenityIds = new Set(amenitiesData.filter(a => a.free).map(a => a.id));
                        setSelectedAmenityIds(freeAmenityIds);
                    }
                } catch (error) {
                    // Error loading amenities
                }

                // Load cancellation policies (có thể không tồn tại API)
                try {
                    const cancellationPoliciesData = await getAllCancellationPolicies();
                    setCancellationPolicies(cancellationPoliciesData);
                } catch (error: any) {
                    setCancellationPolicies([]);
                }

                // Load reschedule policies (có thể không tồn tại API)
                try {
                    const reschedulePoliciesData = await getAllReschedulePolicies();
                    setReschedulePolicies(reschedulePoliciesData);
                } catch (error: any) {
                    setReschedulePolicies([]);
                }

                // Load identification documents (có thể không tồn tại API)
                try {
                    const identificationDocumentsData = await getAllIdentificationDocuments();
                    setIdentificationDocuments(identificationDocumentsData);
                } catch (error: any) {
                    setIdentificationDocuments([]);
                }
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
                    }

                    const partnersData = await getPartners();
                    setPartners(partnersData);
                } catch (error: any) {
                } finally {
                    setIsLoadingPartners(false);
                }
            } else if (userRole === 'partner' && currentPartnerId) {
                setSelectedPartnerId(currentPartnerId);
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

        if (!cityId || cityId.trim() === '') {
            setDistricts([]);
            return;
        }

        const data = await getDistricts(cityId.trim(), selectedProvinceId);
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

        const data = await getWards(districtId, cityId || selectedCityId, selectedProvinceId);
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

        const data = await getStreets(wardId, districtId || selectedDistrictId, cityId || selectedCityId, selectedProvinceId);
        setStreets(data);
    };

    // Lưu venue distance từ hotel data để dùng khi tích checkbox
    const [hotelVenueDistances, setHotelVenueDistances] = useState<Map<string, number>>(new Map());

    // Reset state khi hotel thay đổi (quan trọng để tránh hiển thị venues của hotel cũ)
    useEffect(() => {
        if (!isEditing || !hotel?.id) {
            // Reset state khi không edit hoặc không có hotel
            setSelectedVenues([]);
            setNewVenues([]);
            setHotelVenueDistances(new Map());
            setEntertainmentVenuesByCategory([]);
            setVenuesToRemove(new Set());
            setVenuesDataForSubmit(null);
            return;
        }
    }, [hotel?.id, isEditing]);

    // Load entertainment venues khi city được chọn (chỉ khi edit)
    useEffect(() => {
        if (!isEditing || !hotel?.id) return; // Chỉ load khi edit và có hotel ID

        const loadVenues = async () => {
            // Reset state trước khi load để tránh hiển thị venues của hotel cũ
            setSelectedVenues([]);
            setNewVenues([]);
            setHotelVenueDistances(new Map());

            if (selectedCityId) {
                try {
                    const venuesData = await getEntertainmentVenuesByCity(selectedCityId);
                    setEntertainmentVenuesByCategory(venuesData || []);

                    // Nếu hotel đã có venues, load chúng và lưu distance map
                    // Backend trả về distance theo meters, form hiển thị theo km → cần convert meters → km (chia 1000)
                    const hotelData = hotel as any;
                    const distanceMap = new Map<string, number>();

                    if (hotelData?.entertainmentVenues && Array.isArray(hotelData.entertainmentVenues)) {
                        // Flatten venues từ các categories
                        const allVenues: Array<{ id?: string; entertainmentVenueId?: string; distance: number }> = [];
                        hotelData.entertainmentVenues.forEach((categoryGroup: any) => {
                            if (categoryGroup?.entertainmentVenues && Array.isArray(categoryGroup.entertainmentVenues)) {
                                categoryGroup.entertainmentVenues.forEach((venue: any) => {
                                    if (venue?.id && venue?.distance != null) {
                                        const venueId = String(venue.id); // Đảm bảo là string
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
                            venueId: String(v.id || v.entertainmentVenueId), // Đảm bảo là string
                            // Convert meters → km (chia 1000) để hiển thị trong form
                            distance: v.distance ? (v.distance / 1000) : 1
                        })).filter((v: any) => v.venueId);
                        setSelectedVenues(existingVenues);
                    } else {
                        // Không có venues, reset map
                        setHotelVenueDistances(new Map());
                        setSelectedVenues([]);
                    }

                } catch (error) {
                    setEntertainmentVenuesByCategory([]);
                    setSelectedVenues([]);
                    setHotelVenueDistances(new Map());
                }
            } else {
                setEntertainmentVenuesByCategory([]);
                setSelectedVenues([]);
                setHotelVenueDistances(new Map());
            }
        };
        loadVenues();
    }, [selectedCityId, isEditing, hotel?.id, hotel]);

    // Load policy data từ hotel nếu đang edit
    useEffect(() => {
        if (!isEditing || !hotel) return;

        if ('policy' in hotel && hotel.policy) {
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
                // Chỉ load các document IDs hợp lệ và tồn tại trong danh sách identification documents hiện tại
                // Đảm bảo identificationDocuments đã được load trước
                if (identificationDocuments.length > 0) {
                    const validDocumentIdsSet = new Set(identificationDocuments.map(d => d.id));
                    const docIds = new Set<string>(
                        policy.requiredIdentificationDocuments
                            .map((doc: { id: string }) => doc.id)
                            .filter((id: any) => id && typeof id === 'string' && id.trim() !== '' && validDocumentIdsSet.has(id))
                    );
                    setSelectedDocumentIds(docIds);

                    // Log warning nếu có document IDs không hợp lệ
                    const allPolicyDocumentIds = policy.requiredIdentificationDocuments.map((doc: { id: string }) => doc.id).filter(Boolean);
                    const invalidIds = allPolicyDocumentIds.filter((id: string) => !validDocumentIdsSet.has(id));
                    if (invalidIds.length > 0) {
                        // Một số identification document IDs từ hotel policy không tồn tại trong danh sách hiện tại
                    }
                } else {
                    // Nếu chưa load được identification documents, chỉ lấy IDs và sẽ validate sau
                    const docIds = new Set<string>(
                        policy.requiredIdentificationDocuments
                            .map((doc: { id: string }) => doc.id)
                            .filter((id: any) => id && typeof id === 'string' && id.trim() !== '')
                    );
                    setSelectedDocumentIds(docIds);
                }
            }
            if (policy.cancellationPolicy?.id) {
                setCancellationPolicyId(policy.cancellationPolicy.id);
            }
            if (policy.reschedulePolicy?.id) {
                setReschedulePolicyId(policy.reschedulePolicy.id);
            }
        }
    }, [hotel, isEditing, identificationDocuments]);



    // Handler để append nhiều ảnh vào FormData trước khi submit
    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);

        // Append tất cả các ảnh đã chọn vào FormData
        imagePreviews.forEach((item) => {
            formData.append('images', item.file);
        });

        // Chỉ append amenities, venues và policy khi đang EDIT
        if (isEditing) {
            // Append amenities (amenityIdsToAdd) - chỉ append các amenity IDs hợp lệ
            const validAmenityIds = Array.from(selectedAmenityIds).filter(
                (amenityId) => amenityId && typeof amenityId === 'string' && amenityId.trim() !== ''
            );

            // Kiểm tra xem các amenity IDs có tồn tại trong danh sách amenities hiện tại không
            const existingAmenityIds = new Set(amenities.map(a => a.id));
            const validAndExistingAmenityIds = validAmenityIds.filter(id => existingAmenityIds.has(id));

            if (validAmenityIds.length !== validAndExistingAmenityIds.length) {
                const invalidIds = validAmenityIds.filter(id => !existingAmenityIds.has(id));
                // Một số amenity IDs không tồn tại trong danh sách amenities hiện tại
            }

            validAndExistingAmenityIds.forEach((amenityId) => {
                formData.append('amenityIdsToAdd[]', amenityId);
            });

            // Xử lý venues từ NearbyLocationsSection (logic đã được di chuyển vào component con)
            if (venuesDataForSubmit) {
                // XỬ LÝ VENUES CẦN XÓA
                if (venuesDataForSubmit.venuesToRemove.length > 0) {
                    venuesDataForSubmit.venuesToRemove.forEach((venueId) => {
                        const venueIdStr = String(venueId);
                        formData.append('entertainmentVenueIdsToRemove', venueIdStr);
                    });
                }

                // Backend mong đợi format: entertainmentVenuesWithDistanceToUpdate[0].entertainmentVenueId, entertainmentVenuesWithDistanceToUpdate[0].distance, ...
                if (venuesDataForSubmit.venuesToUpdate.length > 0) {
                    venuesDataForSubmit.venuesToUpdate.forEach((venue, index) => {
                        const distanceInMeters = venue.distance * 1000;
                        const distanceStr = distanceInMeters.toFixed(1);
                        formData.append(`entertainmentVenuesWithDistanceToUpdate[${index}].entertainmentVenueId`, venue.venueId);
                        formData.append(`entertainmentVenuesWithDistanceToUpdate[${index}].distance`, distanceStr);
                    });
                }

                // Backend mong đợi format: entertainmentVenuesWithDistanceToAdd[0].entertainmentVenueId, entertainmentVenuesWithDistanceToAdd[0].distance, ...
                if (venuesDataForSubmit.venuesToAdd.length > 0) {
                    venuesDataForSubmit.venuesToAdd.forEach((venue, index) => {
                        const distanceInMeters = venue.distance * 1000;
                        const distanceStr = distanceInMeters.toFixed(1);
                        formData.append(`entertainmentVenuesWithDistanceToAdd[${index}].entertainmentVenueId`, venue.venueId);
                        formData.append(`entertainmentVenuesWithDistanceToAdd[${index}].distance`, distanceStr);
                    });
                }

                // Xử lý newVenues (venues mới được tạo)
                if (venuesDataForSubmit.newVenues.length > 0) {
                    venuesDataForSubmit.newVenues.forEach((venue, index) => {
                        const distanceInMeters = venue.distance * 1000;
                        formData.append(`entertainmentVenuesToAdd[${index}].name`, venue.name);
                        formData.append(`entertainmentVenuesToAdd[${index}].distance`, distanceInMeters.toFixed(1));
                        formData.append(`entertainmentVenuesToAdd[${index}].cityId`, selectedCityId);
                        formData.append(`entertainmentVenuesToAdd[${index}].categoryId`, venue.categoryId);
                    });
                }
            }

            // Append policy data
            if (checkInTime) {
                formData.append('policy.checkInTime', checkInTime);
            }
            if (checkOutTime) {
                formData.append('policy.checkOutTime', checkOutTime);
            }
            formData.append('policy.allowsPayAtHotel', allowsPayAtHotel.toString());

            // Append required identification documents - chỉ append các document IDs hợp lệ
            const validDocumentIds = Array.from(selectedDocumentIds).filter(
                (docId) => docId && typeof docId === 'string' && docId.trim() !== ''
            );

            // Kiểm tra xem các document IDs có tồn tại trong danh sách identification documents hiện tại không
            const existingDocumentIds = new Set(identificationDocuments.map(d => d.id));
            const validAndExistingDocumentIds = validDocumentIds.filter(id => existingDocumentIds.has(id));

            if (validDocumentIds.length !== validAndExistingDocumentIds.length) {
                const invalidIds = validDocumentIds.filter(id => !existingDocumentIds.has(id));
                // Một số identification document IDs không tồn tại trong danh sách hiện tại
            }

            validAndExistingDocumentIds.forEach((docId) => {
                formData.append('policy.requiredIdentificationDocumentIdsToAdd[]', docId);
            });

            if (cancellationPolicyId) {
                formData.append('policy.cancellationPolicyId', cancellationPolicyId);
            }

            if (reschedulePolicyId) {
                formData.append('policy.reschedulePolicyId', reschedulePolicyId);
            }
        }


        // Gọi formAction với FormData
        formAction(formData);
    };

    return (
        <>
            <div className="bg-white rounded-xl shadow-sm">
                <form onSubmit={handleFormSubmit} noValidate className="space-y-8">
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
                                </>
                            ) : (
                                <div className="block w-full px-3 py-2.5 border border-red-300 rounded-md shadow-sm bg-red-50 text-red-700 text-sm">
                                    ⚠️ Bạn không có quyền tạo khách sạn
                                </div>
                            )}
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

                    {/* Tiện ích, Địa điểm lân cận, Chính sách - CHỈ HIỂN THỊ KHI EDIT (Partner update hotel) */}
                    {isEditing && (
                        <>
                            {/* Tiện ích (Amenities) */}
                            <AmenitiesSection
                                amenities={amenities}
                                selectedAmenityIds={selectedAmenityIds}
                                onSelectedAmenityIdsChange={setSelectedAmenityIds}
                            />

                            {/* Địa điểm lân cận (Entertainment Venues) */}
                            <NearbyLocationsSection
                                selectedCityId={selectedCityId}
                                entertainmentVenuesByCategory={entertainmentVenuesByCategory}
                                selectedVenues={selectedVenues}
                                newVenues={newVenues}
                                hotelVenueDistances={hotelVenueDistances}
                                isEditing={isEditing}
                                hotelId={hotel?.id}
                                hotel={hotel}
                                onSelectedVenuesChange={setSelectedVenues}
                                onNewVenuesChange={setNewVenues}
                                onVenueRemove={(venueId) => {
                                    // Khi user xóa venue, thêm vào danh sách cần xóa
                                    setVenuesToRemove(prev => new Set([...prev, venueId]));
                                }}
                                onVenuesDataReady={useCallback((data: {
                                    venuesToUpdate: Array<{ venueId: string; distance: number }>;
                                    venuesToAdd: Array<{ venueId: string; distance: number }>;
                                    venuesToRemove: string[];
                                    newVenues: Array<{ name: string; distance: number; categoryId: string }>;
                                }) => {
                                    // Lưu dữ liệu venues để dùng khi submit form
                                    setVenuesDataForSubmit(data);
                                }, [])}
                            />

                            {/* Chính sách (Policy) */}
                            <PoliciesSection
                                checkInTime={checkInTime}
                                checkOutTime={checkOutTime}
                                allowsPayAtHotel={allowsPayAtHotel}
                                selectedDocumentIds={selectedDocumentIds}
                                cancellationPolicyId={cancellationPolicyId}
                                reschedulePolicyId={reschedulePolicyId}
                                cancellationPolicies={cancellationPolicies}
                                reschedulePolicies={reschedulePolicies}
                                identificationDocuments={identificationDocuments}
                                onCheckInTimeChange={setCheckInTime}
                                onCheckOutTimeChange={setCheckOutTime}
                                onAllowsPayAtHotelChange={setAllowsPayAtHotel}
                                onSelectedDocumentIdsChange={setSelectedDocumentIds}
                                onCancellationPolicyIdChange={setCancellationPolicyId}
                                onReschedulePolicyIdChange={setReschedulePolicyId}
                            />
                        </>
                    )}

                    {isEditing && isSuperAdmin && (
                        <div className="space-y-2">
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                                Trạng thái (chỉ Super Admin có thể sửa)
                            </label>
                            <select
                                id="status"
                                name="status"
                                defaultValue={hotel?.status?.toLowerCase() || 'active'}
                                className="block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                                <option value="active">Đang hoạt động</option>
                                <option value="inactive">Ngừng hoạt động</option>
                                <option value="maintenance">Bảo trì</option>
                                <option value="closed">Đóng cửa</option>
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
                    <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                        {!isEditing && (
                            <button
                                type="button"
                                onClick={() => {
                                    // Check if form is inside a modal by checking for modal wrapper
                                    const formWrapper = document.getElementById('hotel-form-wrapper');
                                    if (formWrapper) {
                                        // If inside modal, trigger close - handled by parent
                                        const closeEvent = new CustomEvent('closeHotelFormModal');
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