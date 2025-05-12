"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/welcome');
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="text-center">
        در حال انتقال به صفحه اصلی...
      </div>
    </div>
  );
}
