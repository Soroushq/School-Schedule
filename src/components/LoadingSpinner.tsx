'use client';

import { useEffect } from 'react';
import { hourglass } from 'ldrs';

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
  speed?: number;
  bgOpacity?: number;
  className?: string;
}

const LoadingSpinner = ({
  size = 40,
  color = '#000',
  speed = 1.75,
  bgOpacity = 0.1,
  className = ''
}: LoadingSpinnerProps) => {
  useEffect(() => {
    // ثبت کامپوننت ساعت شنی در سمت کلاینت
    hourglass.register();
  }, []);

  return (
    <div className={`flex items-center justify-center ${className}`}>
      {/* @ts-ignore */}
      <l-hourglass
        size={size.toString()}
        color={color}
        speed={speed.toString()}
        bg-opacity={bgOpacity.toString()}
      />
    </div>
  );
};

export default LoadingSpinner; 