import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { FaBars, FaBell, FaTelegramPlane, FaArrowLeft } from 'react-icons/fa';
import { IoFlashSharp, IoWalletOutline, IoChatbubbleEllipsesOutline, IoRefreshOutline } from 'react-icons/io5';
import { HiOutlineSparkles } from 'react-icons/hi';
import { useNavigate, useLocation } from 'react-router-dom';

export const UserNavbar = ({ onOpenSidebar, walletBalance = '9' }) => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const isProfilePage = location.pathname === '/profile';
  const isWalletPage = location.pathname === '/wallet';
  const isBidsPage = location.pathname === '/my-bids' || location.pathname === '/bids';
  const isHomePage = location.pathname === '/' || location.pathname === '/home';

  const [lastUpdatedTime, setLastUpdatedTime] = useState(() => new Date().toLocaleTimeString());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshBalance = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastUpdatedTime(new Date().toLocaleTimeString());
      setIsRefreshing(false);
    }, 400);
  };

  return (
    <header
      className="w-full text-white shadow-md rounded-b-[28px] overflow-hidden transition-colors duration-300 select-none shrink-0"
      style={{ backgroundColor: currentTheme.headerBgColor }}
    >
      {/* 1. TOP NAVBAR HEADER */}
      {isWalletPage ? (
        /* WALLET TOP HEADER */
        <div className="px-4 pt-3.5 pb-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-all cursor-pointer active:scale-95 border border-white/20 shadow-xs shrink-0"
              title="Go Back"
            >
              <FaArrowLeft size={14} />
            </button>

            <div>
              <div className="flex items-center gap-1.5 text-base font-bold tracking-tight text-white">
                <span>My Wallet</span>
                <HiOutlineSparkles size={16} className="text-yellow-300" />
              </div>
              <p className="text-xs text-white/80 font-normal -mt-0.5">Manage your funds</p>
            </div>
          </div>
        </div>
      ) : (
        /* STANDARD TOP NAVBAR (Home / Bids) */
        <div className="px-4 pt-3.5 pb-2 flex items-center justify-between">
          {/* Left: Hamburger & Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenSidebar}
              className="w-10 h-10 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-all cursor-pointer active:scale-95 border border-white/20 shadow-xs"
              title="Open Menu"
            >
              <FaBars size={16} />
            </button>

            {/* Logo Name: Royal1008 */}
            <div
              onClick={() => navigate('/')}
              className="flex items-center text-lg font-bold tracking-tight cursor-pointer"
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
              <FaBell size={14} />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white font-bold text-[9px] px-1.5 py-0.2 rounded-full border border-white shadow-xs">
                9+
              </span>
            </button>

            {/* Wallet Balance Pill */}
            <div
              onClick={() => navigate('/wallet')}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-xs px-3.5 py-1.5 rounded-xl border border-white/25 flex items-center gap-2 cursor-pointer shadow-xs active:scale-95 transition-all"
            >
              <IoWalletOutline size={15} className="text-white opacity-90" />
              <span className="text-xs font-semibold text-white">₹ {walletBalance}</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. CONTENT BELOW TOP ROW */}
      {isWalletPage ? (
        /* CURRENT BALANCE CARD */
        <div className="px-4 pb-4 pt-1">
          <div className="bg-white/15 hover:bg-white/20 backdrop-blur-md rounded-3xl p-4.5 border border-white/25 shadow-xs transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-white/90">Current Balance</span>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">
                <IoWalletOutline size={15} />
              </div>
            </div>

            <div className="my-1">
              <span className="text-3xl font-bold text-white tracking-tight">
                ₹{walletBalance}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-white/15">
              <div className="text-[11px] text-white/80 font-normal leading-tight">
                Last updated<br />
                <span className="font-semibold text-white">{lastUpdatedTime}</span>
              </div>

              <button
                type="button"
                onClick={handleRefreshBalance}
                className="bg-white/20 hover:bg-white/30 active:scale-95 px-3 py-1 rounded-full text-xs font-semibold text-white border border-white/25 flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
              >
                <IoRefreshOutline size={13} className={isRefreshing ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      ) : isProfilePage ? (
        <div className="pb-4 pt-1 text-center">
          <h2 className="text-lg font-bold text-white tracking-wide">
            My Profile
          </h2>
        </div>
      ) : isHomePage ? (
        /* Home Page: 4 Quick Action White Buttons */
        <div className="px-4 pb-4 pt-2">
          <div className="grid grid-cols-2 gap-2.5">
            {/* 1. GALI BAZAR */}
            <button
              type="button"
              onClick={() => navigate('/gali-bazar')}
              className="bg-white hover:bg-gray-50 active:scale-95 text-gray-900 py-2 px-3 rounded-2xl font-bold text-xs shadow-sm flex items-center gap-2.5 transition-all cursor-pointer border border-white/80"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 shadow-2xs">
                <IoFlashSharp size={15} />
              </div>
              <span className="uppercase tracking-wide text-[11px] font-bold truncate">Gali Bazar</span>
            </button>

            {/* 2. DEPOSIT */}
            <button
              type="button"
              onClick={() => navigate('/deposit')}
              className="bg-white hover:bg-gray-50 active:scale-95 text-gray-900 py-2 px-3 rounded-2xl font-bold text-xs shadow-sm flex items-center gap-2.5 transition-all cursor-pointer border border-white/80"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs">
                <IoWalletOutline size={15} />
              </div>
              <span className="uppercase tracking-wide text-[11px] font-bold truncate">Deposit</span>
            </button>

            {/* 3. TELEGRAM */}
            <a
              href="https://t.me/"
              target="_blank"
              rel="noreferrer"
              className="bg-white hover:bg-gray-50 active:scale-95 text-gray-900 py-2 px-3 rounded-2xl font-bold text-xs shadow-sm flex items-center gap-2.5 transition-all cursor-pointer border border-white/80"
            >
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-[#229ED9] flex items-center justify-center shrink-0 shadow-2xs">
                <FaTelegramPlane size={15} />
              </div>
              <span className="uppercase tracking-wide text-[11px] font-bold truncate">Telegram</span>
            </a>

            {/* 4. CHAT */}
            <a
              href="https://wa.me/"
              target="_blank"
              rel="noreferrer"
              className="bg-white hover:bg-gray-50 active:scale-95 text-gray-900 py-2 px-3 rounded-2xl font-bold text-xs shadow-sm flex items-center gap-2.5 transition-all cursor-pointer border border-white/80"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#25D366] flex items-center justify-center shrink-0 shadow-2xs">
                <IoChatbubbleEllipsesOutline size={15} />
              </div>
              <span className="uppercase tracking-wide text-[11px] font-bold truncate">Chat</span>
            </a>
          </div>
        </div>
      ) : null}
    </header>
  );
};

export default UserNavbar;
