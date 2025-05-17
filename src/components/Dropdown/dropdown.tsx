'use client';

import React, { useState, useEffect, useRef } from "react";
import { useTheme } from '@/context/ThemeContext';

interface DropdownProps {
    label: string;
    options: string[];
    onSelect: (option: string) => void;
    value?: string;
    className?: string;
    width?: string;
    height?: string;
    showPlaceholder?: boolean;
    formatValue?: (value: string) => string;
    formatDisplay?: (value: string) => string;
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
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const { theme } = useTheme();

    const toggleDropdown = () => {
        setIsOpen((prev) => !prev);
        if (!isOpen && searchInputRef.current) {
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
        }
    };

    const handleSelect = (option: string) => {
        setSelectedOption(option);
        setSearchTerm("");
        if (formatValue) {
            onSelect(formatValue(option));
        } else {
            onSelect(option);
        }
        setIsOpen(false);
    };

    const displayValue = (option: string): string => {
        if (formatDisplay && option) {
            return formatDisplay(option);
        }
        return option;
    };

    const filteredOptions = options.filter(option =>
        option.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm("");
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div ref={dropdownRef} className={`${className} ${width} relative inline-block text-left`}>
            <label className={`block text-xs mb-2 text-right font-bold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {label}
            </label>

            <button
                type="button"
                className={`inline-flex justify-between items-center ${width} ${height} p-2 rounded-md border shadow-sm transition-colors duration-200 ease-in-out ${
                    theme === 'dark' 
                        ? 'bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700 focus:ring-blue-500' 
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-indigo-500'
                } focus:outline-none focus:ring-2 focus:ring-offset-2`}
                onClick={toggleDropdown}
            >
                <span className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
                    {selectedOption ? displayValue(selectedOption) : (showPlaceholder ? "انتخاب کنید" : displayValue(options[0]))}
                </span>
                <svg
                    className={`ml-1 h-4 w-4 transform transition-transform duration-200 ${isOpen ? "rotate-180" : ""} ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className={`absolute right-0 mt-2 w-full rounded-md shadow-lg ring-1 z-50 transition-all duration-200 ease-in-out ${
                    theme === 'dark'
                        ? 'bg-gray-800 ring-gray-700 shadow-[0_0_15px_rgba(0,0,0,0.3)]'
                        : 'bg-white ring-black ring-opacity-5'
                }`}>
                    <div className="p-2">
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="جستجو..."
                            className={`w-full p-2 text-sm rounded-md transition-colors duration-200 ease-in-out ${
                                theme === 'dark'
                                    ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500'
                                    : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                            } focus:outline-none focus:ring-2`}
                        />
                    </div>
                    <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-rounded">
                        <div className="py-1 text-right">
                            {filteredOptions.map((option, index) => (
                                <button
                                    key={index}
                                    className={`block w-full text-right px-4 py-2 text-sm transition-colors duration-150 ease-in-out ${
                                        theme === 'dark'
                                            ? 'text-gray-200 hover:bg-gray-700'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                    onClick={() => handleSelect(option)}
                                >
                                    {displayValue(option)}
                                </button>
                            ))}
                            {filteredOptions.length === 0 && (
                                <div className={`text-center py-2 text-sm ${
                                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                    نتیجه‌ای یافت نشد
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dropdown;