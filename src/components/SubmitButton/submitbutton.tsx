'use client';

import React from "react";

interface SubmitButtonProps {
  label: string;
  onClick?: () => void; 
  className?: string;
  disabled?: boolean;
  icon?: React.ReactNode;  // New prop for optional icon
}

const SubmitButton: React.FC<SubmitButtonProps> = ({
  label,
  onClick,
  className = "",
  disabled = false,
  icon,
}) => {
  const handleSubmit = () => {
    console.log("Button Clicked!");
  };

  return (
    <button
      onClick={onClick || handleSubmit}
      disabled={disabled}
      className={`flex row-auto bg-Bgreenl max-w-28  rounded-md py-2 px-1 w-40 h-fit text-Bgreen font-bold text-xs text-nowrap ${className}`}
    >
      {icon && <span className="text-sm px-2">{icon}</span>}  {/* Render icon if provided */}
      {label}
    </button>
  );
};

export default SubmitButton;
