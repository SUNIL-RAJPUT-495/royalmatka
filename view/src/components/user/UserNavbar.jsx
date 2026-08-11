import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { FaBars, FaWallet, FaBell, FaTelegramPlane, FaWhatsapp } from 'react-icons/fa';
import { IoFlashSharp, IoWalletOutline, IoChatbubbleEllipsesOutline } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';

export const UserNavbar = ({ onOpenSidebar, walletBalance = '9' }) => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <header
      className="w-full text-white shadow-md rounded-b-[28px] overflow-hidden transition-colors duration-300 select-none shrink-0"
      style={{ backgroundColor: currentTheme.headerBgColor }}
    >
      {/* 1. Top Navbar Header */}
      <div className="px-4 pt-3.5 pb-2 flex items-center justify-between">
        {/* Left: Hamburger & Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className="w-10 h-10 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-all cursor-pointer active:scale-95 border border-white/20 shadow-xs"
            title="Open Menu"
          >
            <FaBars size={17} />
          </button>

          {/* Logo Name: Royal1008 */}
          <div
            onClick={() => navigate('/')}
            className="flex items-center text-xl font-black tracking-tight cursor-pointer drop-shadow-xs"
          >
            <span className="text-white">Royal</span>
            <span className="text-[#facc15]">1008</span>
          </div>
        </div>

        {/* Right: Notification Bell & Wallet Pill */}
        <div className="flex items-center gap-2.5">
          {/* Notification Button with 9+ badge */}
          <button
            onClick={() => navigate('/notifications')}
            className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-all cursor-pointer relative border border-white/20"
          >
            <FaBell size={15} />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white font-extrabold text-[9px] px-1.5 py-0.2 rounded-full border border-white shadow-xs">
              9+
            </span>
          </button>

          {/* Wallet Balance Pill */}
          <div
            onClick={() => navigate('/deposit')}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-xs px-3.5 py-1.5 rounded-xl border border-white/25 flex items-center gap-2 cursor-pointer shadow-xs active:scale-95 transition-all"
          >
            <IoWalletOutline size={16} className="text-white opacity-90" />
            <span className="text-xs font-black text-white">₹ {walletBalance}</span>
          </div>
        </div>
      </div>

      {/* 2. 4 Quick Action White Buttons (2x2 Grid matching screenshot) */}
      <div className="px-4 pb-4 pt-2">
        <div className="grid grid-cols-2 gap-2.5">
          {/* 1. GALI BAZAR */}
          <button
            type="button"
            onClick={() => navigate('/gali-bazar')}
            className="bg-white hover:bg-gray-50 active:scale-95 text-gray-900 py-2.5 px-3 rounded-2xl font-black text-xs shadow-sm flex items-center gap-2.5 transition-all cursor-pointer border border-white/80"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 shadow-2xs">
              <IoFlashSharp size={16} />
            </div>
            <span className="uppercase tracking-wide text-[11px] font-extrabold truncate">Gali Bazar</span>
          </button>

          {/* 2. DEPOSIT */}
          <button
            type="button"
            onClick={() => navigate('/deposit')}
            className="bg-white hover:bg-gray-50 active:scale-95 text-gray-900 py-2.5 px-3 rounded-2xl font-black text-xs shadow-sm flex items-center gap-2.5 transition-all cursor-pointer border border-white/80"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs">
              <IoWalletOutline size={16} />
            </div>
            <span className="uppercase tracking-wide text-[11px] font-extrabold truncate">Deposit</span>
          </button>

          {/* 3. TELEGRAM */}
          <a
            href="https://t.me/"
            target="_blank"
            rel="noreferrer"
            className="bg-white hover:bg-gray-50 active:scale-95 text-gray-900 py-2.5 px-3 rounded-2xl font-black text-xs shadow-sm flex items-center gap-2.5 transition-all cursor-pointer border border-white/80"
          >
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-[#229ED9] flex items-center justify-center shrink-0 shadow-2xs">
              <FaTelegramPlane size={16} />
            </div>
            <span className="uppercase tracking-wide text-[11px] font-extrabold truncate">Telegram</span>
          </a>

          {/* 4. CHAT */}
          <a
            href="https://wa.me/"
            target="_blank"
            rel="noreferrer"
            className="bg-white hover:bg-gray-50 active:scale-95 text-gray-900 py-2.5 px-3 rounded-2xl font-black text-xs shadow-sm flex items-center gap-2.5 transition-all cursor-pointer border border-white/80"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#25D366] flex items-center justify-center shrink-0 shadow-2xs">
              <IoChatbubbleEllipsesOutline size={16} />
            </div>
            <span className="uppercase tracking-wide text-[11px] font-extrabold truncate">Chat</span>
          </a>
        </div>
      </div>
    </header>
  );
};

export default UserNavbar;
