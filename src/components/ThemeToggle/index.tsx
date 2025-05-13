'use client';

import { FaSun, FaMoon } from "react-icons/fa";
import { useTheme } from "@/context/ThemeContext";
import { useCallback, useEffect, useState } from "react";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // فقط در سمت کلاینت اجرا می‌شود
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // تغییر تم
    toggleTheme();
    
    console.log("تغییر تم به:", theme === "light" ? "dark" : "light");
  }, [toggleTheme, theme]);

  // در سمت سرور یا قبل از هیدریشن، کامپوننت خالی برمی‌گرداند
  if (!mounted) {
    return <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>;
  }

  return (
    <div 
      className="relative w-8 h-8 flex justify-center items-center" 
      onClick={handleToggleClick}
      title={theme === "light" ? "تغییر به حالت تاریک" : "تغییر به حالت روشن"}
    >
      {/* Sun Icon (Light Mode) */}
      <div
        className={`absolute ${
          theme === "light"
            ? "translate-x-0 translate-y-0 scale-100"
            : "translate-x-[70%] translate-y-[70%] scale-0"
        } transition-all duration-500 ease-in-out`}
        title="روز"
      >
        <FaSun
          className="h-8 w-8 text-yellow-500 hover:animate-pulse hover:drop-shadow-[0_0_10px_rgb(255,223,0)] cursor-pointer"
        />
      </div>

      {/* Moon Icon (Dark Mode) */}
      <div
        className={`absolute ${
          theme === "dark"
            ? "translate-x-0 translate-y-0 scale-100"
            : "translate-x-[-70%] translate-y-[70%] scale-0"
        } transition-all duration-500 ease-in-out`}
        title="شب"
      >
        <FaMoon
          className="h-8 w-8 text-blue-500 hover:animate-pulse hover:drop-shadow-[0_0_10px_rgb(100,149,237)] cursor-pointer"
        />
      </div>
    </div>
  );
};

export default ThemeToggle; 