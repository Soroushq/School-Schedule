'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { FaUser, FaLock, FaEnvelope, FaIdCard, FaBuilding, FaUserTie } from 'react-icons/fa';
import { useTheme } from '@/context/ThemeContext';
import Modal from '@/components/Modal';
import { signUpSchema } from '@/lib/validations';
import { SignUpFormData } from '@/types';
import { UserRole } from '@/lib/auth';

export default function SignUp() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { theme } = useTheme();
  
  const { register, handleSubmit, watch, formState: { errors }, setValue, reset } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      passwordConfirm: '',
      personnelCode: '',
      organizationCode: '',
      role: UserRole.USER,
    }
  });
  
  const password = watch('password');
  const selectedRole = watch('role');

  const onSubmit = async (data: SignUpFormData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'خطایی رخ داد.');
      }
      
      setSuccess(true);
      reset();
      setIsModalOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطایی رخ داد. لطفاً دوباره تلاش کنید.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex justify-center py-12 px-4 sm:px-6 lg:px-8 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className={`max-w-4xl w-full space-y-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-8 rounded-lg shadow-lg`}>
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold">
            ایجاد حساب کاربری
          </h2>
          <p className={`mt-2 text-center text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            قبلاً ثبت‌نام کرده‌اید؟{' '}
            <Link href="/auth/signin" className="font-medium text-blue-600 hover:text-blue-500">
              وارد شوید
            </Link>
          </p>
        </div>
        
        {error && (
          <div className="bg-red-500 text-white p-3 rounded-md text-sm font-medium">
            {error}
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* نام و نام خانوادگی */}
            <div>
              <label 
                htmlFor="name" 
                className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}
              >
                نام و نام خانوادگی
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <FaUser className="text-gray-400" />
                </div>
                <input
                  id="name"
                  type="text"
                  className={`
                    block w-full pr-10 
                    py-2 px-3 border ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} 
                    rounded-md shadow-sm 
                    ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}
                    focus:outline-none focus:ring-blue-500 focus:border-blue-500
                  `}
                  placeholder="نام و نام خانوادگی خود را وارد کنید"
                  {...register('name')}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            
            {/* ایمیل */}
            <div>
              <label 
                htmlFor="email" 
                className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}
              >
                ایمیل
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <FaEnvelope className="text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  className={`
                    block w-full pr-10 
                    py-2 px-3 border ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} 
                    rounded-md shadow-sm 
                    ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}
                    focus:outline-none focus:ring-blue-500 focus:border-blue-500
                  `}
                  placeholder="ایمیل خود را وارد کنید"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
            
            {/* رمز عبور */}
            <div>
              <label 
                htmlFor="password" 
                className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}
              >
                رمز عبور
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  className={`
                    block w-full pr-10 
                    py-2 px-3 border ${errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} 
                    rounded-md shadow-sm 
                    ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}
                    focus:outline-none focus:ring-blue-500 focus:border-blue-500
                  `}
                  placeholder="رمز عبور خود را وارد کنید"
                  {...register('password')}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>
            
            {/* تکرار رمز عبور */}
            <div>
              <label 
                htmlFor="passwordConfirm" 
                className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}
              >
                تکرار رمز عبور
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  id="passwordConfirm"
                  type="password"
                  className={`
                    block w-full pr-10 
                    py-2 px-3 border ${errors.passwordConfirm ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} 
                    rounded-md shadow-sm 
                    ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}
                    focus:outline-none focus:ring-blue-500 focus:border-blue-500
                  `}
                  placeholder="رمز عبور خود را مجدداً وارد کنید"
                  {...register('passwordConfirm')}
                />
              </div>
              {errors.passwordConfirm && (
                <p className="mt-1 text-sm text-red-500">{errors.passwordConfirm.message}</p>
              )}
            </div>
            
            {/* کد پرسنلی */}
            <div>
              <label 
                htmlFor="personnelCode" 
                className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}
              >
                کد پرسنلی (اختیاری)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <FaIdCard className="text-gray-400" />
                </div>
                <input
                  id="personnelCode"
                  type="text"
                  className={`
                    block w-full pr-10 
                    py-2 px-3 border ${errors.personnelCode ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} 
                    rounded-md shadow-sm 
                    ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}
                    focus:outline-none focus:ring-blue-500 focus:border-blue-500
                  `}
                  placeholder="کد پرسنلی خود را وارد کنید"
                  {...register('personnelCode')}
                />
              </div>
              {errors.personnelCode && (
                <p className="mt-1 text-sm text-red-500">{errors.personnelCode.message}</p>
              )}
            </div>
            
            {/* کد سازمانی */}
            <div>
              <label 
                htmlFor="organizationCode" 
                className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}
              >
                کد سازمانی (اختیاری)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <FaBuilding className="text-gray-400" />
                </div>
                <input
                  id="organizationCode"
                  type="text"
                  className={`
                    block w-full pr-10 
                    py-2 px-3 border ${errors.organizationCode ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} 
                    rounded-md shadow-sm 
                    ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}
                    focus:outline-none focus:ring-blue-500 focus:border-blue-500
                  `}
                  placeholder="کد سازمانی مربوطه را وارد کنید"
                  {...register('organizationCode')}
                />
              </div>
              {errors.organizationCode && (
                <p className="mt-1 text-sm text-red-500">{errors.organizationCode.message}</p>
              )}
            </div>
            
            {/* نقش کاربری */}
            <div className="md:col-span-2">
              <label 
                htmlFor="role" 
                className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}
              >
                نقش کاربری
              </label>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  type="button"
                  onClick={() => setValue('role', UserRole.USER)}
                  className={`
                    p-3 text-sm rounded-lg border flex flex-col items-center justify-center gap-2 transition-colors
                    ${selectedRole === UserRole.USER 
                      ? theme === 'dark' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-blue-100 border-blue-300 text-blue-800' 
                      : theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-gray-100 border-gray-300 text-gray-700'}
                  `}
                >
                  <FaUser className="text-xl" />
                  <span>کاربر عادی</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setValue('role', UserRole.EDUCATOR)}
                  className={`
                    p-3 text-sm rounded-lg border flex flex-col items-center justify-center gap-2 transition-colors
                    ${selectedRole === UserRole.EDUCATOR 
                      ? theme === 'dark' ? 'bg-purple-600 border-purple-500 text-white' : 'bg-purple-100 border-purple-300 text-purple-800' 
                      : theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-gray-100 border-gray-300 text-gray-700'}
                  `}
                >
                  <FaUserTie className="text-xl" />
                  <span>معلم/مربی</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setValue('role', UserRole.INSTITUTE_ADMIN)}
                  className={`
                    p-3 text-sm rounded-lg border flex flex-col items-center justify-center gap-2 transition-colors
                    ${selectedRole === UserRole.INSTITUTE_ADMIN 
                      ? theme === 'dark' ? 'bg-yellow-600 border-yellow-500 text-white' : 'bg-yellow-100 border-yellow-300 text-yellow-800' 
                      : theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-gray-100 border-gray-300 text-gray-700'}
                  `}
                >
                  <FaBuilding className="text-xl" />
                  <span>مدیر مؤسسه</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setValue('role', UserRole.ORG_EXPERT)}
                  className={`
                    p-3 text-sm rounded-lg border flex flex-col items-center justify-center gap-2 transition-colors
                    ${selectedRole === UserRole.ORG_EXPERT 
                      ? theme === 'dark' ? 'bg-green-600 border-green-500 text-white' : 'bg-green-100 border-green-300 text-green-800' 
                      : theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-gray-100 border-gray-300 text-gray-700'}
                  `}
                >
                  <FaIdCard className="text-xl" />
                  <span>کارشناس سازمان</span>
                </button>
              </div>
              {errors.role && (
                <p className="mt-1 text-sm text-red-500">{errors.role.message}</p>
              )}
              
              <div className={`mt-3 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <p>
                  - <strong>کاربر عادی:</strong> دسترسی محدود به مشاهده اطلاعات
                </p>
                <p>
                  - <strong>معلم/مربی:</strong> دسترسی به برنامه کلاسی و اطلاعات مرتبط با خود
                </p>
                <p>
                  - <strong>مدیر مؤسسه:</strong> دسترسی به مدیریت برنامه‌ها و کاربران یک مؤسسه خاص
                </p>
                <p>
                  - <strong>کارشناس سازمان:</strong> دسترسی به مدیریت کلی مؤسسات و برنامه‌ها
                </p>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`
                group relative w-full flex justify-center 
                py-3 px-4 border border-transparent 
                text-md font-medium rounded-md text-white 
                ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} 
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                transition-colors
              `}
            >
              {loading ? 'در حال ثبت‌نام...' : 'ثبت‌نام'}
            </button>
          </div>
        </form>
      </div>
      
      {/* مدال موفقیت */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          router.push('/auth/signin');
        }}
        title="ثبت‌نام با موفقیت انجام شد"
      >
        <div className="text-center">
          <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full ${theme === 'dark' ? 'bg-green-800' : 'bg-green-100'} mb-4`}>
            <svg className={`h-8 w-8 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className={`text-lg ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'} mb-4`}>
            ثبت‌نام شما با موفقیت انجام شد.
          </p>
          <p className={`mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            حساب کاربری شما ایجاد شده و اکنون می‌توانید وارد سیستم شوید.
          </p>
          <button
            className={`w-full py-2 px-4 mt-4 rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors`}
            onClick={() => {
              setIsModalOpen(false);
              router.push('/auth/signin');
            }}
          >
            ورود به سیستم
          </button>
        </div>
      </Modal>
    </div>
  );
} 