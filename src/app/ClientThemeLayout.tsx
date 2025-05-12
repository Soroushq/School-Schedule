'use client';

import { ThemeProvider } from '@/context/ThemeContext';
import { ReactNode } from 'react';

export default function ClientThemeLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
} 