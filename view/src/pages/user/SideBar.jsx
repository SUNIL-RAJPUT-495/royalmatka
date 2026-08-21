import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import logoImg from '../../assets/logo.jpeg';
import {
  FaTimes,
  FaChevronRight,
  FaUserAlt,
  FaCog
} from 'react-icons/fa';
import {
  IoHomeOutline,
  IoWalletOutline,
  IoBookOutline,
  IoStatsChartOutline,
  IoShareSocialOutline,
  IoRibbonOutline,
  IoFlashOutline,
  IoShieldCheckmarkOutline,
  IoNotificationsOutline,
  IoTimeOutline,
  IoCashOutline,
  IoInformationCircleOutline
} from 'react-icons/io5';
import { HiOutlineSparkles } from 'react-icons/hi';
import { BiExit } from 'react-icons/bi';

export const SideBar = ({
  isOpen,
  closeSidebar,
  user = { name: 'Shubham', mobile: '8079003424', walletBalance: 9 }
}) => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();

  const platformMenu = [
    { label: 'Home', icon: IoHomeOutline, link: '/' },
    { label: 'My Wallet', icon: IoWalletOutline, link: '/wallet' },
    { label: 'How To Play', icon: IoBookOutline, link: '/how-to-play' },
    { label: 'Charts', icon: IoStatsChartOutline, link: '/charts' },
    { label: 'Share App', icon: IoShareSocialOutline, link: '/share' }
  ];

  const gameZoneMenu = [
    { label: 'Game Rates', icon: IoRibbonOutline, link: '/game-rates' },
    { label: 'Game History', icon: IoTimeOutline, link: '/game-history' },
    { label: 'Winning Tips', icon: IoFlashOutline, link: '/tips' },
    //{ label: 'Mpin Settings', icon: IoShieldCheckmarkOutline, link: '/mpin-settings' },
    { label: 'Notification Settings', icon: IoNotificationsOutline, link: '/notification-settings' }
  ];

  const supportMenu = [
    { label: 'Transaction History', icon: IoTimeOutline, link: '/passbook' },
    { label: 'All Withdrawals', icon: IoCashOutline, link: '/all-withdrawals' },
    { label: 'Help Center', icon: IoInformationCircleOutline, link: '/support' }
  ];

  const renderMenuItem = (item, index) => {
    const Icon = item.icon;
    return (
      <NavLink
        key={index}
        to={item.link}
        onClick={closeSidebar}
        className="w-full bg-white hover:bg-gray-50 active:scale-[0.99] rounded-2xl p-3 border border-gray-100/90 shadow-2xs flex items-center justify-between transition-all cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-600 border border-gray-100">
            <Icon size={17} />
          </div>
          <span className="text-xs font-semibold text-gray-800 tracking-tight">{item.label}</span>
        </div>
        <FaChevronRight size={11} className="text-gray-300" />
      </NavLink>
    );
  };

  return (
    <>
      {/* 1. Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity duration-300"
          onClick={closeSidebar}
        />
      )}

      {/* 2. Slide-in Drawer matching screenshots 2 & 3 */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-[#f8f9fa] z-50 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out select-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* TOP ORANGE/THEME PROFILE HEADER */}
        <div
          className="p-5 text-white relative transition-colors duration-300 shrink-0"
          style={{ backgroundColor: currentTheme.headerBgColor }}
        >
          {/* Top Row: Mini Brand Avatar + Close Button */}
          <div className="flex items-center justify-between mb-3.5">
            <img src={logoImg} alt="SanwariyaBoss Logo" className="w-8 h-8 rounded-full object-cover border border-white/30 shadow-xs" />
            <button
              onClick={closeSidebar}
              className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <FaTimes size={13} />
            </button>
          </div>

          {/* User Info Row */}
          {(() => {
            const currentUser = user || {};
            const name = currentUser.name || 'User';
            const mobile = currentUser.mobile || '';
            const initial = name ? name.charAt(0).toUpperCase() : 'U';
            const balanceVal = Number(
              currentUser.balance !== undefined 
                ? currentUser.balance 
                : (currentUser.walletBalance !== undefined 
                  ? currentUser.walletBalance 
                  : ((currentUser.wallet?.withdrowalable || 0) + (currentUser.wallet?.bonusBalance || 0)))
            ).toFixed(2);

            return (
              <div className="flex items-center gap-3.5 mb-3.5">
                {/* White Rounded Square Avatar with Initial */}
                <div
                  className="w-13 h-13 rounded-2xl bg-white flex items-center justify-center font-bold text-xl shadow-md shrink-0"
                  style={{ color: currentTheme?.headerBgColor || '#ea580c' }}
                >
                  {initial}
                </div>

                {/* Name, ID and Balance Pill */}
                <div>
                  <h3 className="font-bold text-base leading-tight text-white">{name}</h3>
                  <p className="text-xs text-white/80 font-normal mt-0.5">{mobile ? `ID: ${mobile}` : ''}</p>
                  <div className="inline-flex items-center gap-1 bg-white/20 px-2.5 py-0.5 rounded-full text-[11px] font-semibold mt-1 border border-white/25">
                    <HiOutlineSparkles size={11} className="text-yellow-300" />
                    <span>₹ {balanceVal}</span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* 2 Quick Header Action Buttons: Profile & Settings */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => {
                closeSidebar();
                navigate('/profile');
              }}
              className="py-1.5 px-3 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-xs text-white font-semibold text-xs flex items-center justify-center gap-2 border border-white/25 transition-all cursor-pointer"
            >
              <FaUserAlt size={11} />
              <span>Profile</span>
            </button>
            <button
              onClick={() => {
                closeSidebar();
                navigate('/settings');
              }}
              className="py-1.5 px-3 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-xs text-white font-semibold text-xs flex items-center justify-center gap-2 border border-white/25 transition-all cursor-pointer"
            >
              <FaCog size={12} />
              <span>Settings</span>
            </button>
          </div>
        </div>

        {/* MENU ITEMS SCROLLABLE CONTAINER */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 [&::-webkit-scrollbar]:hidden">
          {/* SECTION 1: PLATFORM */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1 mb-1.5">
              PLATFORM
            </div>
            <div className="space-y-1.5">
              {platformMenu.map(renderMenuItem)}
            </div>
          </div>

          {/* SECTION 2: GAME ZONE */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1 mb-1.5">
              GAME ZONE
            </div>
            <div className="space-y-1.5">
              {gameZoneMenu.map(renderMenuItem)}
            </div>
          </div>

          {/* SECTION 3: SUPPORT */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1 mb-1.5">
              SUPPORT
            </div>
            <div className="space-y-1.5">
              {supportMenu.map(renderMenuItem)}
            </div>
          </div>

          {/* LOGOUT BUTTON */}
          <div className="pt-1 pb-1">
            <button
              onClick={() => {
                closeSidebar();
                localStorage.removeItem('user_token');
                localStorage.removeItem('token');
                localStorage.removeItem('access_token');
                localStorage.removeItem('user_data');
                window.location.href = '/login';
              }}
              className="w-full bg-[#fff1f2] hover:bg-[#ffe4e6] active:scale-[0.99] border border-red-100 rounded-2xl p-3 flex items-center gap-3 transition-all cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-[#ef4444] text-white flex items-center justify-center shadow-xs">
                <BiExit size={16} />
              </div>
              <span className="font-semibold text-red-600 text-sm">Log Out</span>
            </button>
          </div>

          {/* VERSION FOOTER */}
          <div className="text-center text-[10px] font-semibold tracking-widest text-gray-400 uppercase pb-2">
            ✨ VERSION 1.2.0 ✨
          </div>
        </div>
      </aside>
    </>
  );
};

export default SideBar;
