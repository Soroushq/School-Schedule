"use client";
import { useEffect, useState } from 'react';
import { FaTimes } from 'react-icons/fa';

export default function AnimatedFooter() {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const [showFooter, setShowFooter] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const closed = localStorage.getItem('footer_closed_' + pathname);
      setShowFooter(!closed);
    }
  }, [pathname]);

  const handleClose = () => {
    setShowFooter(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('footer_closed_' + pathname, '1');
    }
  };

  if (!showFooter) return null;
  return (
    <div className="fixed bottom-0 left-0 right-0 h-8 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 overflow-hidden z-50">
      <div className="relative h-full">
        <button
          onClick={handleClose}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-200 transition-colors duration-500 z-10"
        >
          <FaTimes />
        </button>
        <div className="animate-marquee whitespace-nowrap text-white text-sm py-1.5">
          <span className="inline-block mx-4">designed and created by Soroush Qary Ivary</span>
          <span className="inline-block mx-4">طراحی و توسعه : سروش قاری ایوری</span>
        </div>
      </div>
    </div>
  );
} 