'use client';

import React, { useRef, useEffect } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { useTheme } from '@/context/ThemeContext';

// کلید سایت reCAPTCHA (این کلید تستی است و در محیط واقعی باید با کلید اختصاصی خود جایگزین شود)
const RECAPTCHA_SITE_KEY = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

interface CaptchaProps {
  onChange: (token: string | null) => void;
  className?: string;
}

const Captcha: React.FC<CaptchaProps> = ({ onChange, className = '' }) => {
  const { theme } = useTheme();
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  useEffect(() => {
    // هر بار که تم تغییر می‌کند، کپچا را بازنشانی کنید تا با تم جدید سازگار شود
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
  }, [theme]);

  return (
    <div className={`flex justify-center my-4 ${className}`}>
      <ReCAPTCHA
        ref={recaptchaRef}
        sitekey={RECAPTCHA_SITE_KEY}
        onChange={onChange}
        theme={theme === 'dark' ? 'dark' : 'light'}
        hl="fa" // زبان فارسی
      />
    </div>
  );
};

export default Captcha; 