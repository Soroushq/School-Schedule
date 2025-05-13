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
    if (typeof window === 'undefined') return;

    // اعمال کلاس در HTML
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // ذخیره در localStorage
    try {
      localStorage.setItem('theme', newTheme);
      // ارسال رویداد سفارشی برای آگاه کردن سایر کامپوننت‌ها
      window.dispatchEvent(new CustomEvent('themeChanged', { 
        detail: { theme: newTheme }
      }));
    } catch (error) {
      console.error('خطا در ذخیره تم:', error);
    }
    
    setTheme(newTheme);
  };

  // فقط در سمت کلاینت اجرا می‌شود
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    setMounted(true);
    
    // تنظیم اولیه تم
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme === 'dark' || savedTheme === 'light') {
      applyTheme(savedTheme);
    } else {
      // اگر تم ذخیره شده نباشد، از تنظیمات سیستم استفاده می‌کنیم
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(systemPrefersDark ? 'dark' : 'light');
    }

    // گوش دادن به تغییرات تم سیستم
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const savedTheme = localStorage.getItem('theme') as Theme;
      // فقط اگر تم سفارشی ذخیره نشده باشد، از تم سیستم پیروی می‌کنیم
      if (!savedTheme) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
  };

  // اگر هنوز در سمت سرور هستیم یا کامپوننت mount نشده است
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 