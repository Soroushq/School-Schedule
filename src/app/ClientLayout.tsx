"use client";
import AnimatedFooter from './components/AnimatedFooter';
import StorageAccessIndicator from '@/components/StorageAccessIndicator';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StorageAccessIndicator />
      {children}
      <AnimatedFooter />
    </>
  );
} 