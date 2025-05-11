'use client';

import React, { ReactNode } from 'react';
import { useUserRole, UserRole } from '@/context/UserRoleContext';

interface RoleBasedPermissionProps {
  allowedRoles: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * کامپوننت نمایش محتوا براساس نقش کاربر
 * 
 * @param allowedRoles - نقش‌های مجاز
 * @param children - محتوایی که باید نمایش داده شود اگر کاربر دسترسی داشته باشد
 * @param fallback - محتوایی که باید نمایش داده شود اگر کاربر دسترسی نداشته باشد (اختیاری)
 */
const RoleBasedPermission: React.FC<RoleBasedPermissionProps> = ({ 
  allowedRoles, 
  children, 
  fallback = null 
}) => {
  const { userRole, hasAccess } = useUserRole();
  
  // بررسی اینکه آیا کاربر به این محتوا دسترسی دارد یا خیر
  if (hasAccess(allowedRoles)) {
    return <>{children}</>;
  }
  
  // نمایش محتوای جایگزین در صورت عدم دسترسی
  return <>{fallback}</>;
};

export default RoleBasedPermission; 