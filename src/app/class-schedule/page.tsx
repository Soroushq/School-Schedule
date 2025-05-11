'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUserRole } from '@/context/UserRoleContext';
import styles from './class-schedule.module.css';
import PageLoading from '@/components/PageLoading';
import Script from 'next/script';

// interface ClassInfo {
//   grade: string;
//   classNumber: string;
//   field: string;
// }

// کامپوننت اصلی صفحه که از Suspense استفاده می‌کند
const ClassSchedulePage = () => {
  const { userRole } = useUserRole();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // نشان دادن وضعیت بارگذاری تا زمانی که mounted شود
  if (!mounted) {
    return <PageLoading />;
  }

  // اسکریپت ریدایرکت فقط زمانی که کامپوننت mount شده نمایش داده می‌شود
  const showRedirectScript = mounted;
  
  return (
    <>
      {showRedirectScript && (
        <Script id="redirect-script" strategy="afterInteractive">
          {`window.location.href = '/class-schedule/schedule';`}
        </Script>
      )}
      <div className={styles.container}>
        <header className={styles.header}>
          <Link href="/welcome" className={styles.backButton}>
            بازگشت
          </Link>
          <h1 className="text-cyan-700">
            برنامه‌ریزی کلاس
          </h1>
        </header>

        <main className={styles.main}>
          <div className="w-full flex justify-center items-center h-64">
            <p className="text-center text-lg">در حال انتقال به صفحه برنامه‌ریزی...</p>
          </div>
        </main>
      </div>
    </>
  );
};

export default ClassSchedulePage; 