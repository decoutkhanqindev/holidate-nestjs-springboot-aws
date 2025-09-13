import Link from "next/link";

// Component thẻ khách sạn (dùng Bootstrap Card)
const HotelCard = ({ id, name, city, price, imageUrl }: any) => (
    <div className="col-12 col-md-6 col-lg-4 mb-4">
        <div className="card shadow-sm h-100">
            <Link href={`/hotels/${id}`} className="text-decoration-none text-dark">
                <img src={imageUrl} alt={name} className="card-img-top" />
                <div className="card-body">
                    <h5 className="card-title fw-bold">{name}</h5>
                    <p className="card-text text-muted">{city}</p>
                    <p className="card-text text-success fw-semibold">
                        Từ ${price}/đêm
                    </p>
                </div>
            </Link>
        </div>
    </div>
);

export default function HotelsPage() {
    // Dữ liệu khách sạn demo
    const hotels = [
        {
            id: "1",
            name: "Khách sạn Mây Tre",
            city: "Hà Nội",
            price: 120,
            imageUrl:
                "https://images.unsplash.com/photo-1571896349881-f09b52a558dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzEyNjZ8MHwxfHNlYXJjaHwxfHxhbmdlbGFuZGluZyUyMGhvdGVsfGVufDB8fHx8MTcwMDcwNzU2NXww&ixlib=rb-4.0.3&q=80&w=1080",
        },
        {
            id: "2",
            name: "Khu nghỉ dưỡng Biển Xanh",
            city: "Đà Nẵng",
            price: 250,
            imageUrl:
                "https://images.unsplash.com/photo-1542314831-068cd1dbf6db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzEyNjZ8MHwxfHNlYXJjaHwxfHxob3RlbCUyMHJlc29ydHxlbnwwfHx8fDE3MDA3MDc2MzB8MA&ixlib=rb-4.0.3&q=80&w=1080",
        },
        {
            id: "3",
            name: "Khách sạn Phố Cổ",
            city: "Hội An",
            price: 90,
            imageUrl:
                "https://images.unsplash.com/photo-1566073771259-d368f5616f73?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzEyNjZ8MHwxfHNlYXJjaHwxfHxob3RlbCUyMHJvb20lMjBhbmQlMjBkZWNvcmF0aW9ufGVufDB8fHx8MTcwMDcwNzY3OHww&ixlib=rb-4.0.3&q=80&w=1080",
        },
    ];

    return (
        <div className="container-fluid min-vh-100 bg-light py-5">
            <h1 className="text-center mb-5 display-5 fw-bold text-primary">
                Các khách sạn của chúng tôi
            </h1>
            <div className="row justify-content-center">
                {hotels.map((hotel) => (
                    <HotelCard key={hotel.id} {...hotel} />
                ))}
            </div>
        </div>
    );
}
