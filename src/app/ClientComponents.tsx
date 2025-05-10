'use client';

import dynamic from 'next/dynamic';

// استفاده از import پویا برای کامپوننت مشاهده‌گر
const ScheduleSyncObserver = dynamic(
  () => import('@/components/ScheduleSyncObserver'),
  { ssr: false }
);

// استفاده از import پویا برای کامپوننت آنالیتیکس
const AnalyticsTracker = dynamic(
  () => import('@/components/AnalyticsInitializer'),
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

export const ClientAnalyticsTracker = () => {
  return <AnalyticsTracker />;
};

export const ClientPrivacyAgreement = () => {
  return <PrivacyAgreementComponent />;
}; 