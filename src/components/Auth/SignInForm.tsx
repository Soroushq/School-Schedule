'use client';

import React, { useState } from 'react';
import Input from '../Input/input';
import { useTheme } from '@/context/ThemeContext';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import Captcha from './Captcha';

interface SignInFormProps {
  onSubmit: (email: string, password: string) => void;
  isLoading?: boolean;
  error?: string;
  onForgotPassword?: () => void;
  onSignUpClick?: () => void;
}

const SignInForm: React.FC<SignInFormProps> = ({
  onSubmit,
  isLoading = false,
  error,
  onForgotPassword,
  onSignUpClick,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState<string | null>(null);
  const { theme } = useTheme();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // بررسی کپچا
    if (!captchaToken) {
      setCaptchaError('لطفاً کپچا را تأیید کنید');
      return;
    }
    
    setCaptchaError(null);
    onSubmit(email, password);
  };

  const handleCaptchaChange = (token: string | null) => {
    setCaptchaToken(token);
    if (token) {
      setCaptchaError(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="ایمیل"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="example@email.com"
        required
      />

      <div className="relative">
        <Input
          label="رمز عبور"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="رمز عبور خود را وارد کنید"
          required
        />
        <button
          type="button"
          className={`absolute left-2 top-8 text-xl ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <FiEyeOff /> : <FiEye />}
        </button>
      </div>

      {/* کپچا */}
      <Captcha onChange={handleCaptchaChange} />
      {captchaError && (
        <div className="text-red-500 text-sm text-center">{captchaError}</div>
      )}

      {error && (
        <div className="text-red-500 text-sm pt-1">{error}</div>
      )}

      <div className="flex items-center text-center justify-center pt-2">
        {onForgotPassword && (
          <button
            type="button"
            onClick={onForgotPassword}
            className={`text-sm hover:underline ${
              theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
            }`}
          >
            فراموشی رمز عبور
          </button>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-3 px-4 rounded-md font-medium transition-all duration-300
          ${theme === 'dark'
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
          }
          ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
        `}
      >
        {isLoading ? 'در حال ورود...' : 'ورود'}
      </button>

      {onSignUpClick && (
        <div className="text-center mt-4">
          <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            حساب کاربری ندارید؟{' '}
          </span>
          <button
            type="button"
            onClick={onSignUpClick}
            className={`${
              theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
            } hover:underline font-medium`}
          >
            ثبت‌نام
          </button>
        </div>
      )}
    </form>
  );
};

export default SignInForm; 