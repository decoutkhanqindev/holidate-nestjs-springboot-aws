'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import CustomDropdown from '@/components/common/CustomDropdown';
import AddPhoneModal from '@/components/Account/Modal/AddPhoneModal';
import { getUserProfile, updateUserProfile, type UserProfileResponse } from '@/lib/client/userService';
import { getCountries, getProvinces, getCities, getDistricts, getWards, getStreets, type LocationOption } from '@/lib/client/locationService';

export default function SettingsPage() {
    const { user, refreshUserProfile } = useAuth();

    // Form state
    const [fullName, setFullName] = useState('');
    const [gender, setGender] = useState('');
    const [day, setDay] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    const [address, setAddress] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [message, setMessage] = useState('');

    // Location state
    const [countries, setCountries] = useState<LocationOption[]>([]);
    const [provinces, setProvinces] = useState<LocationOption[]>([]);
    const [cities, setCities] = useState<LocationOption[]>([]);
    const [districts, setDistricts] = useState<LocationOption[]>([]);
    const [wards, setWards] = useState<LocationOption[]>([]);
    const [streets, setStreets] = useState<LocationOption[]>([]);

    const [selectedCountryId, setSelectedCountryId] = useState('');
    const [selectedProvinceId, setSelectedProvinceId] = useState('');
    const [selectedCityId, setSelectedCityId] = useState('');
    const [selectedDistrictId, setSelectedDistrictId] = useState('');
    const [selectedWardId, setSelectedWardId] = useState('');
    const [selectedStreetId, setSelectedStreetId] = useState('');

    const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);

    // Load user profile khi component mount
    useEffect(() => {
        const loadUserProfile = async () => {
            if (!user?.id) return;
            setIsLoadingProfile(true);
            try {
                const profile = await getUserProfile(user.id);
                setFullName(profile.fullName || '');
                setAddress(profile.address || '');
                setPhoneNumber(profile.phoneNumber || '');
                setAvatarUrl(profile.avatarUrl || null);
                setAvatarFile(null); // Reset avatar file khi load profile
                setAvatarPreview(null); // Reset preview

                // Map gender từ backend (male/female/other - lowercase) sang frontend (Nam/Nữ/Khác)
                if (profile.gender) {
                    const genderMap: Record<string, string> = {
                        'male': 'Nam',
                        'MALE': 'Nam', // Fallback cho uppercase
                        'female': 'Nữ',
                        'FEMALE': 'Nữ', // Fallback cho uppercase
                        'other': 'Khác',
                        'OTHER': 'Khác', // Fallback cho uppercase
                    };
                    setGender(genderMap[profile.gender.toLowerCase()] || genderMap[profile.gender] || '');
                }

                // Parse dateOfBirth
                if (profile.dateOfBirth) {
                    const dob = new Date(profile.dateOfBirth);
                    setDay(String(dob.getDate()));
                    setMonth(String(dob.getMonth() + 1));
                    setYear(String(dob.getFullYear()));
                }

                // Set location IDs và load location data
                if (profile.country?.id) {
                    setSelectedCountryId(profile.country.id);
                    // Load provinces for this country
                    const provincesData = await getProvinces(profile.country.id);
                    setProvinces(provincesData);
                }
                if (profile.province?.id) {
                    setSelectedProvinceId(profile.province.id);
                    // Load cities for this province
                    const citiesData = await getCities(profile.province.id);
                    setCities(citiesData);
                }
                if (profile.city?.id) {
                    setSelectedCityId(profile.city.id);
                    // Load districts for this city
                    const districtsData = await getDistricts(profile.city.id);
                    setDistricts(districtsData);
                }
                if (profile.district?.id) {
                    setSelectedDistrictId(profile.district.id);
                    // Load wards for this district
                    const wardsData = await getWards(profile.district.id);
                    setWards(wardsData);
                }
                if (profile.ward?.id) {
                    setSelectedWardId(profile.ward.id);
                    // Load streets for this ward
                    const streetsData = await getStreets(profile.ward.id);
                    setStreets(streetsData);
                }
                if (profile.street?.id) {
                    setSelectedStreetId(profile.street.id);
                }

                console.log('[SettingsPage] ✅ User profile loaded:', profile);
            } catch (error: any) {
                console.error('[SettingsPage] Error loading profile:', error);
                setMessage('Không thể tải thông tin hồ sơ: ' + (error.message || 'Lỗi không xác định'));
            } finally {
                setIsLoadingProfile(false);
            }
        };

        loadUserProfile();
    }, [user?.id]);

    // Load countries khi component mount
    useEffect(() => {
        const loadCountries = async () => {
            const data = await getCountries();
            setCountries(data);
        };
        loadCountries();
    }, []);

    // Load provinces khi countryId thay đổi
    useEffect(() => {
        const loadProvinces = async () => {
            if (selectedCountryId) {
                const data = await getProvinces(selectedCountryId);
                setProvinces(data);
            } else {
                setProvinces([]);
            }
            // Reset dependent locations
            setCities([]);
            setDistricts([]);
            setWards([]);
            setStreets([]);
            setSelectedProvinceId('');
            setSelectedCityId('');
            setSelectedDistrictId('');
            setSelectedWardId('');
            setSelectedStreetId('');
        };
        loadProvinces();
    }, [selectedCountryId]);

    // Load cities khi provinceId thay đổi
    useEffect(() => {
        const loadCities = async () => {
            if (selectedProvinceId) {
                const data = await getCities(selectedProvinceId);
                setCities(data);
            } else {
                setCities([]);
            }
            // Reset dependent locations
            setDistricts([]);
            setWards([]);
            setStreets([]);
            setSelectedCityId('');
            setSelectedDistrictId('');
            setSelectedWardId('');
            setSelectedStreetId('');
        };
        loadCities();
    }, [selectedProvinceId]);

    // Load districts khi cityId thay đổi
    useEffect(() => {
        const loadDistricts = async () => {
            if (selectedCityId) {
                const data = await getDistricts(selectedCityId);
                setDistricts(data);
            } else {
                setDistricts([]);
            }
            // Reset dependent locations
            setWards([]);
            setStreets([]);
            setSelectedDistrictId('');
            setSelectedWardId('');
            setSelectedStreetId('');
        };
        loadDistricts();
    }, [selectedCityId]);

    // Load wards khi districtId thay đổi
    useEffect(() => {
        const loadWards = async () => {
            if (selectedDistrictId) {
                const data = await getWards(selectedDistrictId);
                setWards(data);
            } else {
                setWards([]);
            }
            // Reset dependent locations
            setStreets([]);
            setSelectedWardId('');
            setSelectedStreetId('');
        };
        loadWards();
    }, [selectedDistrictId]);

    // Load streets khi wardId thay đổi
    useEffect(() => {
        const loadStreets = async () => {
            if (selectedWardId) {
                const data = await getStreets(selectedWardId);
                setStreets(data);
            } else {
                setStreets([]);
            }
            setSelectedStreetId('');
        };
        loadStreets();
    }, [selectedWardId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id) {
            setMessage('Vui lòng đăng nhập để cập nhật thông tin.');
            return;
        }

        setIsLoading(true);
        setMessage('');

        try {
            // Map gender từ frontend (Nam/Nữ/Khác) sang backend (male/female/other - lowercase)
            // Backend ValidationPatterns.GENDER = "^(male|female|other)$"
            const genderMap: Record<string, string> = {
                'Nam': 'male',
                'Nữ': 'female',
                'Khác': 'other',
            };
            const backendGender = gender ? genderMap[gender] : undefined;

            // Format dateOfBirth: YYYY-MM-DDTHH:mm:ss (LocalDateTime format, không có timezone)
            // Backend expect LocalDateTime từ form-data, format: YYYY-MM-DDTHH:mm:ss
            let dateOfBirth: string | undefined;
            if (year && month && day) {
                const yearNum = parseInt(year);
                const monthNum = parseInt(month);
                const dayNum = parseInt(day);
                // Format: YYYY-MM-DDTHH:mm:ss (LocalDateTime, không có timezone)
                dateOfBirth = `${yearNum}-${String(monthNum).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}T00:00:00`;
            }

            // Gọi API để cập nhật profile
            // Chỉ gửi các field có giá trị (không gửi undefined hoặc empty string)
            const payload: any = {};

            if (fullName && fullName.trim()) payload.fullName = fullName.trim();
            if (phoneNumber && phoneNumber.trim()) payload.phoneNumber = phoneNumber.trim();
            if (address && address.trim()) payload.address = address.trim();
            if (backendGender) payload.gender = backendGender;
            if (dateOfBirth) payload.dateOfBirth = dateOfBirth;

            // Chỉ gửi location IDs nếu đã chọn
            if (selectedCountryId && selectedCountryId.trim()) payload.countryId = selectedCountryId.trim();
            if (selectedProvinceId && selectedProvinceId.trim()) payload.provinceId = selectedProvinceId.trim();
            if (selectedCityId && selectedCityId.trim()) payload.cityId = selectedCityId.trim();
            if (selectedDistrictId && selectedDistrictId.trim()) payload.districtId = selectedDistrictId.trim();
            if (selectedWardId && selectedWardId.trim()) payload.wardId = selectedWardId.trim();
            if (selectedStreetId && selectedStreetId.trim()) payload.streetId = selectedStreetId.trim();

            // Gửi avatarFile nếu có
            if (avatarFile) {
                payload.avatarFile = avatarFile;
            }

            console.log('[SettingsPage] Updating profile with payload:', payload);
            console.log('[SettingsPage] Payload keys:', Object.keys(payload));

            const updatedProfile = await updateUserProfile(user.id, payload);
            console.log('[SettingsPage] ✅ Profile updated, response:', updatedProfile);

            // Cập nhật avatarUrl sau khi upload thành công
            if (updatedProfile.avatarUrl) {
                setAvatarUrl(updatedProfile.avatarUrl);
                setAvatarFile(null); // Reset file sau khi upload thành công
                setAvatarPreview(null); // Reset preview
                console.log('[SettingsPage] ✅ Avatar URL updated:', updatedProfile.avatarUrl);
            }

            // Refresh user profile trong AuthContext để cập nhật avatar ở navbar và sidebar
            console.log('[SettingsPage] Calling refreshUserProfile...');
            await refreshUserProfile();
            console.log('[SettingsPage] ✅ refreshUserProfile completed');

            setMessage('Cập nhật thành công!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error: any) {
            console.error('Lỗi cập nhật hồ sơ:', error);
            setMessage('Cập nhật thất bại: ' + (error.message || 'Vui lòng thử lại.'));
        } finally {
            setIsLoading(false);
        }
    };

    // Khi lưu SĐT từ modal
    const handleSavePhoneNumber = (newPhoneNumber: string) => {
        setPhoneNumber(newPhoneNumber);
        setIsPhoneModalOpen(false);
    };

    // Handle avatar file change
    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setMessage('Vui lòng chọn file ảnh (jpg, png, gif, etc.)');
                setTimeout(() => setMessage(''), 3000);
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setMessage('File ảnh không được vượt quá 5MB');
                setTimeout(() => setMessage(''), 3000);
                return;
            }

            setAvatarFile(file);

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Get avatar display (preview > avatarUrl > default)
    const getAvatarDisplay = (): string => {
        if (avatarPreview) return avatarPreview;
        if (avatarUrl) return avatarUrl;
        return ''; // Sẽ hiển thị initial letter nếu không có avatar
    };

    const genderOptions = ['Nam', 'Nữ', 'Khác'];
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

    return (
        <>
            <form onSubmit={handleSubmit}>
                <h3 className="mb-4">Thông tin tài khoản</h3>
                <hr />

                <h5 className="mt-4 mb-3">Dữ liệu cá nhân</h5>

                {/* Avatar Upload */}
                <div className="mb-4">
                    <label className="form-label d-block">Ảnh đại diện</label>
                    <div className="d-flex align-items-center gap-3">
                        <div className="position-relative">
                            {getAvatarDisplay() ? (
                                <img
                                    src={getAvatarDisplay()}
                                    alt="Avatar"
                                    className="rounded-circle"
                                    style={{
                                        width: '100px',
                                        height: '100px',
                                        objectFit: 'cover',
                                        border: '2px solid #dee2e6'
                                    }}
                                />
                            ) : (
                                <div
                                    className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                                    style={{
                                        width: '100px',
                                        height: '100px',
                                        fontSize: '2.5rem',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {fullName.charAt(0).toUpperCase() || 'U'}
                                </div>
                            )}
                            <label
                                htmlFor="avatarInput"
                                className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    cursor: 'pointer',
                                    border: '2px solid white',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                }}
                                title="Đổi ảnh đại diện"
                            >
                                <span style={{ fontSize: '14px' }}>📷</span>
                            </label>
                            <input
                                type="file"
                                id="avatarInput"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="d-none"
                            />
                        </div>
                        <div className="flex-grow-1">
                            <p className="mb-1 small text-muted">
                                JPG, PNG hoặc GIF. Tối đa 5MB
                            </p>
                            {avatarFile && (
                                <p className="mb-0 small text-success">
                                    ✓ Đã chọn: {avatarFile.name}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mb-3">
                    <label htmlFor="fullName" className="form-label">Tên đầy đủ</label>
                    <input
                        type="text"
                        className="form-control"
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Tên trong hồ sơ được rút ngắn từ họ tên của bạn."
                    />
                </div>

                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label htmlFor="gender" className="form-label">Giới tính</label>
                        <CustomDropdown options={genderOptions} value={gender} onChange={(value) => setGender(String(value))} placeholder="Chọn giới tính" />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Ngày sinh</label>
                        <div className="d-flex gap-2">
                            <CustomDropdown options={days} value={day} onChange={(value) => setDay(String(value))} placeholder="Ngày" />
                            <CustomDropdown options={months} value={month} onChange={(value) => setMonth(String(value))} placeholder="Tháng" />
                            <CustomDropdown options={years} value={year} onChange={(value) => setYear(String(value))} placeholder="Năm" />
                        </div>
                    </div>
                </div>

                {/* Địa chỉ */}
                <div className="mb-3">
                    <label htmlFor="address" className="form-label">Địa chỉ</label>
                    <input
                        type="text"
                        className="form-control"
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Số nhà, tên đường"
                    />
                </div>

                {/* Location dropdowns */}
                {/* <div className="row mb-3">
                    <div className="col-md-6 mb-2">
                        <label htmlFor="country" className="form-label">Quốc gia</label>
                        <CustomDropdown
                            options={countries.map(c => ({ value: c.id, label: c.name }))}
                            value={selectedCountryId}
                            onChange={(value) => setSelectedCountryId(String(value))}
                            placeholder="Chọn quốc gia"
                        />
                    </div>
                    <div className="col-md-6 mb-2">
                        <label htmlFor="province" className="form-label">Tỉnh/Thành phố</label>
                        <CustomDropdown
                            options={provinces.map(p => ({ value: p.id, label: p.name }))}
                            value={selectedProvinceId}
                            onChange={(value) => setSelectedProvinceId(String(value))}
                            placeholder="Chọn tỉnh/thành phố"
                            disabled={!selectedCountryId}
                        />
                    </div>
                    <div className="col-md-6 mb-2">
                        <label htmlFor="city" className="form-label">Thành phố/Quận</label>
                        <CustomDropdown
                            options={cities.map(c => ({ value: c.id, label: c.name }))}
                            value={selectedCityId}
                            onChange={(value) => setSelectedCityId(String(value))}
                            placeholder="Chọn thành phố/quận"
                            disabled={!selectedProvinceId}
                        />
                    </div>
                    <div className="col-md-6 mb-2">
                        <label htmlFor="district" className="form-label">Quận/Huyện</label>
                        <CustomDropdown
                            options={districts.map(d => ({ value: d.id, label: d.name }))}
                            value={selectedDistrictId}
                            onChange={(value) => setSelectedDistrictId(String(value))}
                            placeholder="Chọn quận/huyện"
                            disabled={!selectedCityId}
                        />
                    </div>
                    <div className="col-md-6 mb-2">
                        <label htmlFor="ward" className="form-label">Phường/Xã</label>
                        <CustomDropdown
                            options={wards.map(w => ({ value: w.id, label: w.name }))}
                            value={selectedWardId}
                            onChange={(value) => setSelectedWardId(String(value))}
                            placeholder="Chọn phường/xã"
                            disabled={!selectedDistrictId}
                        />
                    </div>
                    <div className="col-md-6 mb-2">
                        <label htmlFor="street" className="form-label">Đường</label>
                        <CustomDropdown
                            options={streets.map(s => ({ value: s.id, label: s.name }))}
                            value={selectedStreetId}
                            onChange={(value) => setSelectedStreetId(String(value))}
                            placeholder="Chọn đường"
                            disabled={!selectedWardId}
                        />
                    </div>
                </div> */}

                <div className="d-flex justify-content-end">
                    <button type="button" className="btn btn-light me-2">Để sau</button>
                    <button type="submit" className="btn btn-primary" disabled={isLoading}>
                        {isLoading ? 'Đang lưu...' : 'Lưu'}
                    </button>
                </div>

                {message && <div className={`alert mt-3 ${message.includes('thất bại') ? 'alert-danger' : 'alert-success'}`}>{message}</div>}

                <hr className="my-4" />

                {/*  Email */}
                <div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <div>
                            <h5 className="mb-1">Email</h5>
                            <small className="text-muted">Chỉ có thể sử dụng tối đa 3 email</small>
                        </div>
                        <button type="button" className="btn btn-outline-primary btn-sm">+ Thêm email</button>
                    </div>
                    <div className="p-3 bg-light rounded d-flex justify-content-between align-items-center">
                        <span>
                            <strong>{user?.email}</strong>
                            <span className="badge bg-success ms-2">Nơi nhận thông báo</span>
                        </span>
                    </div>
                </div>

                <hr className="my-4" />

                {/*  Số điện thoại */}
                <div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <div>
                            <h5 className="mb-1">Số di động</h5>
                            <small className="text-muted">Số điện thoại của bạn</small>
                        </div>
                        <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => setIsPhoneModalOpen(true)}
                        >
                            {phoneNumber ? 'Sửa số di động' : '+ Thêm số di động'}
                        </button>
                    </div>

                    {phoneNumber ? (
                        <div className="p-3 bg-light rounded d-flex justify-content-between align-items-center">
                            <span><strong>{phoneNumber}</strong></span>
                        </div>
                    ) : (
                        <div className="p-3 bg-light rounded text-muted">
                            Chưa có số di động nào được thêm.
                        </div>
                    )}
                </div>
            </form>

            {/*  Modal */}
            <AddPhoneModal
                isOpen={isPhoneModalOpen}
                onClose={() => setIsPhoneModalOpen(false)}
                onSave={handleSavePhoneNumber}
                initialPhoneNumber={phoneNumber}
            />
        </>
    );
}