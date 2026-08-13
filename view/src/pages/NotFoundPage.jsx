import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { FaHome, FaArrowLeft, FaExclamationTriangle } from 'react-icons/fa';
import { HiOutlineSparkles } from 'react-icons/hi';

export const NotFoundPage = () => {
  const navigate = useNavigate();
  const { currentTheme } = useTheme();

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col justify-center items-center p-4 font-sans select-none text-center">
      {/* Container Card */}
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-gray-150 shadow-xl space-y-6 relative overflow-hidden">
        
        {/* Top Decorative Background Glow */}
        <div 
          className="absolute -top-16 -left-16 w-36 h-36 rounded-full opacity-20 blur-2xl pointer-events-none"
          style={{ backgroundColor: currentTheme?.headerBgColor || '#f97316' }}
        />

        {/* 404 Glowing Badge Icon */}
        <div className="relative inline-flex items-center justify-center">
          <div 
            className="w-24 h-24 rounded-3xl flex items-center justify-center text-white text-4xl font-extrabold shadow-lg animate-pulse"
            style={{ backgroundColor: currentTheme?.headerBgColor || '#f97316' }}
          >
            404
          </div>
          <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-2xl bg-amber-400 text-gray-900 flex items-center justify-center shadow-md border-2 border-white">
            <FaExclamationTriangle size={16} />
          </div>
        </div>

        {/* Heading & Explanation */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-base font-bold text-gray-900 tracking-tight">
            <span>Page Not Found</span>
            <HiOutlineSparkles size={16} className="text-amber-500" />
          </div>
          <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-xs mx-auto">
            Oops! The page you are looking for doesn't exist, has been removed, or the link is broken.
          </p>
        </div>

        {/* Navigation Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="w-full py-3.5 px-4 rounded-2xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:opacity-95 active:scale-98 transition-all cursor-pointer"
            style={{ backgroundColor: currentTheme?.headerBgColor || '#f97316' }}
          >
            <FaHome size={14} />
            <span>Go to Home Page</span>
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-full py-3 px-4 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
          >
            <FaArrowLeft size={12} />
            <span>Go Back</span>
          </button>
        </div>
      </div>

      {/* Footer Brand Tag */}
      <p className="text-[11px] font-semibold text-gray-400 mt-6 tracking-wide uppercase">
        Royal Matka • 404 Route Handler
      </p>
    </div>
  );
};

export default NotFoundPage;
