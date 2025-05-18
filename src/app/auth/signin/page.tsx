'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { FaGoogle, FaGithub, FaLock, FaUser, FaBuilding, FaIdCard, FaEnvelope } from 'react-icons/fa';
import { useTheme } from '@/context/ThemeContext';
import { signInSchema } from '@/lib/validations';
import { SignInFormData } from '@/types';

export default function SignIn() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/welcome';
  
  const { register, handleSubmit, watch, formState: { errors }, setValue } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      loginType: 'email',
      identifier: '',
      password: '',
      organizationCode: '',
    }
  });
  
  const loginType = watch('loginType');

  const onSubmit = async (data: SignInFormData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await signIn('credentials', {
        redirect: false,
        loginType: data.loginType,
        identifier: data.identifier,
        password: data.password,
        organizationCode: data.organizationCode,
      });
      
      if (result?.error) {
        setError(result.error);
      } else {
        router.push(callbackUrl);
      }
    } catch (err) {
      setError('خطایی رخ داد. لطفاً دوباره تلاش کنید.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className={`max-w-md w-full space-y-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-8 rounded-lg shadow-lg`}>
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold">
            ورود به سیستم
          </h2>
          <p className={`mt-2 text-center text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            حساب کاربری ندارید؟{' '}
            <Link href="/auth/signup" className="font-medium text-blue-600 hover:text-blue-500">
              ثبت‌نام کنید
            </Link>
          </p>
        </div>
        
        {error && (
          <div className="bg-red-500 text-white p-3 rounded-md text-sm font-medium">
            {error}
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md -space-y-px">
            {/* انتخاب نوع ورود */}
            <div className="flex mb-4 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
              <button
                type="button"
                onClick={() => setValue('loginType', 'email')}
                className={`flex-1 py-2 px-4 flex items-center justify-center gap-2 ${
                  loginType === 'email' 
                    ? theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white' 
                    : theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                }`}
              >
                <FaEnvelope />
                <span>ورود با ایمیل</span>
              </button>
              <button
                type="button"
                onClick={() => setValue('loginType', 'personnelCode')}
                className={`flex-1 py-2 px-4 flex items-center justify-center gap-2 ${
                  loginType === 'personnelCode' 
                    ? theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white' 
                    : theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                }`}
              >
                <FaIdCard />
                <span>ورود با کد پرسنلی</span>
              </button>
            </div>
            
            {/* فیلد شناسه */}
            <div className="mb-4">
              <label 
                htmlFor="identifier" 
                className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}
              >
                {loginType === 'email' ? 'ایمیل' : 'کد پرسنلی'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  {loginType === 'email' ? <FaEnvelope className="text-gray-400" /> : <FaIdCard className="text-gray-400" />}
                </div>
                <input
                  id="identifier"
                  type={loginType === 'email' ? 'email' : 'text'}
                  autoComplete={loginType === 'email' ? 'email' : 'username'}
                  className={`
                    block w-full pr-10 
                    py-2 px-3 border ${errors.identifier ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} 
                    rounded-md shadow-sm 
                    ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}
                    focus:outline-none focus:ring-blue-500 focus:border-blue-500
                  `}
                  placeholder={loginType === 'email' ? 'ایمیل خود را وارد کنید' : 'کد پرسنلی خود را وارد کنید'}
                  {...register('identifier')}
                />
              </div>
              {errors.identifier && (
                <p className="mt-1 text-sm text-red-500">{errors.identifier.message}</p>
              )}
            </div>
            
            {/* فیلد کد سازمانی - فقط برای ورود با کد پرسنلی */}
            {loginType === 'personnelCode' && (
              <div className="mb-4">
                <label 
                  htmlFor="organizationCode" 
                  className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}
                >
                  کد سازمانی
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
                    placeholder="کد سازمانی را وارد کنید"
                    {...register('organizationCode')}
                  />
                </div>
                {errors.organizationCode && (
                  <p className="mt-1 text-sm text-red-500">{errors.organizationCode.message}</p>
                )}
              </div>
            )}
            
            {/* فیلد رمز عبور */}
            <div className="mb-4">
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
                  autoComplete="current-password"
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
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link href="/auth/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                رمز عبور خود را فراموش کرده‌اید؟
              </Link>
            </div>
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
              {loading ? 'در حال ورود...' : 'ورود'}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className={`px-2 ${theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-500'}`}>
                یا ورود با
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => signIn('google', { callbackUrl })}
              className={`w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium
              ${theme === 'dark' ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
            >
              <FaGoogle className="ml-2" />
              Google
            </button>
            <button
              type="button"
              onClick={() => signIn('github', { callbackUrl })}
              className={`w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium
              ${theme === 'dark' ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
            >
              <FaGithub className="ml-2" />
              GitHub
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 