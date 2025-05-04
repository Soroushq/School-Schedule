"use client";

import React, { useEffect, useRef } from 'react';
import { IoCloseSharp } from "react-icons/io5";

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
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-${animationDuration} ${overlayClassName}`}
      onClick={handleOverlayClick}
      style={{ transitionDuration: `${animationDuration}ms` }}
    >
      <div
        ref={modalRef}
        className={`bg-white rounded-lg shadow-xl overflow-hidden flex flex-col relative font-farhang ${className}`}
        style={{
          width,
          height,
          maxWidth,
          maxHeight,
          minWidth,
          minHeight,
          transitionDuration: `${animationDuration}ms`,
          animation: `modalFadeIn ${animationDuration}ms ease-out`
        }}
      >
        {/* هدر مدال */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-4 border-b">
            {title && (
              <h3 className={`text-lg font-semibold font-farhang ${titleClassName}`}>{title}</h3>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className={`text-gray-500 hover:text-gray-700 focus:outline-none ${closeButtonClassName}`}
                aria-label="بستن"
              >
                <IoCloseSharp className="text-2xl" />
              </button>
            )}
          </div>
        )}

        {/* محتوای مدال */}
        <div className={`flex-1 overflow-auto p-4 ${contentClassName}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal; 