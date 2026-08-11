import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import {
  FaArrowLeft,
  FaSearch,
  FaArrowUp,
  FaCheckCircle
} from 'react-icons/fa';
import { IoTimeOutline } from 'react-icons/io5';
import { HiOutlineSparkles } from 'react-icons/hi';

export const UserWithdrawalsFeed = () => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const withdrawals = [];

  return (
    <div className="w-full select-none pb-12 font-sans">
      {/* 1. TOP HEADER (Exact Match with Screenshot 4) */}
      <div
        className="p-4 pt-4 pb-5 rounded-b-[28px] text-white shadow-md transition-colors duration-300 mb-3.5"
        style={{ backgroundColor: currentTheme.headerBgColor }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-all cursor-pointer active:scale-95 border border-white/20 shadow-xs shrink-0"
            title="Go Back"
          >
            <FaArrowLeft size={14} />
          </button>
          <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-white shrink-0">
            <IoTimeOutline size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-white leading-tight">
              Withdrawals
            </h2>
            <p className="text-xs text-white/80 font-normal mt-0.5 flex items-center gap-1">
              <HiOutlineSparkles size={13} className="text-yellow-300" />
              <span>Live activity feed</span>
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-3.5">
        {/* 2. RECENT VOLUME CARD */}
        <div className="bg-white rounded-3xl p-4.5 border border-gray-150 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <FaArrowUp size={16} className="rotate-45" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                RECENT VOLUME
              </span>
              <div className="text-xl font-bold text-gray-900 mt-0.5">
                ₹0
              </div>
            </div>
          </div>

          <div className="bg-[#fff7ed] text-[#ea580c] text-[10px] font-bold px-3 py-1 rounded-full border border-orange-100 shadow-2xs">
            Real-time
          </div>
        </div>

        {/* 3. SEARCH BAR */}
        <div className="relative">
          <FaSearch
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            size={13}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by username..."
            className="w-full bg-white rounded-2xl py-3 pl-9 pr-3.5 text-xs font-semibold text-gray-900 placeholder-gray-400 border border-gray-150 focus:outline-none focus:border-[#f97316] shadow-2xs"
          />
        </div>

        {/* 4. RECENT SUCCESS HEADER */}
        <div className="flex items-center justify-between text-xs px-1 pt-1">
          <div className="flex items-center gap-1.5 font-bold uppercase text-[11px] text-gray-900 tracking-wide">
            <IoTimeOutline size={14} className="text-[#f97316]" />
            <span>RECENT SUCCESS</span>
          </div>
          <span className="text-gray-400 text-[11px] font-medium">
            0 Records
          </span>
        </div>

        {/* 5. EMPTY STATE CARD */}
        <div className="bg-white rounded-3xl p-10 border border-gray-150 shadow-2xs flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
            <IoTimeOutline size={28} />
          </div>
          <h4 className="text-xs font-bold text-gray-900">
            No recent withdrawals found
          </h4>
        </div>

        {/* 6. BOTTOM NOTICE ALERT */}
        <div className="bg-[#fff7ed] border border-orange-200 rounded-2xl p-3.5 flex items-start gap-3 shadow-2xs">
          <div className="w-6 h-6 rounded-lg bg-[#f97316] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
            <FaCheckCircle size={12} />
          </div>
          <p className="text-[11px] text-[#c2410c] font-medium leading-relaxed">
            Withdrawals are processed instantly. If you face any issues, contact support immediately.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserWithdrawalsFeed;
