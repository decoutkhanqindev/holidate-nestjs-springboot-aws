"use client";

import { useFormStatus } from "react-dom";
import Link from "next/link";
import { WifiIcon, TvIcon, StarIcon } from '@heroicons/react/24/outline'; // npm install @heroicons/react

const amenities = [
    { id: 'wifi', label: 'Wi-Fi miễn phí', icon: WifiIcon },
    { id: 'tv', label: 'TV màn hình phẳng', icon: TvIcon },
    { id: 'ac', label: 'Máy lạnh', icon: StarIcon }, // Thay bằng icon phù hợp
    // Thêm các tiện ích khác
];

function SubmitButton() { /* ... code submit button ... */ }

export default function RoomForm({ formAction, hotelId }: { formAction: (formData: FormData) => void, hotelId: string }) {
    // Logic cho dynamic extra services (nếu cần)
    // const [services, setServices] = useState([{ name: '', price: '' }]);

    return (
        <form action={formAction} className="mt-4 space-y-8">
            <input type="hidden" name="hotelId" value={hotelId} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* --- CỘT TRÁI (2/3) --- */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Card 1: Thông tin cơ bản */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-4">1. Thông tin cơ bản</h3>
                        <div className="space-y-4">
                            <div>
                                <label>Tên phòng</label>
                                <input name="name" type="text" required placeholder="VD: Deluxe Ocean View" className="w-full mt-1 input-style" />
                            </div>
                            <div>
                                <label>Mô tả ngắn</label>
                                <textarea name="description" rows={4} placeholder="Phòng rộng 40m², có ban công hướng biển..." className="w-full mt-1 input-style"></textarea>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label>Giá / đêm (VNĐ)</label><input name="price" type="number" required className="w-full mt-1 input-style" /></div>
                                <div><label>Loại giường</label><select name="bedType" className="w-full mt-1 input-style"><option>Double</option><option>Twin</option><option>King</option></select></div>
                                <div><label>Sức chứa (người)</label><input name="capacity" type="number" required className="w-full mt-1 input-style" /></div>
                                <div><label>View</label><select name="view" className="w-full mt-1 input-style"><option>Hướng biển</option><option>Hướng thành phố</option><option>Hướng vườn</option></select></div>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Dịch vụ bổ sung */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-4">2. Dịch vụ bổ sung</h3>
                        {/* Đây là phần dynamic form, tạm thời làm giao diện tĩnh */}
                        <div className="flex items-end gap-4">
                            <div className="flex-1"><label>Tên dịch vụ</label><input name="service_name_1" placeholder="Đưa đón sân bay" className="w-full mt-1 input-style" /></div>
                            <div className="w-40"><label>Giá (VNĐ)</label><input name="service_price_1" type="number" placeholder="300000" className="w-full mt-1 input-style" /></div>
                            <button type="button" className="btn-secondary h-10">Xóa</button>
                        </div>
                        <button type="button" className="btn-outline mt-4">+ Thêm dịch vụ khác</button>
                    </div>
                </div>

                {/* --- CỘT PHẢI (1/3) --- */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Card 3: Ảnh phòng */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-4">3. Hình ảnh</h3>
                        <div>
                            <label>Ảnh đại diện</label>
                            <input name="mainImage" type="file" className="w-full mt-1 text-sm" />
                        </div>
                        <div className="mt-4">
                            <label>Thư viện ảnh</label>
                            <input name="galleryImages" type="file" multiple className="w-full mt-1 text-sm" />
                        </div>
                    </div>
                    {/* Card 4: Tiện ích */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-4">4. Tiện ích</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {amenities.map(item => (
                                <label key={item.id} className="flex items-center space-x-2 cursor-pointer">
                                    <input type="checkbox" name="amenities" value={item.id} className="h-4 w-4 rounded" />
                                    <item.icon className="h-5 w-5 text-gray-600" />
                                    <span className="text-sm">{item.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Nút hành động cuối trang */}
            <div className="flex justify-end gap-4 pt-5 border-t border-gray-200 bg-white p-4 rounded-b-lg shadow-md sticky bottom-0">
                <Link href="/admin-rooms" className="btn-secondary">Hủy</Link>
                {/* <SubmitButton /> */}
                <button type="submit" className="btn-primary">Lưu phòng</button>
            </div>
        </form>
    );
}