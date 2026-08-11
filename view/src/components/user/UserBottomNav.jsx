import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { IoDocumentTextOutline, IoWalletOutline, IoHome, IoDiceOutline, IoPersonOutline } from 'react-icons/io5';

export const UserBottomNav = () => {
  const { currentTheme } = useTheme();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-150 py-1.5 px-4 z-40 shadow-xl select-none">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* 1. Bids */}
        <NavLink
          to="/my-bids"
          className={({ isActive }) => `
            flex flex-col items-center gap-1 transition-all py-1 px-2.5 cursor-pointer
            ${isActive ? 'font-black text-gray-900' : 'text-gray-400 hover:text-gray-700 font-semibold'}
          `}
        >
          <IoDocumentTextOutline size={20} />
          <span className="text-[10px] tracking-tight">Bids</span>
        </NavLink>

        {/* 2. Fund */}
        <NavLink
          to="/deposit"
          className={({ isActive }) => `
            flex flex-col items-center gap-1 transition-all py-1 px-2.5 cursor-pointer
            ${isActive ? 'font-black text-gray-900' : 'text-gray-400 hover:text-gray-700 font-semibold'}
          `}
        >
          <IoWalletOutline size={20} />
          <span className="text-[10px] tracking-tight">Fund</span>
        </NavLink>

        {/* 3. Center Home Button (Large Orange / Theme Rounded Square) */}
        <NavLink
          to="/"
          className="flex flex-col items-center -mt-5 cursor-pointer"
        >
          <div
            className="w-13 h-13 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform active:scale-95"
            style={{ backgroundColor: currentTheme.headerBgColor }}
          >
            <IoHome size={22} />
          </div>
        </NavLink>

        {/* 4. Casino */}
        <NavLink
          to="/casino"
          className={({ isActive }) => `
            flex flex-col items-center gap-1 transition-all py-1 px-2.5 cursor-pointer
            ${isActive ? 'font-black text-gray-900' : 'text-gray-400 hover:text-gray-700 font-semibold'}
          `}
        >
          <IoDiceOutline size={20} />
          <span className="text-[10px] tracking-tight">Casino</span>
        </NavLink>

        {/* 5. Profile */}
        <NavLink
          to="/profile"
          className={({ isActive }) => `
            flex flex-col items-center gap-1 transition-all py-1 px-2.5 cursor-pointer
            ${isActive ? 'font-black text-gray-900' : 'text-gray-400 hover:text-gray-700 font-semibold'}
          `}
        >
          <IoPersonOutline size={20} />
          <span className="text-[10px] tracking-tight">Profile</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default UserBottomNav;
