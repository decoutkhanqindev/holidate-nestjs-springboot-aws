'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import styles from '../contact.module.css';

// Data mapping cho các trang contact
const contactContent: Record<string, {
    title: string;
    content: Array<{ heading: string; paragraphs: string[] }>;
}> = {
    'doi-lich-dat-phong': {
        title: 'Cách đổi lịch đặt khách sạn của tôi',
        content: [
            {
                heading: 'Thay đổi ngày nhận phòng',
                paragraphs: [
                    'Bạn có thể thay đổi ngày nhận phòng và trả phòng của đặt phòng trực tuyến trên trang "Đặt chỗ của tôi" trong tài khoản Holidate của bạn.',
                    'Để thay đổi ngày, vui lòng thực hiện các bước sau:',
                    '1. Đăng nhập vào tài khoản Holidate của bạn',
                    '2. Chọn "Đặt chỗ của tôi" từ menu',
                    '3. Tìm đặt phòng bạn muốn thay đổi và nhấn "Thay đổi ngày"',
                    '4. Chọn ngày mới bạn muốn nhận phòng',
                    'Lưu ý: Thay đổi ngày có thể ảnh hưởng đến giá phòng. Vui lòng kiểm tra giá mới trước khi xác nhận.'
                ]
            },
            {
                heading: 'Chính sách đổi lịch',
                paragraphs: [
                    'Để đảm bảo quyền lợi của bạn, Holidate cho phép đổi lịch đặt phòng trong vòng 24 giờ trước ngày nhận phòng dự kiến.',
                    'Một số khách sạn có thể áp dụng phí đổi lịch. Vui lòng kiểm tra điều kiện của từng khách sạn trước khi thay đổi.',
                    'Nếu bạn đã thanh toán, khoản thanh toán sẽ được điều chỉnh theo giá phòng mới.'
                ]
            }
        ]
    },
    'dat-cho-truc-tiep': {
        title: 'Đặt chỗ trực tiếp để đảm bảo an toàn',
        content: [
            {
                heading: 'Lợi ích khi đặt phòng trực tiếp',
                paragraphs: [
                    'Đặt phòng trực tiếp trên Holidate mang lại nhiều lợi ích:',
                    '✓ Giá tốt nhất: Chúng tôi cung cấp giá tốt nhất trên thị trường',
                    '✓ Xác nhận ngay lập tức: Bạn sẽ nhận được email xác nhận ngay sau khi đặt phòng',
                    '✓ Hỗ trợ 24/7: Đội ngũ hỗ trợ khách hàng luôn sẵn sàng giúp đỡ bạn',
                    '✓ Bảo mật thông tin: Thông tin của bạn được mã hóa và bảo mật tuyệt đối',
                    '✓ Không phí ẩn: Mọi chi phí đều được hiển thị rõ ràng trước khi thanh toán'
                ]
            },
            {
                heading: 'Cách đặt phòng an toàn',
                paragraphs: [
                    'Khi đặt phòng trên Holidate, bạn nên:',
                    '1. Kiểm tra thông tin khách sạn kỹ lưỡng trước khi đặt',
                    '2. Đọc các điều khoản và chính sách hủy phòng',
                    '3. Đảm bảo thông tin liên hệ chính xác để nhận xác nhận đặt phòng',
                    '4. Thanh toán qua các phương thức được bảo mật (Visa, Mastercard, HolidatePay)',
                    '5. Lưu giữ email xác nhận đặt phòng để làm bằng chứng khi nhận phòng'
                ]
            }
        ]
    },
    'huy-ve-va-hoan-tien': {
        title: 'Cách hủy vé và hoàn tiền cho đặt chỗ khách sạn',
        content: [
            {
                heading: 'Hủy đặt phòng',
                paragraphs: [
                    'Bạn có thể hủy đặt phòng trực tuyến trên trang "Đặt chỗ của tôi" trong tài khoản Holidate.',
                    'Các bước hủy đặt phòng:',
                    '1. Đăng nhập vào tài khoản Holidate',
                    '2. Chọn "Đặt chỗ của tôi"',
                    '3. Tìm đặt phòng bạn muốn hủy',
                    '4. Nhấn "Hủy đặt phòng" và xác nhận',
                    'Sau khi hủy thành công, bạn sẽ nhận được email xác nhận hủy đặt phòng.'
                ]
            },
            {
                heading: 'Chính sách hoàn tiền',
                paragraphs: [
                    'Chính sách hoàn tiền tùy thuộc vào loại đặt phòng và chính sách của khách sạn:',
                    '• Hủy miễn phí: Nếu bạn hủy trong thời gian cho phép (thường là 24-48 giờ trước ngày nhận phòng), bạn sẽ được hoàn tiền đầy đủ.',
                    '• Hủy có phí: Một số khách sạn có thể áp dụng phí hủy. Phí này sẽ được khấu trừ từ số tiền hoàn lại.',
                    '• Không thể hủy: Một số đặt phòng đặc biệt (ví dụ: giá không hoàn tiền) không thể hủy. Vui lòng kiểm tra điều kiện trước khi đặt.',
                    'Thời gian hoàn tiền: Thường từ 5-10 ngày làm việc tùy thuộc vào ngân hàng của bạn.'
                ]
            }
        ]
    },
    'sua-doi-ten-hanh-khach': {
        title: 'Cách sửa hoặc đổi tên hành khách',
        content: [
            {
                heading: 'Thay đổi thông tin khách',
                paragraphs: [
                    'Bạn có thể thay đổi tên và thông tin khách trong đặt phòng trên trang "Đặt chỗ của tôi".',
                    'Các bước thay đổi:',
                    '1. Đăng nhập vào tài khoản Holidate',
                    '2. Chọn "Đặt chỗ của tôi"',
                    '3. Chọn đặt phòng bạn muốn sửa',
                    '4. Nhấn "Chỉnh sửa thông tin"',
                    '5. Cập nhật thông tin mới và lưu lại',
                    'Lưu ý: Một số khách sạn có thể yêu cầu tên khách phải khớp với giấy tờ tùy thân khi nhận phòng.'
                ]
            },
            {
                heading: 'Lưu ý quan trọng',
                paragraphs: [
                    '• Tên khách phải khớp với tên trên CMND/CCCD/Hộ chiếu',
                    '• Nếu cần thay đổi người nhận phòng chính, vui lòng liên hệ bộ phận hỗ trợ khách hàng',
                    '• Thay đổi thông tin sau khi đặt phòng có thể mất phí, tùy theo chính sách của khách sạn',
                    '• Thông tin email và số điện thoại có thể thay đổi miễn phí bất cứ lúc nào'
                ]
            }
        ]
    },
    // Categories - các tabs ngang
    'thong-tin-chung': {
        title: 'Thông tin chung',
        content: [
            {
                heading: 'Về Holidate',
                paragraphs: [
                    'Holidate là nền tảng đặt phòng khách sạn trực tuyến hàng đầu tại Việt Nam.',
                    'Chúng tôi cung cấp:',
                    '• Hơn 10,000 khách sạn và resort trên khắp Việt Nam',
                    '• Giá tốt nhất thị trường',
                    '• Hỗ trợ khách hàng 24/7',
                    '• Nhiều phương thức thanh toán tiện lợi',
                    '• Chương trình tích điểm Holidate Points'
                ]
            },
            {
                heading: 'Liên hệ',
                paragraphs: [
                    'Hotline: 1900-xxxx (Miễn phí)',
                    'Email: support@holidate.vn',
                    'Thời gian hỗ trợ: 24/7',
                    'Địa chỉ: [Địa chỉ công ty]'
                ]
            }
        ]
    },
    'tai-khoan-va-bao-mat': {
        title: 'Tài khoản và Bảo mật',
        content: [
            {
                heading: 'Quản lý tài khoản',
                paragraphs: [
                    'Tài khoản Holidate giúp bạn quản lý đặt phòng dễ dàng:',
                    '• Xem lịch sử đặt phòng',
                    '• Lưu thông tin thanh toán',
                    '• Nhận ưu đãi và khuyến mãi độc quyền',
                    '• Tích lũy Holidate Points',
                    'Để tạo tài khoản: Nhấn "Đăng ký" ở góc trên bên phải, điền email và mật khẩu.'
                ]
            },
            {
                heading: 'Bảo mật thông tin',
                paragraphs: [
                    'Holidate cam kết bảo vệ thông tin của bạn:',
                    '• Mã hóa SSL 256-bit cho mọi giao dịch',
                    '• Không chia sẻ thông tin cho bên thứ ba',
                    '• Tuân thủ nghiêm ngặt quy định bảo vệ dữ liệu cá nhân',
                    'Lưu ý: Không bao giờ chia sẻ mật khẩu tài khoản với người khác. Nếu phát hiện hoạt động bất thường, vui lòng liên hệ ngay bộ phận hỗ trợ.'
                ]
            }
        ]
    },
    'khach-san': {
        title: 'Hỗ trợ về Đặt phòng Khách sạn',
        content: [
            {
                heading: 'Tìm kiếm và đặt phòng',
                paragraphs: [
                    'Trên Holidate, bạn có thể dễ dàng tìm kiếm và đặt phòng khách sạn:',
                    '1. Nhập điểm đến, ngày nhận phòng và số khách/phòng vào thanh tìm kiếm',
                    '2. Chọn khách sạn phù hợp từ danh sách kết quả',
                    '3. Xem chi tiết phòng, giá và các tiện ích',
                    '4. Chọn loại phòng và điền thông tin đặt phòng',
                    '5. Thanh toán và nhận email xác nhận'
                ]
            },
            {
                heading: 'Các câu hỏi thường gặp',
                paragraphs: [
                    'Q: Tôi có thể xem ảnh phòng trước khi đặt không?',
                    'A: Có, mỗi khách sạn đều có gallery ảnh phòng, tiện ích và vị trí để bạn tham khảo.',
                    '',
                    'Q: Giá phòng có bao gồm thuế và phí không?',
                    'A: Giá hiển thị đã bao gồm thuế VAT. Các phí khác (nếu có) sẽ được hiển thị rõ ràng trước khi thanh toán.',
                    '',
                    'Q: Tôi có thể đặt phòng cho người khác không?',
                    'A: Có, bạn có thể đặt phòng cho người khác. Vui lòng điền thông tin khách nhận phòng khi đặt.'
                ]
            }
        ]
    },
    'hoat-dong-du-lich': {
        title: 'Hoạt động du lịch',
        content: [
            {
                heading: 'Tours và Hoạt động',
                paragraphs: [
                    'Holidate đang mở rộng dịch vụ để cung cấp các tour và hoạt động du lịch.',
                    'Trong tương lai, bạn sẽ có thể:',
                    '• Đặt tour tham quan',
                    '• Mua vé tham quan điểm du lịch',
                    '• Đặt dịch vụ vận chuyển',
                    '• Thuê hướng dẫn viên',
                    'Hãy theo dõi chúng tôi để cập nhật thông tin mới nhất!'
                ]
            }
        ]
    },
    'dua-don-san-bay': {
        title: 'Đưa đón sân bay',
        content: [
            {
                heading: 'Dịch vụ đưa đón',
                paragraphs: [
                    'Dịch vụ đưa đón sân bay của Holidate giúp bạn di chuyển thuận tiện:',
                    '• Đưa đón từ sân bay đến khách sạn và ngược lại',
                    '• Xe 4-7 chỗ, đầy đủ tiện nghi',
                    '• Tài xế chuyên nghiệp, am hiểu địa hình',
                    '• Giá cả minh bạch, không phát sinh phí',
                    'Để đặt dịch vụ: Chọn "Đưa đón sân bay" khi đặt phòng hoặc liên hệ hotline.'
                ]
            }
        ]
    },
    'holidate-points': {
        title: 'Holidate Points',
        content: [
            {
                heading: 'Tích lũy điểm',
                paragraphs: [
                    'Mỗi đặt phòng thành công, bạn sẽ tích lũy Holidate Points:',
                    '• 1 điểm = 1,000 VNĐ giá trị đặt phòng',
                    '• Tích lũy không giới hạn',
                    '• Điểm không hết hạn',
                    '• Dùng điểm để giảm giá đặt phòng tiếp theo',
                    'Ví dụ: Đặt phòng 2,000,000 VNĐ = 2,000 điểm = giảm 20,000 VNĐ cho đặt phòng tiếp theo'
                ]
            },
            {
                heading: 'Sử dụng điểm',
                paragraphs: [
                    'Bạn có thể dùng điểm khi:',
                    '• Đặt phòng khách sạn mới',
                    '• Thanh toán bằng HolidatePay',
                    '• 1,000 điểm = 10,000 VNĐ giảm giá',
                    'Xem số điểm hiện có trong tài khoản của bạn tại "Tài khoản" > "Holidate Points".'
                ]
            }
        ]
    }
};

export default function ContactDetailPage() {
    const params = useParams();
    const slug = params?.slug as string;
    const content = contactContent[slug];

    if (!content) {
        return (
            <main className={styles.main}>
                <div className={styles.header}>
                    <div className="container text-center">
                        <h1 className="fw-bold">Không tìm thấy trang</h1>
                        <p>Trang bạn tìm kiếm không tồn tại.</p>
                        <Link href="/contact" className="text-primary text-decoration-none">
                            Quay lại Trang Liên hệ
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className={styles.main}>
            <div className={styles.header}>
                <div className="container text-center">
                    <h1 className="fw-bold">{content.title}</h1>
                    <p>Chúng tôi luôn sẵn sàng hỗ trợ bạn</p>
                </div>
            </div>

            <div className="container" style={{ paddingBottom: '50px', paddingTop: '40px' }}>
                <Link href="/contact" className="text-decoration-none text-secondary mb-4 d-inline-block">
                    ← Quay lại Liên hệ chúng tôi
                </Link>

                <div className="card border-0 shadow-sm">
                    <div className="card-body p-4">
                        {content.content.map((section, index) => (
                            <div key={index} className="mb-5">
                                <h2 className="h4 mb-3 fw-bold" style={{ color: '#0ea5e9' }}>
                                    {section.heading}
                                </h2>
                                {section.paragraphs.map((paragraph, pIndex) => (
                                    <p key={pIndex} className="mb-3" style={{ lineHeight: '1.8', color: '#374151' }}>
                                        {paragraph}
                                    </p>
                                ))}
                            </div>
                        ))}

                        <div className="mt-5 pt-4 border-top">
                            <h3 className="h5 mb-3">Cần thêm hỗ trợ?</h3>
                            <p className="mb-3">Nếu bạn vẫn còn thắc mắc, vui lòng liên hệ với chúng tôi:</p>
                            <Link href="/contact" className="btn btn-primary">
                                Liên hệ Hỗ trợ Khách hàng
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

