// src/app/privacy/page.tsx

import styles from './Privacy.module.css';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
    const currentDate = new Date();
    const formattedDate = `TP. Hồ Chí Minh, ngày ${currentDate.getDate()} tháng ${currentDate.getMonth() + 1} năm ${currentDate.getFullYear()}`;

    return (
        <div className={styles.pageWrapper}>
            {/* Top Header with Breadcrumb */}
            <header className={styles.topHeader}>
                <div className={styles.headerContainer}>
                    <div className={styles.breadcrumb}>
                        <Link href="/" className={styles.homeLink}>
                            <svg className={styles.homeIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </Link>
                        <span className={styles.breadcrumbSeparator}>/</span>
                        <span className={styles.breadcrumbText}>Chính sách bảo mật</span>
                    </div>
                </div>
            </header>

            <div className={styles.documentContainer}>
                {/* Header with company info and Republic info */}
                <header className={styles.documentHeader}>
                    <div className={styles.companyInfo}>
                        <p className={styles.companyType}>Công Ty Cổ Phần Công Nghệ</p>
                        <p className={styles.companyName}>Holidate.com</p>
                    </div>
                    <div className={styles.republicInfo}>
                        <p className={styles.republicTitle}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                        <p className={styles.republicMotto}>Độc lập - Tự do - Hạnh phúc</p>
                    </div>
                </header>

                {/* Document number and date */}
                <div className={styles.documentMeta}>
                    <div className={styles.documentNumber}>
                        <p>Số: /</p>
                    </div>
                    <div className={styles.documentDate}>
                        <p>{formattedDate}</p>
                    </div>
                </div>

                {/* Main Title */}
                <h1 className={styles.mainTitle}>
                    CHÍNH SÁCH BẢO MẬT THÔNG TIN
                </h1>

                {/* Introduction */}
                <section className={styles.introSection}>
                    <p>
                        Chính sách Bảo mật này mô tả cách Holidate.com ("chúng tôi", "Holidate" hoặc "Công ty") thu thập, sử dụng,
                        lưu trữ và bảo vệ thông tin cá nhân của khách hàng khi sử dụng website www.holidate.com và các dịch vụ đặt phòng khách sạn
                        của chúng tôi.
                    </p>
                    <p>
                        Holidate.com cam kết bảo vệ quyền riêng tư và thông tin cá nhân của khách hàng. Chúng tôi tuân thủ các quy định của pháp luật
                        Việt Nam về bảo vệ thông tin cá nhân, bao gồm Luật An toàn Thông tin mạng và các quy định liên quan.
                    </p>
                    <p>
                        Bằng việc sử dụng dịch vụ của Holidate.com, bạn đồng ý với các thực hành được mô tả trong Chính sách Bảo mật này.
                        Vui lòng đọc kỹ Chính sách này và kiểm tra thường xuyên để cập nhật các thay đổi.
                    </p>
                </section>

                {/* Section I */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>I. THÔNG TIN CHÚNG TÔI THU THẬP</h2>

                    <div className={styles.subsection}>
                        <p className={styles.paragraph}>
                            <span className={styles.subsectionNumber}>1.</span> <b>Thông tin bạn cung cấp trực tiếp:</b>
                        </p>
                        <div className={styles.nestedList}>
                            <p className={styles.listItem}>
                                <span className={styles.listLetter}>a)</span> <b>Thông tin đăng ký tài khoản:</b> Họ tên, địa chỉ email, số điện thoại, mật khẩu khi bạn đăng ký tài khoản trên Holidate.com;
                            </p>
                            <p className={styles.listItem}>
                                <span className={styles.listLetter}>b)</span> <b>Thông tin đặt phòng:</b> Tên người đặt phòng, số điện thoại, email, thông tin thanh toán, yêu cầu đặc biệt khi bạn đặt phòng khách sạn;
                            </p>
                            <p className={styles.listItem}>
                                <span className={styles.listLetter}>c)</span> <b>Thông tin thanh toán:</b> Thông tin thẻ tín dụng/thẻ ghi nợ, thông tin tài khoản ngân hàng, địa chỉ thanh toán (chúng tôi không lưu trữ số CVV và mã PIN);
                            </p>
                            <p className={styles.listItem}>
                                <span className={styles.listLetter}>d)</span> <b>Thông tin liên hệ:</b> Khi bạn liên hệ với bộ phận chăm sóc khách hàng của chúng tôi qua email, điện thoại hoặc các kênh khác;
                            </p>
                            <p className={styles.listItem}>
                                <span className={styles.listLetter}>e)</span> <b>Đánh giá và phản hồi:</b> Khi bạn để lại đánh giá, bình luận hoặc phản hồi về dịch vụ, khách sạn trên website của chúng tôi.
                            </p>
                        </div>
                        <p className={styles.paragraph}>
                            <span className={styles.subsectionNumber}>2.</span> <b>Thông tin tự động thu thập:</b>
                        </p>
                        <div className={styles.nestedList}>
                            <p className={styles.listItem}>
                                <span className={styles.listLetter}>a)</span> <b>Thông tin thiết bị:</b> Địa chỉ IP, loại trình duyệt, hệ điều hành, loại thiết bị (máy tính, điện thoại, tablet);
                            </p>
                            <p className={styles.listItem}>
                                <span className={styles.listLetter}>b)</span> <b>Thông tin truy cập:</b> URL trang web bạn truy cập, thời gian truy cập, trang web bạn đến từ đó, các trang bạn xem;
                            </p>
                            <p className={styles.listItem}>
                                <span className={styles.listLetter}>c)</span> <b>Cookies và công nghệ tương tự:</b> Chúng tôi sử dụng cookies, web beacons và các công nghệ tương tự để thu thập thông tin về cách bạn sử dụng website của chúng tôi.
                            </p>
                        </div>
                        <p className={styles.paragraph}>
                            <span className={styles.subsectionNumber}>3.</span> <b>Thông tin từ bên thứ ba:</b> Chúng tôi có thể nhận thông tin về bạn từ các đối tác khách sạn, các dịch vụ thanh toán, các mạng xã hội khi bạn đăng nhập thông qua tài khoản mạng xã hội.
                        </p>
                    </div>
                </section>

                {/* Section II */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>II. MỤC ĐÍCH SỬ DỤNG THÔNG TIN</h2>

                    <div className={styles.subsection}>
                        <p className={styles.paragraph}>
                            <span className={styles.subsectionNumber}>1.</span> <b>Để cung cấp và cải thiện dịch vụ:</b>
                        </p>
                        <div className={styles.nestedList}>
                            <p className={styles.listItem}>
                                <span className={styles.listLetter}>a)</span> Xử lý và hoàn tất đặt phòng khách sạn của bạn;
                            </p>
                            <p className={styles.listItem}>
                                <span className={styles.listLetter}>b)</span> Gửi xác nhận đặt phòng, thông tin khách sạn và mã đặt phòng;
                            </p>
                            <p className={styles.listItem}>
                                <span className={styles.listLetter}>c)</span> Liên lạc với bạn về đặt phòng, thay đổi hoặc hủy đặt phòng;
                            </p>
                            <p className={styles.listItem}>
                                <span className={styles.listLetter}>d)</span> Cải thiện và tối ưu hóa trải nghiệm người dùng trên website;
                            </p>
                            <p className={styles.listItem}>
                                <span className={styles.listLetter}>e)</span> Phân tích và nghiên cứu để phát triển dịch vụ mới.
                            </p>
                        </div>
                        <p className={styles.paragraph}>
                            <span className={styles.subsectionNumber}>2.</span> <b>Để giao tiếp với khách hàng:</b>
                        </p>
                        <div className={styles.nestedList}>
                            <p className={styles.listItem}>
                                <span className={styles.listLetter}>a)</span> Phản hồi các câu hỏi, yêu cầu và khiếu nại của bạn;
                            </p>
                            <p className={styles.listItem}>
                                <span className={styles.listLetter}>b)</span> Gửi thông tin về chương trình khuyến mãi, ưu đãi đặc biệt (nếu bạn đã đăng ký nhận);
                            </p>
                            <p className={styles.listItem}>
                                <span className={styles.listLetter}>c)</span> Thông báo về thay đổi trong các điều khoản, chính sách hoặc dịch vụ của chúng tôi.
                            </p>
                        </div>
                        <p className={styles.paragraph}>
                            <span className={styles.subsectionNumber}>3.</span> <b>Để bảo vệ quyền lợi và an toàn:</b>
                        </p>
                        <div className={styles.nestedList}>
                            <p className={styles.listItem}>
                                <span className={styles.listLetter}>a)</span> Ngăn chặn gian lận, lừa đảo và các hoạt động bất hợp pháp;
                            </p>
                            <p className={styles.listItem}>
                                <span className={styles.listLetter}>b)</span> Bảo vệ quyền và tài sản của Holidate.com, khách hàng và đối tác;
                            </p>
                            <p className={styles.listItem}>
                                <span className={styles.listLetter}>c)</span> Tuân thủ các yêu cầu pháp lý và quy định của cơ quan có thẩm quyền.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Section III */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>III. CHIA SẺ THÔNG TIN</h2>

                    <div className={styles.subsection}>
                        <p className={styles.paragraph}>
                            <span className={styles.subsectionNumber}>1.</span> Chúng tôi không bán, cho thuê hoặc chuyển giao thông tin cá nhân của bạn cho bên thứ ba để họ tiếp thị hoặc sử dụng cho mục đích khác ngoài mục đích được mô tả trong Chính sách này.
                        </p>
                        <p className={styles.paragraph}>
                            <span className={styles.subsectionNumber}>2.</span> Chúng tôi có thể chia sẻ thông tin của bạn với:
                        </p>
                        <div className={styles.nestedList}>
                            <p className={styles.listItem}>
                                <span className={styles.listLetter}>a)</span> <b>Nhà cung cấp dịch vụ:</b> Các khách sạn, resort, căn hộ mà bạn đặt phòng để hoàn tất việc đặt phòng và cung cấp dịch vụ;
                            </p>
                            <p className={styles.listItem}>
                                <span className={styles.listLetter}>b)</span> <b>Đối tác thanh toán:</b> Các đơn vị xử lý thanh toán để xử lý giao dịch thanh toán của bạn một cách an toàn;
                            </p>
                            <p className={styles.listItem}>
                                <span className={styles.listLetter}>c)</span> <b>Nhà cung cấp dịch vụ công nghệ:</b> Các công ty cung cấp dịch vụ lưu trữ dữ liệu, phân tích, email, hỗ trợ khách hàng cho chúng tôi;
                            </p>
                            <p className={styles.listItem}>
                                <span className={styles.listLetter}>d)</span> <b>Cơ quan pháp luật:</b> Khi được yêu cầu bởi pháp luật, tòa án hoặc cơ quan nhà nước có thẩm quyền.
                            </p>
                        </div>
                        <p className={styles.paragraph}>
                            <span className={styles.subsectionNumber}>3.</span> Trong trường hợp Holidate.com tham gia vào việc sáp nhập, mua lại hoặc bán tài sản, thông tin cá nhân của bạn có thể được chuyển giao như một phần của giao dịch đó.
                        </p>
                    </div>
                </section>

                {/* Section IV */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>IV. BẢO MẬT THÔNG TIN</h2>

                    <div className={styles.subsection}>
                        <p className={styles.paragraph}>
                            <span className={styles.subsectionNumber}>1.</span> Chúng tôi áp dụng các biện pháp bảo mật kỹ thuật và tổ chức phù hợp để bảo vệ thông tin cá nhân của bạn khỏi việc truy cập, sử dụng, tiết lộ, thay đổi hoặc phá hủy trái phép.
                        </p>
                        <p className={styles.paragraph}>
                            <span className={styles.subsectionNumber}>2.</span> Các biện pháp bảo mật bao gồm:
                        </p>
                        <div className={styles.nestedList}>
                            <p className={styles.listItem}>
                                <span className={styles.listLetter}>a)</span> Mã hóa dữ liệu khi truyền qua internet bằng công nghệ SSL/TLS;
                            </p>
                            <p className={styles.listItem}>
                                <span className={styles.listLetter}>b)</span> Lưu trữ dữ liệu trên các máy chủ an toàn với hệ thống tường lửa và kiểm soát truy cập;
                            </p>
                            <p className={styles.listItem}>
                                <span className={styles.listLetter}>c)</span> Không lưu trữ thông tin thẻ tín dụng đầy đủ trên hệ thống của chúng tôi;
                            </p>
                            <p className={styles.listItem}>
                                <span className={styles.listLetter}>d)</span> Hạn chế quyền truy cập vào thông tin cá nhân chỉ cho nhân viên, đối tác và nhà cung cấp dịch vụ cần thiết;
                            </p>
                            <p className={styles.listItem}>
                                <span className={styles.listLetter}>e)</span> Thường xuyên rà soát và cập nhật các biện pháp bảo mật.
                            </p>
                        </div>
                        <p className={styles.paragraph}>
                            <span className={styles.subsectionNumber}>3.</span> Tuy nhiên, không có phương thức truyền tải qua internet hoặc phương thức lưu trữ điện tử nào là 100% an toàn. Chúng tôi không thể đảm bảo an toàn tuyệt đối cho thông tin của bạn.
                        </p>
                    </div>
                </section>

                {/* Section V */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>V. QUYỀN CỦA BẠN ĐỐI VỚI THÔNG TIN CÁ NHÂN</h2>

                    <div className={styles.subsection}>
                        <p className={styles.paragraph}>
                            <span className={styles.subsectionNumber}>1.</span> Bạn có các quyền sau đối với thông tin cá nhân của mình:
                        </p>
                        <div className={styles.nestedList}>
                            <p className={styles.listItem}>
                                <span className={styles.listLetter}>a)</span> <b>Quyền truy cập:</b> Yêu cầu xem và nhận bản sao thông tin cá nhân mà chúng tôi lưu trữ về bạn;
                            </p>
                            <p className={styles.listItem}>
                                <span className={styles.listLetter}>b)</span> <b>Quyền chỉnh sửa:</b> Yêu cầu cập nhật, sửa đổi thông tin cá nhân không chính xác hoặc không đầy đủ;
                            </p>
                            <p className={styles.listItem}>
                                <span className={styles.listLetter}>c)</span> <b>Quyền xóa:</b> Yêu cầu xóa thông tin cá nhân của bạn trong các trường hợp được pháp luật cho phép;
                            </p>
                            <p className={styles.listItem}>
                                <span className={styles.listLetter}>d)</span> <b>Quyền từ chối:</b> Từ chối việc xử lý thông tin cá nhân cho một số mục đích nhất định;
                            </p>
                            <p className={styles.listItem}>
                                <span className={styles.listLetter}>e)</span> <b>Quyền rút lại đồng ý:</b> Rút lại sự đồng ý đã cung cấp trước đó cho việc xử lý thông tin cá nhân.
                            </p>
                        </div>
                        <p className={styles.paragraph}>
                            <span className={styles.subsectionNumber}>2.</span> Để thực hiện các quyền trên, bạn có thể liên hệ với chúng tôi qua email support@holidate.com hoặc qua số điện thoại hỗ trợ khách hàng. Chúng tôi sẽ xử lý yêu cầu của bạn trong thời gian hợp lý.
                        </p>
                    </div>
                </section>

                {/* Section VI */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>VI. COOKIES VÀ CÔNG NGHỆ TƯƠNG TỰ</h2>

                    <div className={styles.subsection}>
                        <p className={styles.paragraph}>
                            <span className={styles.subsectionNumber}>1.</span> Chúng tôi sử dụng cookies và các công nghệ tương tự để:
                        </p>
                        <div className={styles.nestedList}>
                            <p className={styles.listItem}>
                                <span className={styles.listLetter}>a)</span> Ghi nhớ thông tin đăng nhập và tùy chọn của bạn;
                            </p>
                            <p className={styles.listItem}>
                                <span className={styles.listLetter}>b)</span> Phân tích cách bạn sử dụng website để cải thiện trải nghiệm;
                            </p>
                            <p className={styles.listItem}>
                                <span className={styles.listLetter}>c)</span> Hiển thị nội dung và quảng cáo phù hợp với sở thích của bạn;
                            </p>
                            <p className={styles.listItem}>
                                <span className={styles.listLetter}>d)</span> Đảm bảo bảo mật và ngăn chặn gian lận.
                            </p>
                        </div>
                        <p className={styles.paragraph}>
                            <span className={styles.subsectionNumber}>2.</span> Bạn có thể kiểm soát và quản lý cookies thông qua cài đặt trình duyệt của mình. Tuy nhiên, việc vô hiệu hóa cookies có thể ảnh hưởng đến chức năng của website.
                        </p>
                    </div>
                </section>

                {/* Section VII */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>VII. LƯU TRỮ THÔNG TIN</h2>

                    <div className={styles.subsection}>
                        <p className={styles.paragraph}>
                            <span className={styles.subsectionNumber}>1.</span> Chúng tôi lưu trữ thông tin cá nhân của bạn trong thời gian cần thiết để thực hiện các mục đích được mô tả trong Chính sách này, trừ khi pháp luật yêu cầu hoặc cho phép lưu trữ lâu hơn.
                        </p>
                        <p className={styles.paragraph}>
                            <span className={styles.subsectionNumber}>2.</span> Khi thông tin cá nhân không còn cần thiết, chúng tôi sẽ xóa hoặc vô danh hóa thông tin đó một cách an toàn theo các quy định pháp luật.
                        </p>
                    </div>
                </section>

                {/* Section VIII */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>VIII. THAY ĐỔI CHÍNH SÁCH BẢO MẬT</h2>

                    <div className={styles.subsection}>
                        <p className={styles.paragraph}>
                            <span className={styles.subsectionNumber}>1.</span> Chúng tôi có thể cập nhật Chính sách Bảo mật này theo thời gian để phản ánh các thay đổi trong thực tiễn của chúng tôi hoặc vì các lý do pháp lý, vận hành hoặc lý do khác.
                        </p>
                        <p className={styles.paragraph}>
                            <span className={styles.subsectionNumber}>2.</span> Khi có thay đổi quan trọng, chúng tôi sẽ thông báo cho bạn qua email hoặc thông báo nổi bật trên website. Ngày "Sửa đổi lần cuối" ở đầu Chính sách này sẽ được cập nhật tương ứng.
                        </p>
                        <p className={styles.paragraph}>
                            <span className={styles.subsectionNumber}>3.</span> Việc bạn tiếp tục sử dụng dịch vụ sau khi Chính sách được cập nhật có nghĩa là bạn chấp nhận các thay đổi đó.
                        </p>
                    </div>
                </section>

                {/* Section IX */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>IX. LIÊN HỆ</h2>

                    <div className={styles.subsection}>
                        <p className={styles.paragraph}>
                            <span className={styles.subsectionNumber}>1.</span> Nếu bạn có bất kỳ câu hỏi, yêu cầu hoặc khiếu nại nào về Chính sách Bảo mật này hoặc cách chúng tôi xử lý thông tin cá nhân của bạn, vui lòng liên hệ với chúng tôi:
                        </p>
                        <div className={styles.nestedList}>
                            <p className={styles.listItem}>
                                <span className={styles.listLetter}>a)</span> <b>Email:</b> support@holidate.com
                            </p>
                            <p className={styles.listItem}>
                                <span className={styles.listLetter}>b)</span> <b>Điện thoại:</b> 028-7301-2468
                            </p>
                            <p className={styles.listItem}>
                                <span className={styles.listLetter}>c)</span> <b>Địa chỉ:</b> Thành phố Hồ Chí Minh, Việt Nam
                            </p>
                        </div>
                        <p className={styles.paragraph}>
                            <span className={styles.subsectionNumber}>2.</span> Chúng tôi cam kết giải quyết các yêu cầu và khiếu nại của bạn một cách nhanh chóng và thỏa đáng.
                        </p>
                    </div>
                </section>

                {/* Footer */}
                <footer className={styles.footer}>
                    <div className={styles.footerSection}>
                        <p className={styles.footerTitle}>Công ty Cổ phần Công nghệ Holidate</p>
                        <p>Địa chỉ: Thành phố Hồ Chí Minh, Việt Nam</p>
                        <p>Email: support@holidate.com</p>
                        <p>Điện thoại: 028-7301-2468</p>
                    </div>
                </footer>
            </div>
        </div>
    );
}

