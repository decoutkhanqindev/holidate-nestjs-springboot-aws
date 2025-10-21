'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import CustomDropdown from '@/components/common/CustomDropdown';
import AddPhoneModal from '@/components/Account/Modal/AddPhoneModal';

export default function SettingsPage() {
    const { user } = useAuth();

    const [fullName, setFullName] = useState('');
    const [gender, setGender] = useState('');
    const [day, setDay] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
    const [phoneNumbers, setPhoneNumbers] = useState<string[]>([]);

    useEffect(() => {
        if (user) {
            setFullName(user.fullName);
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        try {
            const dateOfBirth = year && month && day ? `${year}-${month}-${day}` : null;
            // gọi API để cập nhật profile
            console.log('Đã gửi dữ liệu cập nhật:', { fullName, gender, dateOfBirth });

            // Giả lập thành công
            setMessage('Cập nhật thành công!');
            setTimeout(() => setMessage(''), 3000); // Ẩn thông báo sau 3s
        } catch (error) {
            console.error('Lỗi cập nhật hồ sơ:', error);
            setMessage('Cập nhật thất bại. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    //   khi lưu SĐT từ modal
    const handleSavePhoneNumber = (newPhoneNumber: string) => {
        //   gọi API để lưu SĐT vào backend
        console.log("Số điện thoại mới để lưu:", newPhoneNumber);

        if (phoneNumbers.length < 3) {
            setPhoneNumbers(prev => [...prev, newPhoneNumber]);
        } else {
            alert("Bạn chỉ có thể thêm tối đa 3 số điện thoại.");
        }
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

                <div className="mb-4">
                    <label htmlFor="city" className="form-label">Thành phố cư trú</label>
                    <input type="text" className="form-control" id="city" placeholder="Thành phố Hồ Chí Minh" />
                </div>

                <div className="d-flex justify-content-end">
                    <button type="button" className="btn btn-light me-2">Có lẽ để sau</button>
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
                            <small className="text-muted">Chỉ có thể sử dụng tối đa 3 số di động</small>
                        </div>
                        <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => setIsPhoneModalOpen(true)}
                            disabled={phoneNumbers.length >= 3}
                        >
                            + Thêm số di động
                        </button>
                    </div>

                    {phoneNumbers.length === 0 ? (
                        <div className="p-3 bg-light rounded text-muted">
                            Chưa có số di động nào được thêm.
                        </div>
                    ) : (
                        phoneNumbers.map((phone, index) => (
                            <div key={index} className="p-3 bg-light rounded d-flex justify-content-between align-items-center mt-2">
                                <span><strong>+84 {phone}</strong></span>
                            </div>
                        ))
                    )}
                </div>
            </form>

            {/*  Modal */}
            <AddPhoneModal
                isOpen={isPhoneModalOpen}
                onClose={() => setIsPhoneModalOpen(false)}
                onSave={handleSavePhoneNumber}
            />
        </>
    );
}