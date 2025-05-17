'use client';

import React from "react";
import { useTheme } from '@/context/ThemeContext';

interface InputProps {
  name?: string;
  label: string;
  type?: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  borderClass?: string;
}

const Input: React.FC<InputProps> = ({
  name = '',
  label,
  type = "text",
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  className = "",
  borderClass = "",
}) => {
  const isNumber = type === "number";
  const { theme } = useTheme();

  const inputClasses = `
    ${borderClass}
    block w-full p-[0.65rem] text-xs rounded-md shadow-sm transition-all duration-200 ease-in-out
    ${theme === 'dark' 
      ? 'bg-gray-800 border-gray-600 text-gray-200 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500' 
      : 'bg-white border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500'
    }
    focus:outline-none focus:ring-2
    ${isNumber ? 'appearance-none' : ''}
  `;

  return (
    <div className={`${className} w-full`}>
      <label className={`block text-xs xl:mt-2 mb-2 font-bold transition-colors duration-200 ${
        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
      }`}>
        {label}
        {required && <span className="text-red-500 mr-1">*</span>}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        required={required}
        className={inputClasses}
        style={isNumber ? {
          MozAppearance: 'textfield',
          WebkitAppearance: 'none',
        } : {}}
      />
    </div>
  );
};

export default Input;
