import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface EducationLevelPageProps {
  levelId: string;
  levelName: string;
  levelImage?: string;
  description?: string;
}

export const EducationLevelPage: React.FC<EducationLevelPageProps> = ({
  levelId,
  levelName,
  levelImage,
  description
}) => {
  const router = useRouter();

  const handlePersonnelSchedule = () => {
    // ذخیره اطلاعات مقطع انتخاب شده
    localStorage.setItem('selectedLevel', levelId);
    // انتقال به صفحه برنامه پرسنل
    router.push('/personnel-schedule');
  };

  const handleClassSchedule = () => {
    // ذخیره اطلاعات مقطع انتخاب شده
    localStorage.setItem('selectedLevel', levelId);
    // انتقال به صفحه انتخاب کلاس
    router.push('/class-schedule/select-class');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          {levelImage && (
            <div className="md:flex-shrink-0">
              <img
                className="h-48 w-full object-cover md:w-48"
                src={levelImage}
                alt={levelName}
              />
            </div>
          )}
          <div className="p-8">
            <div className="uppercase tracking-wide text-sm text-indigo-500 dark:text-indigo-400 font-semibold">
              مقطع تحصیلی
            </div>
            <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
              {levelName}
            </h1>
            {description && (
              <p className="mt-4 text-gray-600 dark:text-gray-300">{description}</p>
            )}
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handlePersonnelSchedule}
                className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                <svg 
                  className="w-5 h-5 ml-2" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                برنامه براساس پرسنل
              </button>
              
              <button
                onClick={handleClassSchedule}
                className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                <svg 
                  className="w-5 h-5 ml-2" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                برنامه براساس کلاس
              </button>
            </div>
            
            <div className="mt-6 text-center">
              <Link
                href="/education-levels"
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
              >
                بازگشت به صفحه مقاطع تحصیلی
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 