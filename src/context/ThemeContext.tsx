'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  // تابع برای تنظیم تم و اعمال آن در سراسر برنامه
  const applyTheme = (newTheme: Theme) => {
    // اعمال تغییر در DOM
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // ذخیره در localStorage
    try {
      localStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('خطا در ذخیره تم:', error);
    }
    
    // به‌روزرسانی state
    setTheme(newTheme);
  };

  // فقط در سمت کلاینت اجرا می‌شود
  useEffect(() => {
    setMounted(true);
    try {
      // خواندن تم ذخیره شده از localStorage
      const savedTheme = localStorage.getItem('theme') as Theme;
      
      // اگر تم ذخیره شده وجود داشته باشد، آن را استفاده می‌کنیم
      if (savedTheme === 'light' || savedTheme === 'dark') {
        applyTheme(savedTheme);
      } 
      // در غیر این صورت، تم پیش‌فرض روشن را استفاده می‌کنیم
      else {
        applyTheme('light');
      }
    } catch (error) {
      console.error('خطا در خواندن یا تنظیم تم:', error);
    }
  }, []);

  // تابع تغییر تم
  const toggleTheme = () => {
    try {
      const newTheme = theme === 'light' ? 'dark' : 'light';
      applyTheme(newTheme);
      
      // ارسال رویداد storage برای آگاه کردن سایر کامپوننت‌ها
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'theme',
        newValue: newTheme,
        storageArea: localStorage
      }));
      
    } catch (error) {
      console.error('خطا در تغییر تم:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  return context;
} 