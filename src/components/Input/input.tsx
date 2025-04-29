'use client';

import React from "react";

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

  return (
    <div className={`${className} w-full`}>
      <label className="block text-xs text-gray-700 xl:mt-2 mb-2 font-bold">{label}</label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        required={required}
        className={`
          ${borderClass}
          block w-full p-[0.65rem] text-xs border border-gray-300 rounded-md shadow-sm 
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
          ${isNumber ? 'appearance-none' : ''}
        `}
        style={isNumber ? {
          MozAppearance: 'textfield',
          WebkitAppearance: 'none',
        } : {}}
      />
    </div>
  );
};

export default Input;
