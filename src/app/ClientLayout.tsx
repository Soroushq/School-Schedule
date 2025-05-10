"use client";
import AnimatedFooter from './components/AnimatedFooter';
import UserAgreementModal from '@/components/UserAgreementModal';
import StorageAccessIndicator from '@/components/StorageAccessIndicator';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <UserAgreementModal />
      <StorageAccessIndicator />
      {children}
      <AnimatedFooter />
    </>
  );
} 