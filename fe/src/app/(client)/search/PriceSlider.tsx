'use client';

import { useState, useEffect } from "react";
import Slider from 'rc-slider'; // << THAY ĐỔI 1: Import Slider làm default
import 'rc-slider/assets/index.css';
import styles from './SearchPage.module.css';

interface PriceSliderProps {
    minDefault: number;
    maxDefault: number;
    onPriceChange: (min: number, max: number) => void;
}

const PriceSlider: React.FC<PriceSliderProps> = ({ minDefault, maxDefault, onPriceChange }) => {
    const [values, setValues] = useState<[number, number]>([minDefault, maxDefault]);

    useEffect(() => {
        setValues([minDefault, maxDefault]);
    }, [minDefault, maxDefault]);

    // Hàm này cập nhật giao diện khi người dùng KÉO thanh trượt
    const handleSliderChange = (newValues: number | number[]) => {
        if (Array.isArray(newValues)) {
            setValues(newValues as [number, number]);
        }
    };

    // << THAY ĐỔI 2: Thêm lại hàm này >>
    // Hàm này chỉ được gọi khi người dùng NHẢ CHUỘT ra, để gọi API
    const handleAfterChange = (finalValues: number | number[]) => {
        if (Array.isArray(finalValues)) {
            onPriceChange(finalValues[0], finalValues[1]);
        }
    };

    const handleReset = () => {
        setValues([minDefault, maxDefault]);
        onPriceChange(minDefault, maxDefault);
    };

    return (
        <div className={styles.filterSection}>
            <div className={styles.filterSectionHeader}>
                <strong>Khoảng giá</strong>
                <button onClick={handleReset} className={styles.resetButton}>Đặt lại</button>
            </div>
            <div className={styles.priceSliderContent}> {/* Sửa lại tên class cho đúng chuẩn camelCase */}
                {/* << THAY ĐỔI 3: Dùng <Slider range /> và onAfterChange >> */}
                <Slider
                    range // Prop này biến Slider thành Range Slider
                    min={0}
                    max={30000000}
                    step={500000}
                    value={values}
                    onChange={handleSliderChange}
                    onAfterChange={handleAfterChange} // Gán đúng hàm
                    allowCross={false}
                    trackStyle={[{ backgroundColor: '#0d6efd' }]}
                    handleStyle={[
                        { borderColor: '#0d6efd', backgroundColor: 'white', borderWidth: 2 },
                        { borderColor: '#0d6efd', backgroundColor: 'white', borderWidth: 2 }
                    ]}
                />
                <div className={styles.priceInputGroup}>
                    <input type="text" value={values[0].toLocaleString('vi-VN')} readOnly className={styles.priceInput} />
                    <span>-</span>
                    <input type="text" value={values[1].toLocaleString('vi-VN')} readOnly className={styles.priceInput} />
                </div>
            </div>
        </div>
    );
};

export default PriceSlider;