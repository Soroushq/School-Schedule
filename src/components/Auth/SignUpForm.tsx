'use client';

import React, { useState } from 'react';
import Input from '../Input/input';
import { useTheme } from '@/context/ThemeContext';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import Captcha from './Captcha';

interface SignUpFormProps {
  onSubmit: (name: string, email: string, password: string) => void;
  isLoading?: boolean;
  error?: string;
  onSignInClick?: () => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({
  onSubmit,
  isLoading = false,
  error,
  onSignInClick,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState<string | null>(null);
  const { theme } = useTheme();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setPasswordError('رمز عبور و تکرار آن مطابقت ندارد');
      return;
    }
    
    // بررسی کپچا
    if (!captchaToken) {
      setCaptchaError('لطفاً کپچا را تأیید کنید');
      return;
    }
    
    setPasswordError('');
    setCaptchaError(null);
    onSubmit(name, email, password);
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
        label="نام و نام خانوادگی"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="نام و نام خانوادگی خود را وارد کنید"
        required
      />

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
          className={`absolute left-2 top-9 text-xl ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <FiEyeOff /> : <FiEye />}
        </button>
      </div>

      <Input
        label="تکرار رمز عبور"
        type={showPassword ? "text" : "password"}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="رمز عبور را مجدداً وارد کنید"
        required
      />

      {/* کپچا */}
      <Captcha onChange={handleCaptchaChange} />
      {captchaError && (
        <div className="text-red-500 text-sm text-center">{captchaError}</div>
      )}

      {passwordError && (
        <div className="text-red-500 text-sm pt-1">{passwordError}</div>
      )}
      
      {error && (
        <div className="text-red-500 text-sm pt-1">{error}</div>
      )}

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
        {isLoading ? 'در حال ثبت‌نام...' : 'ثبت‌نام'}
      </button>

      {onSignInClick && (
        <div className="text-center mt-4">
          <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            قبلاً ثبت‌نام کرده‌اید؟{' '}
          </span>
          <button
            type="button"
            onClick={onSignInClick}
            className={`${
              theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
            } hover:underline font-medium`}
          >
            ورود
          </button>
        </div>
      )}
    </form>
  );
};

export default SignUpForm; 