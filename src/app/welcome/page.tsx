'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import styles from './welcome.module.css';

export default function WelcomePage() {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>به سیستم برنامه‌ریزی خوش آمدید</h1>
      <p className={styles.subtitle}>لطفا نوع برنامه‌ریزی مورد نظر خود را انتخاب کنید:</p>
      
      <div className={styles.options}>
        <div 
          className={styles.option}
          onClick={() => router.push('/class-schedule')}
        >
          <h2>برنامه‌ریزی بر اساس کلاس</h2>
          <p>برنامه‌ریزی بر اساس کلاس‌ها و دروس</p>
        </div>
        
        <div 
          className={styles.option}
          onClick={() => router.push('/personnel-schedule')}
        >
          <h2>برنامه‌ریزی بر اساس پرسنل</h2>
          <p>برنامه‌ریزی بر اساس معلمان و کارکنان</p>
        </div>
      </div>
    </div>
  );
} 