'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';

// تعریف انواع نقش‌های کاربری
export type UserRole = 'admin' | 'educator' | 'learner' | null;

// نوع داده برای دسترسی‌های کاربر
interface UserAccess {
  canAccessClassSchedule: boolean;
  canAccessPersonnelSchedule: boolean;
  canEditClassSchedule: boolean; 
  canEditPersonnelSchedule: boolean;
  canViewAllSchedules: boolean;
}

// نوع داده برای کانتکست نقش کاربر
export interface UserRoleContextType {
  userRole: UserRole;
  setUserRole: React.Dispatch<React.SetStateAction<UserRole>>;
  hasAccess: (requiredRoles: UserRole[]) => boolean;
  access: UserAccess;
}

// ایجاد کانتکست
const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined);

// تعریف متن فارسی برای هر نقش
const roleTexts: Record<string, string> = {
  'admin': 'مدیر سیستم',
  'educator': 'یاددهنده / پرسنل',
  'learner': 'یادگیرنده',
  'null': 'انتخاب نشده'
};

// تعریف دسترسی‌ها برای هر نقش
const getRoleAccess = (role: UserRole): UserAccess => {
  switch (role) {
    case 'admin':
      return {
        canAccessClassSchedule: true,
        canAccessPersonnelSchedule: true,
        canEditClassSchedule: true,
        canEditPersonnelSchedule: true,
        canViewAllSchedules: true
      };
    case 'educator':
      return {
        canAccessClassSchedule: true,
        canAccessPersonnelSchedule: true,
        canEditClassSchedule: false,
        canEditPersonnelSchedule: true,
        canViewAllSchedules: false
      };
    case 'learner':
      return {
        canAccessClassSchedule: true,
        canAccessPersonnelSchedule: false,
        canEditClassSchedule: false,
        canEditPersonnelSchedule: false,
        canViewAllSchedules: false
      };
    default:
      return {
        canAccessClassSchedule: true,
        canAccessPersonnelSchedule: true,
        canEditClassSchedule: true,
        canEditPersonnelSchedule: true,
        canViewAllSchedules: true
      };
  }
};

// پروایدر برای کانتکست
export const UserRoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // سعی می‌کنیم نقش کاربر را از localStorage بازیابی کنیم
  const [userRole, setUserRole] = useState<UserRole>(null);

  // بررسی اینکه آیا کاربر به بخش مورد نظر دسترسی دارد یا خیر
  const hasAccess = (requiredRoles: UserRole[]): boolean => {
    // اگر نقش کاربر تعیین نشده، اجازه دسترسی داده نمی‌شود
    if (!userRole) return false;
    
    // اگر کاربر مدیر سیستم باشد، به همه بخش‌ها دسترسی دارد
    if (userRole === 'admin') return true;
    
    // در غیر این صورت، بررسی می‌کنیم آیا نقش کاربر در لیست نقش‌های مجاز قرار دارد یا خیر
    return requiredRoles.includes(userRole);
  };

  // بارگیری نقش کاربر از localStorage در اولین رندر
  useEffect(() => {
    try {
      const savedRole = localStorage.getItem('userRole');
      if (savedRole === 'admin' || savedRole === 'educator' || savedRole === 'learner') {
        setUserRole(savedRole);
      }
    } catch (error) {
      console.error('خطا در خواندن نقش کاربر:', error);
    }
  }, []);

  // ذخیره نقش کاربر در localStorage هر زمان که تغییر می‌کند
  useEffect(() => {
    try {
      if (userRole) {
        localStorage.setItem('userRole', userRole);
      } else {
        localStorage.removeItem('userRole');
      }
    } catch (error) {
      console.error('خطا در ذخیره نقش کاربر:', error);
    }
  }, [userRole]);

  // محاسبه دسترسی‌ها بر اساس نقش
  const access = getRoleAccess(userRole);
  
  // متن فارسی نقش
  const roleText = userRole ? roleTexts[userRole] : roleTexts['null'];

  return (
    <UserRoleContext.Provider value={{ userRole, setUserRole, hasAccess, access }}>
      {children}
    </UserRoleContext.Provider>
  );
};

// هوک برای دسترسی به کانتکست نقش کاربر
export const useUserRole = (): UserRoleContextType => {
  const context = useContext(UserRoleContext);
  if (context === undefined) {
    throw new Error('useUserRole must be used within a UserRoleProvider');
  }
  return context;
}; 