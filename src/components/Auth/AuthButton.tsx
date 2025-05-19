'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { FiLogIn, FiLogOut, FiUser } from 'react-icons/fi';
import LoginModal from './LoginModal';

const AuthButton: React.FC = () => {
  const { isLoggedIn, user, logout, loginModalOpen, openLoginModal, closeLoginModal } = useAuthContext();
  const { theme } = useTheme();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSignUpClick = () => {
    closeLoginModal();
    router.push('/signup');
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    router.refresh();
  };

  if (isLoggedIn && user) {
    return (
      <div className="relative">
        <button 
          onClick={toggleDropdown}
          className={`flex items-center space-x-2 rounded-full p-2 transition-colors ${
            theme === 'dark' 
              ? 'hover:bg-gray-700 text-gray-200' 
              : 'hover:bg-gray-100 text-gray-800'
          }`}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'
          } text-white`}>
            <FiUser />
          </div>
          <span className="mr-2 hidden md:inline text-sm font-farhang">{user.name}</span>
        </button>
        
        {dropdownOpen && (
          <div className={`absolute left-0 mt-2 w-48 rounded-md shadow-lg z-10 ${
            theme === 'dark' 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white border border-gray-200'
          }`}>
            <div className="py-1">
              <button
                onClick={handleLogout}
                className={`w-full text-right px-4 py-2 text-sm flex items-center transition-colors ${
                  theme === 'dark' 
                    ? 'text-gray-300 hover:bg-gray-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FiLogOut className="ml-2" />
                خروج از حساب کاربری
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center">
        <button
          onClick={openLoginModal}
          className={`flex items-center px-4 py-2 rounded-md text-sm transition-all transform hover:scale-105 ${
            theme === 'dark'
              ? 'bg-gradient-to-r  from-cyan-600 to-emerald-500 text-white'
              : 'bg-gradient-to-r from-blue-700 to-blue-900 text-white transition-all duration-300'
          }`}
        >
          <FiLogIn className="ml-1" />
          ورود
        </button>
      </div>

      <LoginModal 
        isOpen={loginModalOpen} 
        onClose={closeLoginModal} 
        onSignUpClick={handleSignUpClick} 
      />
    </>
  );
};

export default AuthButton; 