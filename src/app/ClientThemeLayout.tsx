'use client';

import { ThemeProvider } from '@/context/ThemeContext';
import { ReactNode, useEffect, useState } from 'react';

export default function ClientThemeLayout({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // اگر هنوز در سمت سرور هستیم، فقط کودکان را رندر می‌کنیم
  if (!mounted) {
    return <ThemeProvider>{children}</ThemeProvider>;
  }

  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
} 