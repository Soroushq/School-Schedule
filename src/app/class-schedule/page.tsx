'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import styles from './class-schedule.module.css';

// interface ClassInfo {
//   grade: string;
//   classNumber: string;
//   field: string;
// }

const ClassSchedule = () => {
  const router = useRouter();
  
  useEffect(() => {
    // انتقال مستقیم به صفحه برنامه کلاس
    router.push('/class-schedule/schedule');
  }, [router]);

  return (
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
  );
};

export default ClassSchedule; 