import React, { useState, useRef, useEffect } from 'react';
import { FaBars, FaUserShield, FaSearch, FaCrown, FaSignOutAlt, FaChevronDown, FaKey, FaLock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AxiosAdmin from '../../utils/axiosAdmin';
import SummaryApi from '../../common/SummerAPI';
import logoImg from '../../assets/logo.jpeg';

export const AdminNavbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Change Password Modal state
  const [isChangePassModalOpen, setIsChangePassModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isChanging, setIsChanging] = useState(false);

  const adminName = localStorage.getItem('admin_name') || 'Super Admin';
  const adminRole = localStorage.getItem('admin_role') || 'Administrator';
  const avatarLetter = (adminName || 'A').charAt(0).toUpperCase();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    localStorage.removeItem('royal_user_admin');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_name');
    localStorage.removeItem('admin_role');
    localStorage.removeItem('admin_permissions');
    localStorage.removeItem('is_admin_logged_in');
    toast.success('Admin Logged Out Successfully! 🚪');
    navigate('/systum/login');
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword.trim() || newPassword.trim().length < 4) {
      return toast.error('New password must be at least 4 characters long');
    }

    setIsChanging(true);
    try {
      const res = await AxiosAdmin({
        url: SummaryApi.adminSelfChangePassword.url,
        method: SummaryApi.adminSelfChangePassword.method,
        data: {
          currentPassword: currentPassword.trim(),
          newPassword: newPassword.trim(),
          adminName,
          adminMobile: localStorage.getItem('admin_mobile') || ''
        }
      });
      if (res.data.success) {
        toast.success(res.data.message || 'Password changed successfully! 🔑');
        setIsChangePassModalOpen(false);
        setCurrentPassword('');
        setNewPassword('');
      } else {
        toast.error(res.data.message || 'Failed to change password');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setIsChanging(false);
    }
  };

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

        {/* Brand Logo: SanwariyaBoss */}
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/systum/dashboard')}>
          <img src={logoImg} alt="SanwariyaBoss Logo" className="w-8 h-8 rounded-full object-cover border border-red-500/50 shadow-md" />
          <div className="flex items-center">
            <span className="text-lg font-black tracking-wider text-white uppercase font-sans">
              SANWARIYA<span className="text-[#ef4444]">BOSS</span>
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

      {/* Right Section: Super Admin Profile Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#27272a]/80 hover:bg-[#27272a] border border-[#3f3f46]/50 transition-all cursor-pointer active:scale-95"
          title="Admin Profile Menu"
        >
          {/* Avatar circle */}
          <div className="w-7 h-7 rounded-full bg-[#ef4444] flex items-center justify-center text-white font-extrabold text-xs shadow-sm uppercase shrink-0">
            {avatarLetter}
          </div>
          <span className="text-xs font-bold text-gray-200 hidden md:inline-block max-w-[120px] truncate">
            {adminName}
          </span>
          <FaChevronDown size={10} className={`text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu Popup */}
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-52 bg-[#1f1f23] border border-[#3f3f46] rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
            {/* Header info */}
            <div className="px-3 py-2 border-b border-[#27272a]">
              <p className="text-xs font-extrabold text-white truncate">{adminName}</p>
              <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mt-0.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>{adminRole}</span>
              </p>
            </div>

            {/* Menu Items: Change Password + Logout */}
            <div className="pt-1.5 space-y-1">
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  setIsChangePassModalOpen(true);
                }}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-gray-200 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all text-left cursor-pointer active:scale-95 shadow-3xs"
              >
                <div className="flex items-center gap-2">
                  <FaKey size={12} className="text-amber-400" />
                  <span>Change Password</span>
                </div>
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-red-400 hover:text-white bg-red-500/10 hover:bg-red-600 rounded-xl transition-all text-left cursor-pointer active:scale-95 shadow-3xs"
              >
                <div className="flex items-center gap-2">
                  <FaSignOutAlt size={12} />
                  <span>Logout</span>
                </div>
                <span className="text-[10px] font-semibold opacity-70">Exit</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Change Password Modal Popup */}
      {isChangePassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-[#1f1f23] rounded-3xl p-6 w-full max-w-sm border border-[#3f3f46] shadow-2xl text-left animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4 border-b border-[#27272a] pb-3">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <FaLock className="text-amber-400" size={14} />
                <span>Change Admin Password</span>
              </h3>
              <button
                onClick={() => setIsChangePassModalOpen(false)}
                className="text-gray-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-[#27272a] border border-[#3f3f46] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white placeholder-gray-500 outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#27272a] border border-[#3f3f46] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white placeholder-gray-500 outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#27272a]">
                <button
                  type="button"
                  onClick={() => setIsChangePassModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white bg-[#27272a] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isChanging}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 cursor-pointer disabled:opacity-50 transition-all shadow-md"
                >
                  {isChanging ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};

export default AdminNavbar;
