'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { FaEnvelope } from 'react-icons/fa';
import { useTheme } from '@/context/ThemeContext';
import { forgotPasswordSchema } from '@/lib/validations';

type ForgotPasswordFormData = {
  email: string;
};

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { theme } = useTheme();
  
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    }
  });
  
  const onSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true);
    setError(null);
    
    try {
      // در محیط واقعی، این درخواست به یک API برای ارسال ایمیل بازیابی ارسال می‌شود
      // const response = await fetch('/api/auth/forgot-password', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(data),
      // });
      
      // const result = await response.json();
      
      // if (!response.ok) {
      //   throw new Error(result.message || 'خطایی رخ داد.');
      // }
      
      // فعلاً شبیه‌سازی می‌کنیم که درخواست موفقیت‌آمیز بوده
      setTimeout(() => {
        setSuccess(true);
        setLoading(false);
      }, 1500);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطایی رخ داد. لطفاً دوباره تلاش کنید.');
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className={`max-w-md w-full space-y-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-8 rounded-lg shadow-lg`}>
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold">
            بازیابی رمز عبور
          </h2>
          <p className={`mt-2 text-center text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            رمز عبور خود را فراموش کرده‌اید؟ لطفاً ایمیل خود را وارد کنید تا لینک بازیابی رمز عبور برای شما ارسال شود.
          </p>
        </div>
        
        {error && (
          <div className="bg-red-500 text-white p-3 rounded-md text-sm font-medium">
            {error}
          </div>
        )}
        
        {success ? (
          <div className="space-y-6 text-center">
            <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full ${theme === 'dark' ? 'bg-green-800' : 'bg-green-100'} mb-4`}>
              <svg className={`h-8 w-8 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className={`text-lg ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'} mb-4`}>
              ایمیل بازیابی ارسال شد
            </p>
            <p className={`mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              لینک بازیابی رمز عبور به ایمیل شما ارسال شد. لطفاً صندوق ورودی خود را چک کنید.
            </p>
            <Link
              href="/auth/signin"
              className={`block w-full py-2 px-4 rounded-md text-white text-center bg-blue-600 hover:bg-blue-700 transition-colors`}
            >
              بازگشت به صفحه ورود
            </Link>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
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

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`
                  group relative w-full flex justify-center 
                  py-2 px-4 border border-transparent 
                  text-sm font-medium rounded-md text-white 
                  ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} 
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                `}
              >
                {loading ? 'در حال ارسال...' : 'ارسال لینک بازیابی'}
              </button>
            </div>
            
            <div className="text-center">
              <Link href="/auth/signin" className="font-medium text-blue-600 hover:text-blue-500">
                بازگشت به صفحه ورود
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 