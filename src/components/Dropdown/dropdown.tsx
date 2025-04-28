'use client';

import React, { useState, useEffect, useRef } from "react";

interface DropdownProps {
    label: string;
    options: string[];
    onSelect: (option: string) => void;
    value?: string;
    className?: string;
    width?: string; // Custom width
    height?: string; // Custom height
    showPlaceholder?: boolean; // Show/hide "انتخاب کنید"
    formatValue?: (value: string) => string; // تبدیل مقدار قبل از ارسال به onSelect
    formatDisplay?: (value: string) => string; // تبدیل مقدار برای نمایش
}

const Dropdown: React.FC<DropdownProps> = ({
    label,
    options,
    onSelect,
    value,
    className,
    width = "w-full",
    height = "h-10",
    showPlaceholder = true,
    formatValue,
    formatDisplay,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState<string | null>(value || null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const toggleDropdown = () => {
        setIsOpen((prev) => !prev);
    };

    const handleSelect = (option: string) => {
        setSelectedOption(option);
        // اگر تابع formatValue وجود داشته باشد، از آن استفاده می‌کنیم
        if (formatValue) {
            onSelect(formatValue(option));
        } else {
            onSelect(option);
        }
        setIsOpen(false);
    };

    // نمایش مقدار انتخاب شده با استفاده از formatDisplay اگر وجود داشته باشد
    const displayValue = (option: string): string => {
        if (formatDisplay && option) {
            return formatDisplay(option);
        }
        return option;
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div ref={dropdownRef} className={`${className} ${width} relative inline-block text-left`}>
            <label className="block text-xs text-gray-700 mb-2 text-right font-bold">{label}</label>

            <button
                type="button"
                className={`inline-flex justify-between items-center ${width} ${height} p-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                onClick={toggleDropdown}
            >
                {selectedOption ? displayValue(selectedOption) : (showPlaceholder ? "انتخاب کنید" : displayValue(options[0]))}
                <svg
                    className={`ml-1 h-4 w-4 transform transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1 text-right">
                        {options.map((option, index) => (
                            <button
                                key={index}
                                className="text-gray-700 block w-full text-right px-4 py-2 text-sm hover:bg-gray-100"
                                onClick={() => handleSelect(option)}
                            >
                                {displayValue(option)}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dropdown;