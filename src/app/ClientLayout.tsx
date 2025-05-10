"use client";
import AnimatedFooter from './components/AnimatedFooter';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <AnimatedFooter />
    </>
  );
} 