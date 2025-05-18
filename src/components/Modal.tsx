'use client';

import React, { useEffect, useRef } from 'react';
import { ModalProps } from '@/types';
import { FaTimes } from 'react-icons/fa';
import { useTheme } from '@/context/ThemeContext';

export default function Modal({ isOpen, onClose, children, title }: ModalProps) {
  const { theme } = useTheme();
  const modalRef = useRef<HTMLDivElement>(null);

  // بستن مدال با کلیک خارج از محتوا
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // بستن مدال با کلید Escape
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  // جلوگیری از اسکرول صفحه هنگام باز بودن مدال
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* پس‌زمینه تیره */}
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity" />
      
      {/* محتوای مدال */}
      <div
        ref={modalRef}
        className={`
          relative mx-4 max-w-md w-full rounded-xl shadow-2xl
          transform transition-all duration-300 ease-in-out
          ${theme === 'dark' 
            ? 'bg-gray-900 border border-gray-700 text-white' 
            : 'bg-white text-gray-800'}
          overflow-hidden
        `}
        style={{
          animation: 'modalAppear 0.3s ease-out forwards',
        }}
      >
        {/* هدر مدال */}
        {title && (
          <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">{title}</h3>
              <button
                onClick={onClose}
                className={`p-2 rounded-full transition-colors ${
                  theme === 'dark' 
                    ? 'hover:bg-gray-800 text-gray-400 hover:text-white' 
                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                }`}
              >
                <FaTimes />
              </button>
            </div>
          </div>
        )}
        
        {/* محتوا */}
        <div className="p-6">
          {children}
        </div>
      </div>

      {/* استایل‌های انیمیشن */}
      <style jsx global>{`
        @keyframes modalAppear {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
} 