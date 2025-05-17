"use client";

import React, { useEffect, useRef } from 'react';
import { IoCloseSharp } from "react-icons/io5";
import { useTheme } from '@/context/ThemeContext';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  width?: string;
  height?: string;
  maxWidth?: string;
  maxHeight?: string;
  minWidth?: string;
  minHeight?: string;
  className?: string;
  closeOnClickOutside?: boolean;
  showCloseButton?: boolean;
  closeButtonClassName?: string;
  titleClassName?: string;
  contentClassName?: string;
  overlayClassName?: string;
  animationDuration?: number;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  width = 'auto',
  height = 'auto',
  maxWidth = '90vw',
  maxHeight = '90vh',
  minWidth = '200px',
  minHeight = '200px',
  className = '',
  closeOnClickOutside = true,
  showCloseButton = true,
  closeButtonClassName = '',
  titleClassName = '',
  contentClassName = '',
  overlayClassName = '',
  animationDuration = 300
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  // بستن مدال با کلید Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // جلوگیری از اسکرول صفحه پشت مدال
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  // بستن مدال با کلیک خارج از آن
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnClickOutside && e.target === overlayRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm transition-opacity duration-${animationDuration} ${
        theme === 'dark' ? 'bg-black/70' : 'bg-black/50'
      } ${overlayClassName}`}
      onClick={handleOverlayClick}
      style={{ transitionDuration: `${animationDuration}ms` }}
    >
      <div
        ref={modalRef}
        className={`rounded-lg shadow-xl overflow-hidden flex flex-col relative font-farhang transition-all duration-200 ease-in-out ${
          theme === 'dark' 
            ? 'bg-gray-800 text-gray-100 border border-gray-700' 
            : 'bg-white text-gray-900'
        } ${className}`}
        style={{
          width,
          height,
          maxWidth,
          maxHeight,
          minWidth,
          minHeight,
          transitionDuration: `${animationDuration}ms`,
          animation: `modalFadeIn ${animationDuration}ms ease-out`,
          boxShadow: theme === 'dark' 
            ? '0 0 15px rgba(0, 0, 0, 0.3)' 
            : '0 0 15px rgba(0, 0, 0, 0.1)'
        }}
      >
        {/* هدر مدال */}
        {(title || showCloseButton) && (
          <div className={`flex items-center justify-between p-4 border-b transition-colors duration-200 ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}>
            {title && (
              <h3 className={`text-lg font-semibold font-farhang transition-colors duration-200 ${
                theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              } ${titleClassName}`}>
                {title}
              </h3>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className={`transition-colors duration-200 hover:bg-opacity-10 rounded-full p-1 ${
                  theme === 'dark'
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-300'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-500'
                } focus:outline-none ${closeButtonClassName}`}
                aria-label="بستن"
              >
                <IoCloseSharp className="text-2xl" />
              </button>
            )}
          </div>
        )}

        {/* محتوای مدال */}
        <div className={`flex-1 overflow-auto p-4 transition-colors duration-200 ${
          theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
        } ${contentClassName}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal; 