"use client";

import React, { useState, useEffect } from 'react';
import { hybridStorageService } from '../services/hybridStorageService';
import { apiService } from '../services/apiService';

const ApiToggle: React.FC = () => {
  const [useApi, setUseApi] = useState(false);
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    // بررسی وضعیت فعلی
    setUseApi(hybridStorageService.isUsingApi());
    
    // بررسی وضعیت API
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    try {
      await apiService.healthCheck();
      setApiStatus('online');
    } catch (error) {
      setApiStatus('offline');
    }
  };

  const handleToggle = () => {
    const newValue = !useApi;
    setUseApi(newValue);
    hybridStorageService.setUseApi(newValue);
    
    // ذخیره در localStorage برای حفظ تنظیمات
    localStorage.setItem('useApi', newValue.toString());
  };

  const getStatusColor = () => {
    switch (apiStatus) {
      case 'online': return 'text-green-600';
      case 'offline': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  const getStatusText = () => {
    switch (apiStatus) {
      case 'online': return 'آنلاین';
      case 'offline': return 'آفلاین';
      default: return 'در حال بررسی...';
    }
  };

  return (
    <div className="fixed bottom-4 left-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
      <div className="flex flex-col space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            حالت ذخیره‌سازی:
          </span>
          <button
            onClick={checkApiStatus}
            className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
          >
            بررسی مجدد
          </button>
        </div>
        
        <div className="flex items-center space-x-3 space-x-reverse">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={useApi}
              onChange={handleToggle}
              className="sr-only"
            />
            <div className={`relative w-11 h-6 rounded-full transition-colors ${
              useApi ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
            }`}>
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                useApi ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </div>
            <span className="mr-3 text-sm text-gray-700 dark:text-gray-300">
              {useApi ? 'API' : 'localStorage'}
            </span>
          </label>
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500 dark:text-gray-400">
            وضعیت API:
          </span>
          <span className={`font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
        
        {apiStatus === 'offline' && useApi && (
          <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
            ⚠️ API در دسترس نیست. از localStorage استفاده می‌شود.
          </div>
        )}
        
        {apiStatus === 'online' && useApi && (
          <div className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded">
            ✅ متصل به سرور backend
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiToggle; 