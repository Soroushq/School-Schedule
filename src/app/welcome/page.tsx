'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './welcome.module.css';
import { FaSchool, FaChild, FaUserGraduate, FaTools, FaPhone, FaEnvelope, FaGithub, FaLinkedin, FaInfoCircle, FaShieldAlt } from 'react-icons/fa';
import dynamic from 'next/dynamic';
import { useUserRole } from '@/context/UserRoleContext';
import { useTheme } from '@/context/ThemeContext';

const LoadingSpinner = dynamic(() => import('@/components/LoadingSpinner'), { ssr: false });

export default function WelcomePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { userRole } = useUserRole();
  const { theme } = useTheme();
  
  // رفرنس برای هاله نور ماوس و کارت‌ها
  const mouseLightRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLAnchorElement | null>>([]);

  // مدیریت تم در سمت کلاینت
  useEffect(() => {
    setMounted(true);
  }, []);

  // افکت ماوس در حالت تاریک
  useEffect(() => {
    if (!mounted) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      
      // محاسبه درصد موقعیت ماوس در صفحه
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      
      const percentX = x / windowWidth;
      const percentY = y / windowHeight;
      
      // به‌روزرسانی موقعیت ماوس
      setMousePosition({ x, y });
      
      // تنظیم متغیرهای CSS برای افکت پس‌زمینه در حالت تاریک
      if (theme === 'dark') {
        document.documentElement.style.setProperty('--mouse-x', `${percentX * 100}%`);
        document.documentElement.style.setProperty('--mouse-y', `${percentY * 100}%`);
      }
      
      // حرکت هاله نور ماوس
      if (mouseLightRef.current && theme === 'dark') {
        mouseLightRef.current.style.opacity = '1';
        mouseLightRef.current.style.left = `${x}px`;
        mouseLightRef.current.style.top = `${y}px`;
      } else if (mouseLightRef.current) {
        mouseLightRef.current.style.opacity = '0';
      }
      
      // افکت پارالاکس برای کارت‌ها
      if (typeof window !== 'undefined') {
        cardRefs.current.forEach(card => {
          if (!card) return;
          
          const rect = card.getBoundingClientRect();
          const cardX = rect.left + rect.width / 2;
          const cardY = rect.top + rect.height / 2;
          
          const deltaX = (x - cardX) / 30;
          const deltaY = (y - cardY) / 30;
          
          // محدود کردن چرخش به 5 درجه
          const rotateY = Math.min(Math.max(-deltaX, -5), 5);
          const rotateX = Math.min(Math.max(deltaY, -5), 5);
          
          card.style.setProperty('--rotate-y', `${rotateY}deg`);
          card.style.setProperty('--rotate-x', `${-rotateX}deg`);
        });
      }
    };
    
    // افکت درخشش روی کارت‌ها
    const handleCardMouseMove = (e: MouseEvent) => {
      if (!cardsRef.current || theme !== 'dark') return;
      
      const cards = cardsRef.current.querySelectorAll('.dark-card');
      cards.forEach((card) => {
        const rect = (card as HTMLElement).getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (x > 0 && x < rect.width && y > 0 && y < rect.height) {
          (card as HTMLElement).style.setProperty('--mouse-x', `${x}px`);
          (card as HTMLElement).style.setProperty('--mouse-y', `${y}px`);
          (card as HTMLElement).classList.add('card-glowing');
          (card as HTMLElement).classList.add('animate-light');
        } else {
          (card as HTMLElement).classList.remove('card-glowing');
          (card as HTMLElement).classList.remove('animate-light');
        }
      });
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', handleMouseMove);
      if (cardsRef.current) {
        cardsRef.current.addEventListener('mousemove', handleCardMouseMove);
      }
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        if (cardsRef.current) {
          cardsRef.current.removeEventListener('mousemove', handleCardMouseMove);
        }
      };
    }
    
    return undefined;
  }, [mounted, theme]);

  // اگر کامپوننت هنوز به صورت کامل لود نشده است، نمایش یک اسپینر
  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size={60} color="#3B82F6" />
      </div>
    );
  }

  const educationLevels = [
    { 
      id: 'elementary', 
      title: 'مقطع ابتدایی', 
      description: 'برنامه‌ریزی مدارس ابتدایی',
      icon: <FaChild className="text-cyan-500 text-4xl" />,
      color: theme === 'dark' ? 'bg-cyan-800/60' : 'bg-cyan-50',
      borderColor: theme === 'dark' ? 'border-cyan-700' : 'border-cyan-200',
      hoverColor: theme === 'dark' ? 'hover:bg-cyan-700/80' : 'hover:bg-cyan-100',
      path: '/education-levels/elementary'
    },
    { 
      id: 'middleschool', 
      title: 'مقطع متوسطه اول', 
      description: 'برنامه‌ریزی مدارس متوسطه اول',
      icon: <FaSchool className="text-blue-500 text-4xl" />,
      color: theme === 'dark' ? 'bg-blue-800/60' : 'bg-blue-50',
      borderColor: theme === 'dark' ? 'border-blue-700' : 'border-blue-200',
      hoverColor: theme === 'dark' ? 'hover:bg-blue-700/80' : 'hover:bg-blue-100',
      path: '/education-levels/middleschool'
    },
    { 
      id: 'highschool', 
      title: 'مقطع متوسطه دوم نظری', 
      description: 'برنامه‌ریزی مدارس متوسطه دوم نظری',
      icon: <FaUserGraduate className="text-purple-500 text-4xl" />,
      color: theme === 'dark' ? 'bg-purple-800/60' : 'bg-purple-50',
      borderColor: theme === 'dark' ? 'border-purple-700' : 'border-purple-200',
      hoverColor: theme === 'dark' ? 'hover:bg-purple-700/80' : 'hover:bg-purple-100',
      path: '/education-levels/highschool'
    },
    { 
      id: 'vocational', 
      title: 'مقطع متوسطه دوم فنی و حرفه‌ای، کاردانش', 
      description: 'برنامه‌ریزی هنرستان‌ها و مدارس فنی و حرفه‌ای',
      icon: <FaTools className="text-yellow-500 text-4xl" />,
      color: theme === 'dark' ? 'bg-yellow-800/60' : 'bg-yellow-50',
      borderColor: theme === 'dark' ? 'border-yellow-700' : 'border-yellow-200',
      hoverColor: theme === 'dark' ? 'hover:bg-yellow-700/80' : 'hover:bg-yellow-100',
      path: '/education-levels/vocational'
    }
  ];

  return (
    <div className={`${theme === 'dark' ? styles.darkMode : 'bg-gray-50'} min-h-screen relative overflow-hidden`}>
      {/* افکت هاله نور ماوس */}
      {theme === 'dark' && <div ref={mouseLightRef} className="mouseLightEffect"></div>}
      
      {/* محتوای اصلی */}
      <div className="container mx-auto px-4 py-10 relative z-10">
        <div className={`text-center mb-12 ${styles.fadeIn}`}>
          <h1 className={`text-4xl md:text-5xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            به سیستم برنامه‌ریزی مدرسه خوش آمدید
          </h1>
          <p className={`mt-4 text-xl ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            برنامه‌ریزی آسان و هوشمند برای مدارس
          </p>
        </div>
        
        <h2 className={`text-2xl font-bold mb-8 text-center ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
          مقاطع تحصیلی
        </h2>
        
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {educationLevels.map((level, index) => (
            <Link 
              key={level.id}
              href={level.path}
              className={`
                block overflow-hidden rounded-xl border transition-all duration-500 ease-in-out transform hover:-translate-y-1.5 
                ${level.color} ${level.borderColor} ${level.hoverColor} 
                ${theme === 'dark' ? 'text-white' : 'text-gray-800'}
                ${theme === 'dark' ? 'dark-card' : ''}
                ${styles.parallaxItem} ${styles.levelCardAnimation}
              `}
              style={{
                '--mouse-x': '50%',
                '--mouse-y': '50%',
                position: 'relative',
              } as React.CSSProperties}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
            >
              <div className={`p-6 text-center ${styles.parallaxContent}`}>
                <div className="flex justify-center mb-4">
                  {level.icon}
                </div>
                <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  {level.title}
                </h3>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {level.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* فوتر با گرادیانت */}
      <div className={`w-full py-8 bg-gradient-to-r ${theme === 'dark' ? 'from-gray-900 via-gray-800 to-gray-900' : 'from-blue-500 via-indigo-500 to-purple-500'} text-white shadow-lg`}>
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <div className="flex flex-col items-center md:items-start mb-4 md:mb-0">
              <h3 className="text-xl font-bold mb-2">سیستم برنامه‌ریزی مدرسه</h3>
              <p className="text-sm text-gray-200 text-center md:text-right">نرم‌افزار جامع برنامه‌ریزی آموزشی برای مدارس ایران</p>
            </div>
            
            <div className="flex space-x-4 space-x-reverse">
              <Link href="/access-control" className="flex items-center p-2 px-4 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                <FaShieldAlt className="ml-2 text-lg" />
                <span>نمایش دسترسی</span>
              </Link>
              <Link href="/about-app" className="flex items-center p-2 px-4 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                <FaInfoCircle className="ml-2 text-lg" />
                <span>درباره برنامه</span>
              </Link>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
            <div>
              <h4 className="font-bold mb-3 border-b border-white/20 pb-2">تماس</h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <FaPhone className="ml-2 text-white/80" />
                  <a href="tel:09154758378" className="hover:underline">09154758378</a>
                </div>
                <div className="flex items-center">
                  <FaEnvelope className="ml-2 text-white/80" />
                  <a href="mailto:soroush.qary.eemit@gmail.com" className="hover:underline">soroush.qary.eemit@gmail.com</a>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-3 border-b border-white/20 pb-2">لینک‌های سریع</h4>
              <ul className="space-y-1">
                <li>
                  <Link href="/class-schedule" className="hover:underline">
                    برنامه کلاسی
                  </Link>
                </li>
                <li>
                  <Link href="/personnel-schedule" className="hover:underline">
                    برنامه پرسنلی
                  </Link>
                </li>
                <li>
                  <Link href="/about-me" className="hover:underline">
                    درباره من
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-3 border-b border-white/20 pb-2">شبکه‌های اجتماعی</h4>
              <div className="flex space-x-3 space-x-reverse">
                <a href="https://github.com/Soroushq" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-white/10">
                  <FaGithub className="text-xl" />
                </a>
                <a href="https://www.linkedin.com/in/soroush-qary-08392334b" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-white/10">
                  <FaLinkedin className="text-xl" />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-3 border-b border-white/20 pb-2">نمونه پروژه‌ها</h4>
              <ul className="space-y-1">
                <li>
                  <a href="https://soroushop.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:underline">فروشگاه اینترنتی سروش‌شاپ</a>
                </li>
                <li>
                  <a href="#" className="hover:underline">سیستم برنامه‌ریزی مدرسه</a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-4 border-t border-white/20 text-center text-sm">
            <p>© {new Date().getFullYear()} - تمامی حقوق برای سروش قاری ایوری محفوظ است.</p>
          </div>
        </div>
      </div>
    </div>
  );
}