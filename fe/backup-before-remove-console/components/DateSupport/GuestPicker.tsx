

// 'use client';

// import { useState } from 'react';
// import styles from './GuestPicker.module.css';

// interface GuestPickerProps {
//     adults: number;
//     children: number;
//     rooms: number;
//     onApply: (adults: number, children: number, rooms: number) => void;
// }

// const GuestPicker: React.FC<GuestPickerProps> = ({ adults, children, rooms, onApply }) => {
//     const [currentAdults, setCurrentAdults] = useState(adults);
//     const [currentChildren, setCurrentChildren] = useState(children);
//     const [currentRooms, setCurrentRooms] = useState(rooms);

//     const handleApply = () => {
//         onApply(currentAdults, currentChildren, currentRooms);
//     };

//     return (
//         <div className={styles.pickerContainer}>
//             <div className={styles.pickerRow}>
//                 <div className={styles.label}>
//                     <i className="bi bi-people-fill"></i>
//                     <span>Người lớn</span>
//                 </div>
//                 <div className={styles.counter}>
//                     <button onClick={() => setCurrentAdults(p => Math.max(1, p - 1))} disabled={currentAdults <= 1}>-</button>
//                     <span>{currentAdults}</span>
//                     <button onClick={() => setCurrentAdults(p => p + 1)}>+</button>
//                 </div>
//             </div>
//             <div className={styles.pickerRow}>
//                 <div className={styles.label}>
//                     <i className="bi bi-person-standing"></i>
//                     <span>Trẻ em</span>
//                 </div>
//                 <div className={styles.counter}>
//                     <button onClick={() => setCurrentChildren(p => Math.max(0, p - 1))} disabled={currentChildren <= 0}>-</button>
//                     <span>{currentChildren}</span>
//                     <button onClick={() => setCurrentChildren(p => p + 1)}>+</button>
//                 </div>
//             </div>
//             <div className={styles.pickerRow}>
//                 <div className={styles.label}>
//                     <i className="bi bi-door-open-fill"></i>
//                     <span>Phòng</span>
//                 </div>
//                 <div className={styles.counter}>
//                     <button onClick={() => setCurrentRooms(p => Math.max(1, p - 1))} disabled={currentRooms <= 1}>-</button>
//                     <span>{currentRooms}</span>
//                     <button onClick={() => setCurrentRooms(p => p + 1)}>+</button>
//                 </div>
//             </div>
//             <div className={styles.buttonWrapper}>
//                 <button onClick={handleApply} className={styles.applyButton}>Xong</button>
//             </div>
//         </div>
//     );
// };

// export default GuestPicker;
'use client';

import { useState, useEffect } from 'react';
import styles from './GuestPicker.module.css';

interface GuestPickerProps {
    adults: number;
    children: number;
    rooms: number;
    setAdults: (updater: (prev: number) => number) => void;
    setChildren: (updater: (prev: number) => number) => void;
    setRooms: (updater: (prev: number) => number) => void;
    onClose: () => void;
}

const GuestPicker: React.FC<GuestPickerProps> = ({
    adults,
    children,
    rooms,
    setAdults,
    setChildren,
    setRooms,
    onClose
}) => {
    const [error, setError] = useState('');

    const handleIncreaseRooms = () => {
        if (rooms < adults) {
            setRooms(r => r + 1);
        } else {
            setError('Số phòng không thể nhiều hơn số khách người lớn');
            setTimeout(() => setError(''), 3000);
        }
    };

    useEffect(() => {
        if (rooms > adults) {
            setRooms(() => adults); // Tự động giảm số phòng nếu số người lớn giảm
        }
        if (error) {
            setError('');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [adults]);

    return (
        <div className={styles.pickerContainer}>
            {error && <div className={styles.errorBanner}>{error}</div>}

            <div className={styles.pickerRow}>
                <div className={styles.label}>
                    <i className="bi bi-people-fill"></i>
                    <span>Người lớn</span>
                </div>
                <div className={styles.counter}>
                    <button type="button" onClick={() => setAdults(p => Math.max(1, p - 1))} disabled={adults <= 1}>-</button>
                    <span>{adults}</span>
                    <button type="button" onClick={() => setAdults(p => p + 1)}>+</button>
                </div>
            </div>
            <div className={styles.pickerRow}>
                <div className={styles.label}>
                    <i className="bi bi-person-standing"></i>
                    <span>Trẻ em</span>
                </div>
                <div className={styles.counter}>
                    <button type="button" onClick={() => setChildren(p => Math.max(0, p - 1))} disabled={children <= 0}>-</button>
                    <span>{children}</span>
                    <button type="button" onClick={() => setChildren(p => p + 1)}>+</button>
                </div>
            </div>
            <div className={styles.pickerRow}>
                <div className={styles.label}>
                    <i className="bi bi-door-open-fill"></i>
                    <span>Phòng</span>
                </div>
                <div className={styles.counter}>
                    <button type="button" onClick={() => setRooms(p => Math.max(1, p - 1))} disabled={rooms <= 1}>-</button>
                    <span>{rooms}</span>
                    <button type="button" onClick={handleIncreaseRooms}>+</button>
                </div>
            </div>
            <div className={styles.buttonWrapper}>
                {/* Nút Xong bây giờ chỉ có nhiệm vụ đóng pop-up */}
                <button type="button" onClick={onClose} className={styles.applyButton}>Xong</button>
            </div>
        </div>
    );
};

export default GuestPicker;
/// trên là phiên bảm set get
// src/components/DateSupport/GuestPicker.tsx

// 'use client';

// import { useState, useEffect } from 'react';
// import styles from './GuestPicker.module.css';

// interface GuestPickerProps {
//     initialAdults: number;
//     initialChildren: number;
//     initialRooms: number;
//     onApply: (data: { adults: number; children: number; rooms: number }) => void;
//     onClose: () => void;
// }

// const GuestPicker: React.FC<GuestPickerProps> = ({
//     initialAdults,
//     initialChildren,
//     initialRooms,
//     onApply,
//     onClose
// }) => {
//     // Component tự quản lý state tạm thời của nó
//     const [currentAdults, setCurrentAdults] = useState(initialAdults);
//     const [currentChildren, setCurrentChildren] = useState(initialChildren);
//     const [currentRooms, setCurrentRooms] = useState(initialRooms);
//     const [error, setError] = useState('');

//     const handleIncreaseRooms = () => {
//         if (currentRooms < currentAdults) {
//             setCurrentRooms(r => r + 1);
//         } else {
//             setError('Số phòng không thể nhiều hơn số khách người lớn');
//             setTimeout(() => setError(''), 3000);
//         }
//     };

//     // Tự động điều chỉnh số phòng khi số người lớn giảm
//     useEffect(() => {
//         if (currentRooms > currentAdults) {
//             setCurrentRooms(currentAdults);
//         }
//         if (error) {
//             setError('');
//         }
//     }, [currentAdults]); // Chỉ phụ thuộc vào currentAdults

//     // Khi người dùng nhấn "Xong", gọi callback onApply với dữ liệu cuối cùng
//     const handleApply = () => {
//         onApply({
//             adults: currentAdults,
//             children: currentChildren,
//             rooms: currentRooms,
//         });
//         onClose(); // Sau đó đóng popup
//     };

//     return (
//         <div className={styles.pickerContainer}>
//             {error && <div className={styles.errorBanner}>{error}</div>}

//             <div className={styles.pickerRow}>
//                 <div className={styles.label}>
//                     <i className="bi bi-people-fill"></i>
//                     <span>Người lớn</span>
//                 </div>
//                 <div className={styles.counter}>
//                     <button onClick={() => setCurrentAdults(p => Math.max(1, p - 1))} disabled={currentAdults <= 1}>-</button>
//                     <span>{currentAdults}</span>
//                     <button onClick={() => setCurrentAdults(p => p + 1)}>+</button>
//                 </div>
//             </div>
//             <div className={styles.pickerRow}>
//                 <div className={styles.label}>
//                     <i className="bi bi-person-standing"></i>
//                     <span>Trẻ em</span>
//                 </div>
//                 <div className={styles.counter}>
//                     <button onClick={() => setCurrentChildren(p => Math.max(0, p - 1))} disabled={currentChildren <= 0}>-</button>
//                     <span>{currentChildren}</span>
//                     <button onClick={() => setCurrentChildren(p => p + 1)}>+</button>
//                 </div>
//             </div>
//             <div className={styles.pickerRow}>
//                 <div className={styles.label}>
//                     <i className="bi bi-door-open-fill"></i>
//                     <span>Phòng</span>
//                 </div>
//                 <div className={styles.counter}>
//                     <button onClick={() => setCurrentRooms(p => Math.max(1, p - 1))} disabled={currentRooms <= 1}>-</button>
//                     <span>{currentRooms}</span>
//                     <button onClick={handleIncreaseRooms}>+</button>
//                 </div>
//             </div>
//             <div className={styles.buttonWrapper}>
//                 <button onClick={handleApply} className={styles.applyButton}>Xong</button>
//             </div>
//         </div>
//     );
// };

// export default GuestPicker;