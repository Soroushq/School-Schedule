'use client';

import dynamic from 'next/dynamic';

// Component Imports
import PrivacyAgreement from '@/components/PrivacyAgreement';
import ScheduleSyncObserver from '@/components/ScheduleSyncObserver';
import StorageAccessIndicator from '@/components/StorageAccessIndicator';
import AnalyticsInitializer from '@/components/AnalyticsInitializer';

// استفاده از import پویا برای کامپوننت مشاهده‌گر
const ScheduleSyncObserverDynamic = dynamic(
  () => import('@/components/ScheduleSyncObserver'),
  { ssr: false }
);

// استفاده از import پویا برای کامپوننت توافقنامه
const PrivacyAgreementComponent = dynamic(
  () => import('@/components/PrivacyAgreement'),
  { ssr: false }
);

export const ClientScheduleSyncObserver = () => {
  return <ScheduleSyncObserver />;
};

export const ClientStorageIndicator = () => {
  return <StorageAccessIndicator />;
};

// کامپوننت آنالیتیکس غیرفعال شده است
export const ClientAnalyticsInitializer = () => {
  return null; // آنالیتیکس غیرفعال شده است
};

export const ClientPrivacyAgreement = () => {
  return <PrivacyAgreementComponent />;
}; 