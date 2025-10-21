'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './CustomDropdown.module.css'; // Chúng ta sẽ tạo file CSS này ngay sau đây

interface CustomDropdownProps {
    options: (string | number)[];
    value: string | number;
    onChange: (value: string | number) => void;
    placeholder: string;
}

export default function CustomDropdown({ options, value, onChange, placeholder }: CustomDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Xử lý đóng dropdown khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleOptionClick = (option: string | number) => {
        onChange(option);
        setIsOpen(false);
    };

    return (
        <div className={styles.dropdown} ref={dropdownRef}>
            <button type="button" className={styles.dropdownToggle} onClick={() => setIsOpen(!isOpen)}>
                {value || <span className={styles.placeholder}>{placeholder}</span>}
                <span className={styles.arrow}>{isOpen ? '▲' : '▼'}</span>
            </button>
            {isOpen && (
                <ul className={styles.dropdownMenu}>
                    {options.map((option) => (
                        <li
                            key={option}
                            className={styles.dropdownItem}
                            onClick={() => handleOptionClick(option)}
                        >
                            {option}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}