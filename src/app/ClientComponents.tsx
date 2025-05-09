'use client';

import dynamic from 'next/dynamic';

// استفاده از import پویا برای کامپوننت مشاهده‌گر
const ScheduleSyncObserver = dynamic(
  () => import('@/components/ScheduleSyncObserver'),
  { ssr: false }
);

export const ClientScheduleSyncObserver = () => {
  return <ScheduleSyncObserver />;
}; 