'use client';

import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-800 mb-4 text-center font-farhang">به سیستم برنامه‌ریزی خوش آمدید</h1>
      <p className="text-xl text-gray-600 mb-12 text-center">لطفا نوع برنامه‌ریزی مورد نظر خود را انتخاب کنید:</p>
      
      <div className="flex gap-8 flex-wrap justify-center">
        <Link href="/class-schedule" className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-200 w-72 text-center no-underline text-inherit">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">برنامه‌ریزی بر اساس کلاس</h2>
          <p className="text-gray-500 text-sm">برنامه‌ریزی بر اساس کلاس‌ها و دروس</p>
        </Link>
        
        <Link href="/personnel-schedule" className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-200 w-72 text-center no-underline text-inherit">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">برنامه‌ریزی بر اساس پرسنل</h2>
          <p className="text-gray-500 text-sm">برنامه‌ریزی بر اساس معلمان و کارکنان</p>
        </Link>
      </div>
    </div>
  );
}
