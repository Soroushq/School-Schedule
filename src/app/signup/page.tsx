'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import SignUpForm from '@/components/Auth/SignUpForm';
import SignInForm from '@/components/Auth/SignInForm';
import AuthCard from '@/components/Auth/AuthCard';
import Modal from '@/components/Modal/modal';
import { useAuthContext } from '@/context/AuthContext';

export default function SignUpPage() {
  const [activeTab, setActiveTab] = useState<'signup' | 'signin'>('signup');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const { theme } = useTheme();
  const router = useRouter();
  const { isLoggedIn, signup, login } = useAuthContext();
  
  useEffect(() => {
    // اگر کاربر وارد شده باشد، به صفحه اصلی هدایت می‌شود
    if (isLoggedIn) {
      router.push('/');
    }
  }, [isLoggedIn, router]);

  const handleSignUp = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    setError(undefined);
    
    try {
      const success = await signup(name, email, password);
      
      if (success) {
        router.push('/');
      } else {
        setError('خطا در ایجاد حساب کاربری. لطفاً دوباره تلاش کنید.');
      }
    } catch (err) {
      setError('خطا در ارتباط با سرور. لطفاً بعداً دوباره تلاش کنید.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    setIsLoading(true);
    setError(undefined);
    
    try {
      const success = await login(email, password);
      
      if (success) {
        router.push('/');
      } else {
        setError('ایمیل یا رمز عبور اشتباه است');
      }
    } catch (err) {
      setError('خطا در ارتباط با سرور. لطفاً بعداً دوباره تلاش کنید.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 auth-bg">
      <div className="w-full max-w-4xl">
        <Modal
          isOpen={true}
          onClose={() => router.push('/')}
          title={activeTab === 'signup' ? 'ثبت‌نام در سیستم' : 'ورود به سیستم'}
          width="100%"
          maxWidth="1000px"
          className={`overflow-hidden border-0 ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-gray-800 to-gray-900' 
              : 'bg-gradient-to-br from-white to-gray-100'
          }`}
        >
          <div className="flex flex-col md:flex-row rtl min-h-[500px]">
            {/* بخش اطلاعات */}
            <div className={`w-full md:w-2/5 p-6 flex flex-col justify-center items-center ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            } auth-info-bg`}>
              <h3 className="text-2xl font-bold mb-6 text-center font-farhang">
                {activeTab === 'signup' ? 'به جمع ما بپیوندید' : 'خوش برگشتید'}
              </h3>
              <p className="text-center mb-8 font-farhang text-lg leading-relaxed">
                {activeTab === 'signup' 
                  ? 'با ثبت‌نام در سیستم برنامه‌ریزی مدرسه می‌توانید از تمامی امکانات سیستم استفاده کنید.'
                  : 'وارد حساب کاربری خود شوید تا بتوانید از امکانات کامل سیستم استفاده کنید.'
                }
              </p>
              
              <div className="mt-8 w-full">
                <button
                  onClick={() => setActiveTab(activeTab === 'signup' ? 'signin' : 'signup')}
                  className={`w-full py-3 px-4 rounded-md font-medium transition-all duration-300 ${
                    theme === 'dark'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {activeTab === 'signup' ? 'قبلاً ثبت‌نام کرده‌ام' : 'ایجاد حساب جدید'}
                </button>
              </div>
              
              <div className={`w-1/2 h-1 my-8 ${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'} rounded-full animate-pulse`}></div>
            </div>

            {/* بخش فرم */}
            <div className="w-full md:w-3/5 p-6 flex items-center justify-center">
              <AuthCard 
                title={activeTab === 'signup' ? 'ثبت‌نام در سیستم' : 'ورود به سیستم'}
                className="w-full max-w-md border-0 shadow-xl"
              >
                {activeTab === 'signup' ? (
                  <SignUpForm
                    onSubmit={handleSignUp}
                    isLoading={isLoading}
                    error={error}
                    onSignInClick={() => setActiveTab('signin')}
                  />
                ) : (
                  <SignInForm
                    onSubmit={handleSignIn}
                    isLoading={isLoading}
                    error={error}
                    onSignUpClick={() => setActiveTab('signup')}
                  />
                )}
              </AuthCard>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
} 