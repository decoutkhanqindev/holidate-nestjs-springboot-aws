// src/app/operating-regulations/page.tsx

import styles from './OperatingRegulations.module.css';
import Link from 'next/link';

export default function OperatingRegulationsPage() {
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
                        <span className={styles.breadcrumbText}>Quy chế hoạt động</span>
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
                    QUY CHẾ HOẠT ĐỘNG CỦA SÀN GIAO DỊCH THƯƠNG MẠI ĐIỆN TỬ HOLIDATE.COM
                </h1>

                {/* Introduction */}
                <section className={styles.introSection}>
                    <p>
                        Holidate.com là một sàn giao dịch thương mại điện tử hoạt động trong lĩnh vực đặt phòng khách sạn và dịch vụ lưu trú,
                        cung cấp nền tảng trực tuyến để kết nối khách hàng với các nhà cung cấp dịch vụ khách sạn bao gồm khách sạn,
                        resort, căn hộ, homestay và các loại hình lưu trú khác trên toàn Việt Nam và quốc tế.
                    </p>
                    <p>
                        Holidate.com cam kết hỗ trợ khách hàng trong việc tìm kiếm, so sánh và đặt phòng khách sạn một cách nhanh chóng,
                        tiện lợi và an toàn. Chúng tôi không ngừng nỗ lực để mang đến trải nghiệm đặt phòng tốt nhất với giá cả cạnh tranh,
                        thông tin đầy đủ về các khách sạn và dịch vụ khách hàng chuyên nghiệp 24/7.
                    </p>
                    <p>
                        Với mục tiêu trở thành nền tảng đặt phòng khách sạn hàng đầu tại Việt Nam, Holidate.com tập trung vào việc cung cấp
                        đa dạng các lựa chọn khách sạn từ budget đến luxury, hỗ trợ khách hàng tìm được nơi lưu trú phù hợp nhất với nhu cầu
                        và ngân sách của mình, góp phần phát triển ngành du lịch và khách sạn tại Việt Nam một cách bền vững.
                    </p>
                </section>

                {/* Section I */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>I. NGUYÊN TẮC CHUNG</h2>

                    <div className={styles.subsection}>
                        <p className={styles.paragraph}>
                            <span className={styles.subsectionNumber}>1.</span> Holidate.com hoạt động theo quy định của pháp luật Việt Nam về thương mại điện tử,
                            bảo vệ quyền lợi người tiêu dùng và các quy định pháp luật liên quan.
                        </p>
                        <p className={styles.paragraph}>
                            <span className={styles.subsectionNumber}>2.</span> Sàn giao dịch Holidate.com là nền tảng trung gian kết nối giữa Khách hàng (người có nhu cầu
                            đặt phòng khách sạn và sử dụng dịch vụ lưu trú) với Nhà cung cấp (các khách sạn, resort, căn hộ, homestay và các đơn vị cung cấp dịch vụ lưu trú).
                        </p>
                        <p className={styles.paragraph}>
                            <span className={styles.subsectionNumber}>3.</span> Tất cả các giao dịch trên sàn Holidate.com phải tuân thủ các quy định trong Quy chế này,
                            Điều khoản sử dụng dịch vụ và các chính sách khác được công bố trên website.
                        </p>
                        <p className={styles.paragraph}>
                            <span className={styles.subsectionNumber}>4.</span> Holidate.com cam kết bảo mật thông tin cá nhân của Khách hàng và Nhà cung cấp theo quy định
                            của pháp luật về bảo vệ thông tin cá nhân.
                        </p>
                    </div>
                </section>

                {/* Section II */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>II. ĐỐI TƯỢNG ÁP DỤNG</h2>

                    <div className={styles.subsection}>
                        <p className={styles.paragraph}>
                            <span className={styles.subsectionNumber}>1.</span> <b>Khách hàng:</b> Là các cá nhân, tổ chức có nhu cầu tìm kiếm, đặt phòng khách sạn và sử dụng dịch vụ
                            lưu trú thông qua sàn giao dịch Holidate.com. Khách hàng phải đủ 18 tuổi trở lên hoặc có người đại diện hợp pháp khi thực hiện giao dịch đặt phòng.
                        </p>
                        <p className={styles.paragraph}>
                            <span className={styles.subsectionNumber}>2.</span> <b>Nhà cung cấp:</b> Là các khách sạn, resort, căn hộ, homestay và các đơn vị cung cấp dịch vụ lưu trú có đầy đủ tư cách pháp nhân,
                            có giấy phép kinh doanh và đã đăng ký, được chấp nhận trở thành đối tác của Holidate.com.
                        </p>
                        <p className={styles.paragraph}>
                            <span className={styles.subsectionNumber}>3.</span> <b>Holidate.com:</b> Là Công ty Cổ phần Công nghệ Holidate, đơn vị vận hành và quản lý sàn
                            giao dịch thương mại điện tử Holidate.com.
                        </p>
                    </div>
                </section>

                {/* Section III */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>III. QUYỀN VÀ NGHĨA VỤ CỦA KHÁCH HÀNG</h2>

                    <div className={styles.subsection}>
                        <p className={styles.paragraph}>
                            <span className={styles.subsectionNumber}>1.</span> <b>Quyền của Khách hàng:</b>
                        </p>
                        <div className={styles.nestedList}>
                            <p className={styles.listItem}>
                                <span className={styles.listLetter}>a)</span> Được tìm kiếm, xem thông tin chi tiết về các khách sạn, giá phòng, tiện ích và đánh giá trên sàn Holidate.com;
                            </p>
                            <p className={styles.listItem}>
                                <span className={styles.listLetter}>b)</span> Được so sánh giá cả, tiện ích, vị trí và đánh giá từ các khách hàng đã từng ở tại khách sạn;
                            </p>
                            <p className={styles.listItem}>
                                <span className={styles.listLetter}>c)</span> Được đặt phòng khách sạn và thanh toán một cách an toàn thông qua các phương thức thanh toán được hỗ trợ;
                            </p>
                            <p className={styles.listItem}>
                                <span className={styles.listLetter}>d)</span> Được hủy hoặc thay đổi đặt phòng theo chính sách hủy phòng của từng khách sạn;
                            </p>
                            <p className={styles.listItem}>
                                <span className={styles.listLetter}>e)</span> Được nhận hỗ trợ từ bộ phận chăm sóc khách hàng của Holidate.com về mọi vấn đề liên quan đến đặt phòng;
                            </p>
                            <p className={styles.listItem}>
                                <span className={styles.listLetter}>f)</span> Được bảo vệ thông tin cá nhân và thông tin thanh toán theo chính sách bảo mật của Holidate.com.
                            </p>
                        </div>
                        <p className={styles.paragraph}>
                            <span className={styles.subsectionNumber}>2.</span> <b>Nghĩa vụ của Khách hàng:</b>
                        </p>
                        <div className={styles.nestedList}>
                            <p className={styles.listItem}>
                                <span className={styles.listLetter}>a)</span> Cung cấp thông tin chính xác, đầy đủ khi đăng ký tài khoản và thực hiện đặt phòng;
                            </p>
                            <p className={styles.listItem}>
                                <span className={styles.listLetter}>b)</span> Thanh toán đầy đủ và đúng hạn theo quy định của đơn đặt phòng;
                            </p>
                            <p className={styles.listItem}>
                                <span className={styles.listLetter}>c)</span> Tuân thủ các quy định của Nhà cung cấp tại cơ sở lưu trú;
                            </p>
                            <p className={styles.listItem}>
                                <span className={styles.listLetter}>d)</span> Không sử dụng sàn Holidate.com cho các mục đích bất hợp pháp hoặc vi phạm quy định pháp luật;
                            </p>
                            <p className={styles.listItem}>
                                <span className={styles.listLetter}>e)</span> Bồi thường thiệt hại nếu gây ra tổn thất cho Holidate.com, Nhà cung cấp hoặc bên thứ ba do vi phạm quy định.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Section IV */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>IV. QUYỀN VÀ NGHĨA VỤ CỦA NHÀ CUNG CẤP</h2>

                    <div className={styles.subsection}>
                        <p className={styles.paragraph}>
                            <span className={styles.subsectionNumber}>1.</span> <b>Quyền của Nhà cung cấp:</b>
                        </p>
                        <div className={styles.nestedList}>
                            <p className={styles.listItem}>
                                <span className={styles.listLetter}>a)</span> Được đăng ký và quản lý thông tin cơ sở lưu trú trên sàn Holidate.com;
                            </p>
                            <p className={styles.listItem}>
                                <span className={styles.listLetter}>b)</span> Được quản lý giá cả, chính sách hủy phòng và các điều kiện khác của dịch vụ;
                            </p>
                            <p className={styles.listItem}>
                                <span className={styles.listLetter}>c)</span> Được nhận thanh toán từ Holidate.com theo thỏa thuận;
                            </p>
                            <p className={styles.listItem}>
                                <span className={styles.listLetter}>d)</span> Được hỗ trợ kỹ thuật và tư vấn từ Holidate.com;
                            </p>
                            <p className={styles.listItem}>
                                <span className={styles.listLetter}>e)</span> Được từ chối đặt phòng trong trường hợp không đáp ứng đủ điều kiện.
                            </p>
                        </div>
                        <p className={styles.paragraph}>
                            <span className={styles.subsectionNumber}>2.</span> <b>Nghĩa vụ của Nhà cung cấp:</b>
                        </p>
                        <div className={styles.nestedList}>
                            <p className={styles.listItem}>
                                <span className={styles.listLetter}>a)</span> Cung cấp đầy đủ, chính xác thông tin về cơ sở lưu trú, giá cả và các điều kiện dịch vụ;
                            </p>
                            <p className={styles.listItem}>
                                <span className={styles.listLetter}>b)</span> Đảm bảo chất lượng dịch vụ đúng như cam kết đã công bố trên sàn;
                            </p>
                            <p className={styles.listItem}>
                                <span className={styles.listLetter}>c)</span> Xác nhận và giữ chỗ cho Khách hàng đã đặt phòng thành công;
                            </p>
                            <p className={styles.listItem}>
                                <span className={styles.listLetter}>d)</span> Tuân thủ chính sách hủy và hoàn tiền đã cam kết;
                            </p>
                            <p className={styles.listItem}>
                                <span className={styles.listLetter}>e)</span> Thanh toán phí dịch vụ cho Holidate.com theo thỏa thuận hợp tác;
                            </p>
                            <p className={styles.listItem}>
                                <span className={styles.listLetter}>f)</span> Xử lý khiếu nại của Khách hàng một cách nhanh chóng và thỏa đáng.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Section V */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>V. QUY TRÌNH GIAO DỊCH</h2>

                    <div className={styles.subsection}>
                        <p className={styles.paragraph}>
                            <span className={styles.subsectionNumber}>1.</span> <b>Tìm kiếm và lựa chọn:</b> Khách hàng tìm kiếm khách sạn theo địa điểm, ngày nhận phòng, ngày trả phòng và số lượng khách trên sàn Holidate.com.
                        </p>
                        <p className={styles.paragraph}>
                            <span className={styles.subsectionNumber}>2.</span> <b>Xem thông tin chi tiết:</b> Khách hàng xem thông tin chi tiết về khách sạn, giá phòng, tiện ích, hình ảnh và đánh giá từ khách hàng trước đó.
                        </p>
                        <p className={styles.paragraph}>
                            <span className={styles.subsectionNumber}>3.</span> <b>Đặt phòng:</b> Khách hàng điền thông tin đặt phòng (họ tên, số điện thoại, email) và chọn phương thức thanh toán.
                        </p>
                        <p className={styles.paragraph}>
                            <span className={styles.subsectionNumber}>4.</span> <b>Xác nhận:</b> Holidate.com gửi xác nhận đặt phòng qua email và tin nhắn sau khi thanh toán thành công, bao gồm thông tin khách sạn và mã đặt phòng.
                        </p>
                        <p className={styles.paragraph}>
                            <span className={styles.subsectionNumber}>5.</span> <b>Nhận phòng:</b> Khách hàng đến khách sạn và xuất trình thông tin đặt phòng để nhận phòng theo đúng ngày đã đặt.
                        </p>
                        <p className={styles.paragraph}>
                            <span className={styles.subsectionNumber}>6.</span> <b>Thanh toán với Nhà cung cấp:</b> Holidate.com thực hiện thanh toán cho khách sạn theo thỏa thuận hợp tác và thời gian quy định.
                        </p>
                    </div>
                </section>

                {/* Section VI */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>VI. CHÍNH SÁCH HỦY VÀ HOÀN TIỀN</h2>

                    <div className={styles.subsection}>
                        <p className={styles.paragraph}>
                            <span className={styles.subsectionNumber}>1.</span> Chính sách hủy và hoàn tiền được áp dụng theo quy định riêng của từng khách sạn, được công bố rõ ràng
                            trên trang thông tin của từng khách sạn trên sàn Holidate.com.
                        </p>
                        <p className={styles.paragraph}>
                            <span className={styles.subsectionNumber}>2.</span> Holidate.com không chịu trách nhiệm về việc hoàn tiền, mà chỉ đóng vai trò trung gian hỗ trợ xử lý theo chính sách
                            hủy phòng của khách sạn và thỏa thuận với Khách hàng.
                        </p>
                        <p className={styles.paragraph}>
                            <span className={styles.subsectionNumber}>3.</span> Trong trường hợp Khách hàng hủy đặt phòng, thời gian hoàn tiền (nếu có) sẽ được thực hiện theo chính sách hủy phòng của khách sạn
                            (miễn phí hủy, hủy có phí, không hoàn tiền) và phương thức thanh toán ban đầu. Khách hàng vui lòng xem kỹ chính sách hủy phòng trước khi đặt.
                        </p>
                    </div>
                </section>

                {/* Section VII */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>VII. GIẢI QUYẾT KHIẾU NẠI</h2>

                    <div className={styles.subsection}>
                        <p className={styles.paragraph}>
                            <span className={styles.subsectionNumber}>1.</span> Khách hàng hoặc Nhà cung cấp có quyền khiếu nại về các vấn đề liên quan đến giao dịch trên sàn Holidate.com
                            thông qua các kênh liên hệ chính thức của Holidate.com.
                        </p>
                        <p className={styles.paragraph}>
                            <span className={styles.subsectionNumber}>2.</span> Holidate.com cam kết xử lý khiếu nại trong thời gian 15 ngày làm việc kể từ ngày nhận được khiếu nại hợp lệ.
                        </p>
                        <p className={styles.paragraph}>
                            <span className={styles.subsectionNumber}>3.</span> Trong trường hợp không giải quyết được thỏa đáng, các bên có quyền yêu cầu cơ quan có thẩm quyền giải quyết theo quy định pháp luật.
                        </p>
                    </div>
                </section>

                {/* Section VIII */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>VIII. ĐIỀU KHOẢN CHUNG</h2>

                    <div className={styles.subsection}>
                        <p className={styles.paragraph}>
                            <span className={styles.subsectionNumber}>1.</span> Quy chế này có hiệu lực từ ngày được công bố trên website Holidate.com và có thể được điều chỉnh, bổ sung theo quy định pháp luật.
                        </p>
                        <p className={styles.paragraph}>
                            <span className={styles.subsectionNumber}>2.</span> Mọi tranh chấp phát sinh sẽ được giải quyết theo pháp luật Việt Nam, thông qua thương lượng, hòa giải hoặc Tòa án có thẩm quyền.
                        </p>
                        <p className={styles.paragraph}>
                            <span className={styles.subsectionNumber}>3.</span> Holidate.com có quyền từ chối, tạm ngưng hoặc chấm dứt cung cấp dịch vụ đối với Khách hàng hoặc Nhà cung cấp vi phạm Quy chế này.
                        </p>
                        <p className={styles.paragraph}>
                            <span className={styles.subsectionNumber}>4.</span> Mọi thông tin liên hệ và hỗ trợ được công bố trên website Holidate.com là kênh liên hệ chính thức.
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

