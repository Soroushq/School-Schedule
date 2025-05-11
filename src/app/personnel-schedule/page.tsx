'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUserRole } from '@/context/UserRoleContext';
import styles from './personnel-schedule.module.css';
import { FaLock, FaUserCog } from 'react-icons/fa';
import PageLoading from '@/components/PageLoading';
import Script from 'next/script';

const PersonnelSchedulePage = () => {
  const { userRole, hasAccess } = useUserRole();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // نشان دادن وضعیت بارگذاری تا زمانی که mounted شود
  if (!mounted) {
    return <PageLoading />;
  }

  // اگر کاربر دسترسی دارد، اسکریپت ریدایرکت را نمایش می‌دهیم
  const showRedirectScript = mounted && userRole && hasAccess(['admin', 'educator']);

  // اگر کاربر دسترسی ندارد، نمایش صفحه خطا
  if (mounted && !hasAccess(['admin', 'educator'])) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 md:p-8">
          <div className="flex items-center justify-center mb-6">
            <FaLock className="text-4xl text-red-500 ml-3" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">دسترسی محدود شده</h1>
          </div>
          
          <div className="text-center bg-red-50 dark:bg-red-900/30 p-4 rounded-lg mb-6">
            <p className="text-red-700 dark:text-red-300">
              شما به عنوان {userRole === 'learner' ? 'دانش‌آموز' : 'کاربر'} اجازه دسترسی به بخش برنامه پرسنلی را ندارید.
            </p>
            <p className="mt-2 text-red-700 dark:text-red-300">
              لطفاً از گزینه «انتخاب نقش» در نوار ابزار بالای صفحه استفاده کنید و نقش خود را به مدیر یا آموزشگر تغییر دهید.
            </p>
          </div>
          
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center justify-center p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg w-full">
              <FaUserCog className="text-2xl text-indigo-600 dark:text-indigo-400 ml-2" />
              <p className="text-indigo-700 dark:text-indigo-300">
                برای دسترسی به برنامه پرسنلی، شما باید نقش «مدیر سیستم» یا «آموزشگر» داشته باشید.
              </p>
            </div>
            
            <div className="text-center mt-4">
              <Link href="/welcome" className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                بازگشت به صفحه اصلی
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {showRedirectScript && (
        <Script id="redirect-script" strategy="afterInteractive">
          {`window.location.href = '/personnel-schedule/schedule';`}
        </Script>
      )}
      <div className={styles.container}>
        <header className={styles.header}>
          <Link href="/welcome" className={styles.backButton}>
            بازگشت
          </Link>
          <h1 className="text-cyan-700">
            برنامه‌ریزی پرسنل
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

export default PersonnelSchedulePage; 