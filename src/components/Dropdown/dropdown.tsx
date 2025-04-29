'use client';

import React, { useState, useEffect, useRef } from "react";

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
                    <div className="p-2">
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="جستجو..."
                            className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                        <div className="py-1 text-right">
                            {filteredOptions.map((option, index) => (
                                <button
                                    key={index}
                                    className="text-gray-700 block w-full text-right px-4 py-2 text-sm hover:bg-gray-100"
                                    onClick={() => handleSelect(option)}
                                >
                                    {displayValue(option)}
                                </button>
                            ))}
                            {filteredOptions.length === 0 && (
                                <div className="text-gray-500 text-center py-2 text-sm">
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