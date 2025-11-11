'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './CustomDropdown.module.css';

// Support both simple array and object array format
type OptionValue = string | number;
type Option = OptionValue | { value: OptionValue; label: string };

interface CustomDropdownProps {
    options: Option[];
    value: string | number;
    onChange: (value: string | number) => void;
    placeholder: string;
    disabled?: boolean;
}

export default function CustomDropdown({ options, value, onChange, placeholder, disabled = false }: CustomDropdownProps) {
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

    // Helper functions để xử lý cả hai format
    const getOptionValue = (option: Option): OptionValue => {
        return typeof option === 'object' && 'value' in option ? option.value : option;
    };

    const getOptionLabel = (option: Option): string => {
        if (typeof option === 'object' && 'label' in option) {
            return option.label;
        }
        return String(option);
    };

    // Tìm label của value hiện tại
    const getCurrentLabel = (): string => {
        if (!value) return '';
        const option = options.find(opt => getOptionValue(opt) === value);
        return option ? getOptionLabel(option) : String(value);
    };

    const handleOptionClick = (option: Option) => {
        if (disabled) return;
        const optionValue = getOptionValue(option);
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div className={styles.dropdown} ref={dropdownRef}>
            <button 
                type="button" 
                className={`${styles.dropdownToggle} ${disabled ? styles.disabled : ''}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
            >
                {value ? getCurrentLabel() : <span className={styles.placeholder}>{placeholder}</span>}
                <span className={styles.arrow}>{isOpen ? '▲' : '▼'}</span>
            </button>
            {isOpen && !disabled && (
                <ul className={styles.dropdownMenu}>
                    {options.map((option, index) => {
                        const optionValue = getOptionValue(option);
                        const optionLabel = getOptionLabel(option);
                        return (
                            <li
                                key={typeof option === 'object' ? option.value : option}
                                className={styles.dropdownItem}
                                onClick={() => handleOptionClick(option)}
                            >
                                {optionLabel}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}