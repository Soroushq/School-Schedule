'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';

interface AuthCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

const AuthCard: React.FC<AuthCardProps> = ({
  title,
  description,
  children,
  className = '',
}) => {
  const { theme } = useTheme();

  return (
    <div className={`w-full max-w-md px-6 py-8 rounded-lg shadow-lg transition-colors duration-300 
      ${theme === 'dark' 
        ? 'bg-gray-800 text-gray-100 border border-gray-700' 
        : 'bg-white text-gray-900 border border-gray-200'} 
      ${className}`}
    >
      <h2 className="text-2xl font-bold text-center mb-3 font-farhang">
        {title}
      </h2>
      
      {description && (
        <p className={`mb-6 text-center font-farhang ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          {description}
        </p>
      )}
      
      {children}
    </div>
  );
};

export default AuthCard; 