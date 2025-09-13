
'use client';

import { useState } from 'react';
import Image from 'next/image';

const allHotelsData: { [key: string]: any[] } = {
    'Đà Nẵng': [
        { name: 'Alibaba Hotel Da Nang', rating: '8.4/10 (786)', price: '225.891 VND', image: '/hotel-danang-1.jpg' },
        { name: 'La Beach Hotel', rating: '8.3/10 (699)', price: '245.212 VND', image: '/hotel-danang-2.jpg', discount: 'Tiết kiệm 25%' },
        { name: 'The Herriott Hotel & Suite', rating: '8.7/10 (1645)', price: '416.509 VND', image: '/hotel-danang-3.jpg', special: 'Ưu đãi cho người dùng ứng dụng' },
        { name: 'Davue Hotel Da Nang', rating: '8.7/10 (1064)', price: '263.875 VND', image: '/hotel-danang-4.jpg' }
    ],
    'Nha Trang': [
        { name: 'Navada Beach Hotel', rating: '9.0/10 (1203)', price: '850.000 VND', image: '/hotel-nhatrang-1.jpg' },
        { name: 'Regalia Gold Hotel', rating: '8.8/10 (2150)', price: '920.450 VND', image: '/hotel-nhatrang-2.jpg', discount: 'Tiết kiệm 15%' },
        { name: 'Botanic Hotel Nha Trang', rating: '8.5/10 (556)', price: '675.120 VND', image: '/hotel-nhatrang-3.jpg' },
        { name: 'Apus Hotel', rating: '8.9/10 (1500)', price: '780.000 VND', image: '/hotel-nhatrang-4.jpg' }
    ],
    'Phan Thiết': [
        { name: 'Khách sạn Mường Thanh Holiday Mui Ne', rating: '8.4/10 (926)', price: '773.819 VND', image: '/hotel-phanthiet-1.jpg' },
        { name: 'Le\' VIVA Resort Mui Ne', rating: '8.9/10 (263)', price: '1.228.411 VND', image: '/hotel-phanthiet-2.jpg', discount: 'Tiết kiệm 25%' },
        { name: 'TTC Hotel Phan Thiet', rating: '8.6/10 (856)', price: '794.276 VND', image: '/hotel-phanthiet-3.jpg' },
        { name: 'Muine Bay Resort', rating: '8.9/10 (615)', price: '972.035 VND', image: '/hotel-phanthiet-4.jpg' }
    ],
    'TP. Hồ Chí Minh': [
        { name: 'Cozrum Homes - Sonata Residence', rating: '7.9/10 (397)', price: '527.330 VND', image: '/hotel-hcm-1.jpg', special: 'Cho gia đình' },
        { name: 'Asian Ruby Hotel & Apartment', rating: '8.6/10 (424)', price: '615.045 VND', image: '/hotel-hcm-2.jpg', discount: 'Tiết kiệm 11%' },
        { name: 'SAZI RESORT Bến Thành', rating: '8.3/10 (866)', price: '818.378 VND', image: '/hotel-hcm-3.jpg' },
        { name: 'The Odys Boutique Hotel', rating: '9.0/10 (2045)', price: '1.500.000 VND', image: '/hotel-hcm-4.jpg' }
    ],
    'Vũng Tàu': [
        { name: 'Xuan Homestay - The Song Vung Tau', rating: '8.9/10 (367)', price: '363.550 VND', image: '/hotel-vungtau-1.jpg', special: 'Gần biển' },
        { name: 'Emerald Ho Tram Resort', rating: '9.2/10 (93)', price: '1.415.584 VND', image: '/hotel-vungtau-2.jpg', discount: 'Tiết kiệm 25%' },
        { name: 'Nolis Hotel Vung Tau', rating: '8.7/10 (958)', price: '519.209 VND', image: '/hotel-vungtau-3.jpg' },
        { name: 'Lan Rung Beach Resort', rating: '8.3/10 (1250)', price: '995.000 VND', image: '/hotel-vungtau-4.jpg', special: 'Gần biển' }
    ],
    'Hà Nội': [
        { name: '3T Hotel Hanoi', rating: '9.1/10 (609)', price: '655.376 VND', image: '/hotel-hanoi-1.jpg', special: 'Vị trí tốt' },
        { name: 'Libre Homestay', rating: '9.1/10 (157)', price: '435.635 VND', image: '/hotel-hanoi-2.jpg', discount: 'Tiết kiệm 25%' },
        { name: 'Khách sạn Le Grand Hanoi - The Sun', rating: '8.4/10 (41)', price: '506.089 VND', image: '/hotel-hanoi-3.jpg', special: 'Cho gia đình' },
        { name: 'The Oriental Jade Hotel', rating: '9.5/10 (3012)', price: '2.100.000 VND', image: '/hotel-hanoi-4.jpg' }
    ],
    'Huế': [
        { name: 'Shine Hue Hotel 2', rating: '8.3/10 (934)', price: '286.836 VND', image: '/hotel-hue-1.jpg' },
        { name: 'Elegant Hotel Hue', rating: '9.2/10 (88)', price: '537.225 VND', image: '/hotel-hue-2.jpg', discount: 'Tiết kiệm 25%' },
        { name: 'La Habana House', rating: '8.5/10 (147)', price: '235.931 VND', image: '/hotel-hue-3.jpg' },
        { name: 'Moonlight Hotel Hue', rating: '8.8/10 (274)', price: '644.107 VND', image: '/hotel-hue-4.jpg' }
    ]
};

const locations = Object.keys(allHotelsData);

export default function HotelSelection() {
    const [activeLocation, setActiveLocation] = useState(locations[0]);

    const displayedHotels = allHotelsData[activeLocation];

    const handleLocationClick = (location: string) => {
        setActiveLocation(location);
    };

    return (
        <div className="py-5">
            <div className="container">
                <h2 className="fw-bold mb-4 text-black">🏨 Nhiều lựa chọn khách sạn</h2>

                {/*  chọn thành phố */}
                <div className="mb-4">
                    {locations.map((loc) => (
                        <button
                            key={loc}
                            className={`btn rounded-pill me-2 mb-2 fw-semibold ${activeLocation === loc ? 'btn-primary' : 'bg-light text-primary border-0'}`}
                            onClick={() => handleLocationClick(loc)}
                        >
                            {loc}
                        </button>
                    ))}
                </div>

                {/* Lưới hiển thị khách sạn */}
                <div className="row g-4">
                    {displayedHotels.map((hotel, index) => (
                        <div key={`${activeLocation}-${index}`} className="col-lg-3 col-md-6">
                            <div className="card h-100 shadow-sm border-0">
                                <div className="position-relative">
                                    <Image src={hotel.image} width={400} height={300} alt={hotel.name} className="card-img-top" style={{ objectFit: 'cover', height: '200px' }} />
                                    {hotel.discount && <span className="badge bg-warning text-dark position-absolute bottom-0 end-0 m-2">{hotel.discount}</span>}
                                </div>
                                <div className="card-body d-flex flex-column">
                                    <h5 className="card-title fw-bold">{hotel.name}</h5>
                                    <p className="card-text text-primary small fw-bold">⭐ {hotel.rating}</p>
                                    {hotel.special && <p className="card-text text-success small">{hotel.special}</p>}
                                    <div className="mt-auto">
                                        <p className="card-text text-danger fw-bold fs-5 mb-0">{hotel.price}</p>
                                        <small className="text-muted">Chưa bao gồm thuế và phí</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-5">
                    <button className="btn btn-primary btn-lg">Xem thêm ưu đãi khách sạn</button>
                </div>
            </div>
        </div>
    );
}