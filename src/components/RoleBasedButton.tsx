'use client';

import React, { ReactNode } from 'react';
import { useUserRole, UserRole } from '@/context/UserRoleContext';
import { FaLock } from 'react-icons/fa';
import Link from 'next/link';

interface RoleBasedButtonProps {
  allowedRoles: UserRole[];
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  showTooltip?: boolean;
  tooltipText?: string;
  redirectUnauthorized?: boolean;
  redirectTo?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

/**
 * دکمه با محدودیت دسترسی بر اساس نقش کاربر
 */
const RoleBasedButton: React.FC<RoleBasedButtonProps> = ({
  allowedRoles,
  onClick,
  children,
  className = "inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors",
  showTooltip = true,
  tooltipText = "شما اجازه دسترسی به این عملیات را ندارید",
  redirectUnauthorized = false,
  redirectTo = "/access-control",
  type = "button",
  disabled = false,
}) => {
  const { userRole, hasAccess } = useUserRole();
  const hasPermission = hasAccess(allowedRoles);

  // اگر کاربر دسترسی ندارد و نیاز به هدایت به صفحه دیگری است
  if (!hasPermission && redirectUnauthorized) {
    return (
      <Link 
        href={redirectTo}
        className={`inline-flex items-center justify-center px-4 py-2 bg-gray-400 text-white rounded-md opacity-75 cursor-not-allowed ${className}`}
      >
        <FaLock className="ml-2 text-sm" />
        {children}
      </Link>
    );
  }

  // اگر کاربر دسترسی ندارد و نیاز به نمایش دکمه غیرفعال است
  if (!hasPermission) {
    return (
      <div className="relative group">
        <button
          disabled
          className={`inline-flex items-center justify-center px-4 py-2 bg-gray-400 text-white rounded-md opacity-75 cursor-not-allowed ${className}`}
        >
          <FaLock className="ml-2 text-sm" />
          {children}
        </button>
        
        {showTooltip && (
          <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            {tooltipText}
          </div>
        )}
      </div>
    );
  }

  // اگر کاربر دسترسی دارد
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </button>
  );
};

export default RoleBasedButton; 