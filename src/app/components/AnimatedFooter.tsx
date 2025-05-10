"use client";
import { useEffect, useState, useRef } from 'react';
import { FaTimes, FaEnvelope, FaGithub, FaLinkedin, FaPhone } from 'react-icons/fa';

export default function AnimatedFooter() {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const [showFooter, setShowFooter] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(1); // 1 for left-to-right, -1 for right-to-left
  const marqueeRef = useRef<HTMLDivElement>(null);
  const touchStartXRef = useRef<number | null>(null);

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

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setIsPaused(true);
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartXRef.current === null) return;
    
    const touchCurrentX = e.touches[0].clientX;
    const diffX = touchCurrentX - touchStartXRef.current;
    
    // اگر کاربر بیش از 50px کشیده باشد، جهت را تغییر میدهیم
    if (Math.abs(diffX) > 50) {
      setSwipeDirection(diffX > 0 ? 1 : -1);
      touchStartXRef.current = touchCurrentX;
    }
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    touchStartXRef.current = null;
  };

  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
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
        <div 
          ref={marqueeRef}
          className={`whitespace-nowrap text-white text-sm py-1.5 touch-pan-x ${isPaused ? '' : `animate-marquee-${swipeDirection > 0 ? 'ltr' : 'rtl'}`}`}
          style={{ 
            animationPlayState: isPaused ? 'paused' : 'running',
            direction: swipeDirection > 0 ? 'ltr' : 'rtl' 
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <span className="inline-block mx-4">designed and created by Soroush Qary Ivary</span>
          <span className="inline-block mx-4">راه های ارتباطی:</span>
          <span className="inline-flex items-center mx-4">
            <FaPhone className="ml-1" />
            <a href="tel:09154758378" className="hover:text-gray-200 mx-1">
              09154758378
            </a>
          </span>
          <span className="inline-flex items-center mx-4">
            <FaEnvelope className="ml-1" />
            <a href="mailto:soroush.qary.eemit@gmail.com" className="hover:text-gray-200 mx-1">
              soroush.qary.eemit@gmail.com
            </a>
          </span>
          <span className="inline-flex items-center mx-4">
            <FaGithub className="ml-1" />
            <a href="https://github.com/Soroushq" target="_blank" rel="noopener noreferrer" className="hover:text-gray-200 mx-1">
              github.com/Soroushq
            </a>
          </span>
          <span className="inline-flex items-center mx-4">
            <FaLinkedin className="ml-1" />
            <a href="https://www.linkedin.com/in/soroush-qary-08392334b" target="_blank" rel="noopener noreferrer" className="hover:text-gray-200 mx-1">
              linkedin.com/in/soroush-qary
            </a>
          </span>
          <span className="inline-block mx-4">
            <a href="https://soroushop.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-gray-200">
              نمونه سایت فروشگاهی: soroushop.vercel.app
            </a>
          </span>
        </div>
      </div>
    </div>
  );
}