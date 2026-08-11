import React, { useState } from 'react';
import { FaBars, FaUserShield, FaSearch, FaCrown } from 'react-icons/fa';
import { RiAdminLine } from 'react-icons/ri';

export const AdminNavbar = ({ toggleSidebar }) => {
  const [searchValue, setSearchValue] = useState('');

  return (
    <header className="sticky top-0 z-30 w-full bg-[#18181b] border-b border-[#27272a] px-4 md:px-6 py-2.5 flex items-center justify-between shadow-md select-none">
      {/* Left Section: Hamburger Button + Logo */}
      <div className="flex items-center gap-4">
        {/* Toggle Sidebar Button */}
        <button
          onClick={toggleSidebar}
          className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all active:scale-95 cursor-pointer focus:outline-none"
          title="Toggle Sidebar"
        >
          <FaBars size={18} />
        </button>

        {/* Brand Logo: royal1008 */}
        <div className="flex items-center gap-2.5">
          <div className="bg-[#ef4444] p-1.5 rounded-lg shadow-md flex items-center justify-center text-white">
            <FaCrown size={16} />
          </div>
          <div className="flex items-center">
            <span className="text-lg font-black tracking-wider text-white uppercase font-sans">
              ROYAL<span className="text-[#ef4444]">1008</span>
            </span>
          </div>
        </div>
      </div>

      {/* Center Section: Search Bar */}
      <div className="hidden sm:flex items-center flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search..."
            className="w-full bg-[#27272a]/60 border border-[#3f3f46]/50 rounded-xl pl-9 pr-4 py-1.5 text-sm text-gray-200 placeholder-gray-400 outline-none focus:border-[#ef4444] focus:ring-1 focus:ring-[#ef4444] transition-all"
          />
        </div>
      </div>

      {/* Right Section: Super Admin Profile */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#27272a]/60 border border-[#3f3f46]/40 hover:bg-[#27272a] transition-colors cursor-pointer">
          {/* Avatar circle */}
          <div className="w-7 h-7 rounded-full bg-[#ef4444] flex items-center justify-center text-white font-extrabold text-xs shadow-sm">
            S
          </div>
          <span className="text-xs font-bold text-gray-200 hidden md:inline-block">
            Super Admin
          </span>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
