'use client';

import React, { useState } from 'react';
import Modal from '../Modal/modal';
import SignInForm from './SignInForm';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'next/navigation';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignUpClick?: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSignUpClick,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const { theme } = useTheme();
  const router = useRouter();

  const handleSubmit = async (email: string, password: string) => {
    setIsLoading(true);
    setError(undefined);
    
    try {
      // در اینجا API واقعی خود را صدا بزنید
      // مثال API موقت:
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // بررسی اعتبار ایمیل و رمز عبور
      if (email === 'test@example.com' && password === 'password') {
        // ذخیره اطلاعات کاربر در localStorage یا state
        const mockUser = {
          id: '1',
          name: 'کاربر تست',
          email: 'test@example.com'
        };
        
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('user', JSON.stringify(mockUser));
        
        onClose();
        // بازسازی مسیر فعلی برای بروزرسانی UI
        router.refresh();
      } else {
        setError('ایمیل یا رمز عبور اشتباه است');
      }
    } catch (err) {
      setError('خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // منطق فراموشی رمز عبور
    console.log('فراموشی رمز عبور');
  };

  const handleSignUpClick = () => {
    onClose();
    if (onSignUpClick) {
      onSignUpClick();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="ورود به حساب کاربری"
      width="90%"
      maxWidth="750px"
      className={`${theme === 'dark' ? 'bg-gradient-to-bl from-gray-800 to-gray-950' : 'bg-gradient-to-br from-white to-gray-100'}`}
      overlayClassName="backdrop-blur-sm bg-black/50 dark:bg-black/70"
    >
      <div className="flex flex-col md:flex-row rtl">

         {/*موبایل بخش توضیحات */}
         <div className={`w-full sm:hidden p-4 flex flex-col justify-center items-center  ${
          theme === 'dark' ? 'text-gray-200' : 'text-gray-700 '
        }`}>
          <h3 className="text-xl font-bold mb-4 text-center font-farhang">
            خوش آمدید
          </h3>
          <p className="text-center mb-4 font-farhang">
            وارد حساب کاربری خود شوید تا بتوانید از امکانات کامل سیستم استفاده کنید.
          </p>
          <div className={`w-full h-1 my-4 ${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'} rounded-full animate-pulse`}></div>
        </div>


        {/* فرم ورود */}
        <div className="w-full md:w-3/5 ml-4 p-4">
          <SignInForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            error={error}
            onForgotPassword={handleForgotPassword}
            onSignUpClick={handleSignUpClick}
          />
        </div>
         {/* بخش توضیحات */}
         <div className={`hidden sm:flex p-4 flex-col justify-center items-center border-r border-gray-300  ${
          theme === 'dark' ? 'text-gray-200' : 'text-gray-700 '
        }`}>
          <h3 className="text-xl font-bold mb-4 text-center font-farhang">
            خوش آمدید
          </h3>
          <p className="text-center mb-4 font-farhang">
            وارد حساب کاربری خود شوید تا بتوانید از امکانات کامل سیستم استفاده کنید.
          </p>
          <div className={`w-full h-1 my-4 ${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'} rounded-full animate-pulse`}></div>
        </div>
        
       
      </div>
    </Modal>
  );
};

export default LoginModal; 