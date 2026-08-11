import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { FaArrowLeft } from 'react-icons/fa';
import { IoVideocamOutline } from 'react-icons/io5';

export const UserHowToPlay = () => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="w-full select-none pb-12 font-sans">
      {/* 1. TOP ORANGE HEADER */}
      <div
        className="p-4 pt-4 pb-5 rounded-b-[28px] text-white shadow-md transition-colors duration-300 mb-4"
        style={{ backgroundColor: currentTheme.headerBgColor }}
      >
        <div className="relative flex items-center justify-center">
          <button
            onClick={() => navigate(-1)}
            className="absolute left-0 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-all cursor-pointer active:scale-95 border border-white/20 shadow-xs"
            title="Go Back"
          >
            <FaArrowLeft size={14} />
          </button>
          <h2 className="text-base font-bold text-white tracking-wide">
            How To Play
          </h2>
        </div>
      </div>

      <div className="px-4">
        {/* 2. MAIN EMPTY STATE CARD (Exact match with Screenshot 2) */}
        <div className="bg-white rounded-3xl p-10 border border-gray-200 shadow-2xs flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-18 h-18 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400">
            <IoVideocamOutline size={48} />
          </div>

          <p className="text-xs font-medium text-gray-700 leading-relaxed max-w-xs">
            No How To Play content available yet. Please ask the admin to update this page.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserHowToPlay;
