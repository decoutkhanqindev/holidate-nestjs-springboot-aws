'use client';

import Image from 'next/image';
import styles from './TravelInspiration.module.css';

interface Hotel {
    id: number;
    name: string;
    location: string;
    image: string;
    alt: string;
}

export default function TravelInspiration() {
    const hotels: Hotel[] = [
        {
            id: 1,
            name: "Mường Thanh Grand",
            location: "Nghệ An",
            image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&h=300&fit=crop&crop=center",
            alt: "Khách sạn Mường Thanh Grand Nghệ An"
        },
        {
            id: 2,
            name: "Vinpearl Resort",
            location: "Phú Quốc",
            image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&h=300&fit=crop&crop=center",
            alt: "Vinpearl Resort Phú Quốc với bãi biển đẹp"
        },
        {
            id: 3,
            name: "InterContinental",
            location: "Đà Nẵng",
            image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop&crop=center",
            alt: "InterContinental Danang Sun Peninsula Resort"
        },
        {
            id: 4,
            name: "JW Marriott",
            location: "Hà Nội",
            image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center",
            alt: "JW Marriott Hotel Hanoi"
        },
        {
            id: 5,
            name: "Rex Hotel",
            location: "TP.HCM",
            image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=300&fit=crop&crop=center",
            alt: "Rex Hotel Saigon"
        }
    ];

    return (
        <section className={styles.inspirationSection}>
            <div className="container">
                <div className={styles.header}>
                    <div className={styles.titleContainer}>
                        <svg
                            className={styles.icon}
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M3 9v12h18V9H3zm0-2h18a2 2 0 012 2v12a2 2 0 01-2 2H3a2 2 0 01-2-2V9a2 2 0 012-2z"
                                fill="currentColor"
                            />
                            <path
                                d="M7 3h10v4H7V3z"
                                fill="currentColor"
                            />
                            <circle cx="8" cy="12" r="1" fill="white" />
                            <circle cx="12" cy="12" r="1" fill="white" />
                            <circle cx="16" cy="12" r="1" fill="white" />
                        </svg>
                        <h2 className={styles.title}>Khách sạn nổi bật</h2>
                    </div>
                </div>

                <div className={styles.destinationsGrid}>
                    {hotels.map((hotel) => (
                        <div key={hotel.id} className={styles.destinationCard}>
                            <div className={styles.imageContainer}>
                                <Image
                                    src={hotel.image}
                                    alt={hotel.alt}
                                    fill
                                    className={styles.destinationImage}
                                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 20vw"
                                />
                                <div className={styles.overlay}></div>
                                <div className={styles.destinationInfo}>
                                    <h3 className={styles.destinationName}>{hotel.name}</h3>
                                    <p className={styles.destinationCountry}>{hotel.location}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* <div className={styles.viewMoreContainer}>
                    <button className={styles.viewMoreBtn}>
                        <span>Xem thêm</span>
                        <svg
                            className={styles.arrowIcon}
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M6 12L10 8L6 4"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>
                </div> */}
            </div>
        </section>
    );
}
