import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { FaUserCircle, FaBell, FaWallet } from 'react-icons/fa';
import { IoPlayCircleOutline, IoAddCircleOutline } from 'react-icons/io5';
import { BiMoneyWithdraw } from 'react-icons/bi';
import logoImg from '../../assets/logo.jpeg';

export const UserHeader = ({ walletBalance = '12,500' }) => {
  const { currentTheme } = useTheme();

  return (
    <header className="w-full select-none shadow-md">
      {/* 1. TOP BRAND HEADER */}
      <div
        className="px-4 py-3.5 flex items-center justify-between text-white transition-colors duration-300"
        style={{ backgroundColor: currentTheme.headerBgColor }}
      >
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-2">
          <img src={logoImg} alt="SanwariyaBoss Logo" className="w-8 h-8 rounded-full object-cover border border-amber-300/40 shadow-xs" />
          <div className="text-xl font-black tracking-tight">
            <span>Sanwariya</span>
            <span className="text-[#facc15]">Boss</span>
          </div>
        </div>

        {/* Right: Balance Pill & Notification / Profile */}
        <div className="flex items-center gap-3">
          {/* Balance Pill */}
          <div
            className="px-3.5 py-1 rounded-full text-xs font-extrabold border flex items-center gap-1.5 shadow-xs transition-all duration-300"
            style={{
              backgroundColor: currentTheme.balancePillBg || 'rgba(0, 0, 0, 0.18)',
              borderColor: currentTheme.balancePillBorder || 'rgba(255, 255, 255, 0.25)',
              color: currentTheme.balanceTextColor || '#facc15'
            }}
          >
            <FaWallet size={12} className="opacity-80" />
            <span>₹ {walletBalance}</span>
          </div>

          {/* User Profile Avatar */}
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white border border-white/30 cursor-pointer hover:bg-white/30 transition-all">
            <FaUserCircle size={20} />
          </div>
        </div>
      </div>

      {/* 2. THREE QUICK ACTION BUTTONS (Exact match with Theme Cards) */}
      <div className="p-3 bg-white border-b border-gray-100 shadow-xs flex items-center justify-between gap-2.5">
        {/* Play Button */}
        <button
          type="button"
          className="flex-1 py-2.5 px-3 rounded-xl text-xs font-black text-white shadow-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
          style={{ backgroundColor: currentTheme.playBtnBg }}
        >
          <IoPlayCircleOutline size={16} />
          <span>Play</span>
        </button>

        {/* + Add Fund Button */}
        <button
          type="button"
          className="flex-1 py-2.5 px-3 rounded-xl text-xs font-black shadow-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
          style={{
            backgroundColor: currentTheme.addFundBtnBg,
            color: currentTheme.addFundBtnTextColor || '#111827'
          }}
        >
          <IoAddCircleOutline size={16} />
          <span>+ Add Fund</span>
        </button>

        {/* Withdraw Button */}
        <button
          type="button"
          className="flex-1 py-2.5 px-3 rounded-xl text-xs font-black bg-white border-2 transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
          style={{
            borderColor: currentTheme.withdrawBtnBorder,
            color: currentTheme.withdrawBtnColor
          }}
        >
          <BiMoneyWithdraw size={16} />
          <span>Withdraw</span>
        </button>
      </div>
    </header>
  );
};

export default UserHeader;
