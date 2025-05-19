'use client';

import { useState, useEffect } from 'react';

interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // بررسی وضعیت ورود کاربر از localStorage
    const checkLoginStatus = () => {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const userData = localStorage.getItem('user');
      
      setIsLoggedIn(loggedIn);
      
      if (loggedIn && userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (error) {
          console.error('خطا در خواندن اطلاعات کاربر:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      
      setIsLoading(false);
    };

    checkLoginStatus();

    // گوش دادن به تغییرات localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'isLoggedIn' || e.key === 'user') {
        checkLoginStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // در اینجا احراز هویت واقعی را انجام دهید
      // فعلاً یک API ساختگی استفاده می‌کنیم
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (email === 'test@example.com' && password === 'password') {
        const mockUser = {
          id: '1',
          name: 'کاربر تست',
          email: 'test@example.com'
        };
        
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('user', JSON.stringify(mockUser));
        
        setIsLoggedIn(true);
        setUser(mockUser);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('خطا در ورود:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // در اینجا ثبت‌نام واقعی را انجام دهید
      // فعلاً یک API ساختگی استفاده می‌کنیم
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser = {
        id: Math.random().toString(36).substring(2, 15),
        name,
        email
      };
      
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      setIsLoggedIn(true);
      setUser(mockUser);
      return true;
    } catch (error) {
      console.error('خطا در ثبت‌نام:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
  };

  return {
    isLoggedIn,
    isLoading,
    user,
    login,
    signup,
    logout
  };
};

export default useAuth; 