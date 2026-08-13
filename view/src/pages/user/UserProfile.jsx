import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import {
  FaCreditCard,
  FaMedal,
  FaWallet,
  FaChartLine,
  FaTrophy,
  FaHistory,
  FaFileAlt,
  FaQuestionCircle,
  FaKey,
  FaChevronRight,
  FaShieldAlt,
  FaTimes,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaTrashAlt,
  FaArrowLeft,
  FaBars
} from 'react-icons/fa';
import { BiExit } from 'react-icons/bi';
import toast from 'react-hot-toast';

export const UserProfile = () => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  const context = useOutletContext() || {};

  // Retrieve user data dynamically from context or localStorage
  const localUserStr = localStorage.getItem("user_data");
  let localUser = null;
  try {
    if (localUserStr) localUser = JSON.parse(localUserStr);
  } catch (e) { }

  const candidate = (context.user && context.user.role !== 'Admin') 
    ? context.user 
    : (localUser && localUser.role !== 'Admin' ? localUser : null);

  const user = candidate || {
    name: 'User',
    mobile: 'N/A',
    balance: 0,
    registrationDate: new Date()
  };

  const regDateRaw = user.registrationDate || user.createdAt || new Date();
  const formattedRegDate = new Date(regDateRaw).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric'
  });

  const displayBalance = Number(user.balance !== undefined ? user.balance : (user.walletBalance || 0)).toFixed(2);

  const onOpenSidebar = context.onOpenSidebar || (() => { });

  // Login & Security Modal state (Bottom Sheet)
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [securityTab, setSecurityTab] = useState('password');
  const [currentMpin, setCurrentMpin] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showValues, setShowValues] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openSecurityModal = () => {
    setErrorMessage('');
    setCurrentMpin('');
    setNewPassword('');
    setConfirmPassword('');
    setIsSecurityModalOpen(true);
  };

  const handleUpdateSecurity = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!currentMpin || currentMpin.trim() === '') {
      setErrorMessage('Enter your current 4-digit MPIN to confirm.');
      return;
    }

    if (securityTab === 'password') {
      if (!newPassword || newPassword.length < 4) {
        setErrorMessage('New password must be at least 4 characters.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMessage('New password and confirm password do not match.');
        return;
      }
    } else {
      if (!newPassword || newPassword.length !== 4) {
        setErrorMessage('New MPIN must be exactly 4 digits.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMessage('New MPIN and confirm MPIN do not match.');
        return;
      }
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSecurityModalOpen(false);
      toast.success(
        securityTab === 'password'
          ? 'Password updated successfully!'
          : 'MPIN updated successfully!'
      );
    }, 500);
  };

  const handleLogout = () => {
    localStorage.removeItem('user_token');
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    toast.success('Logged out successfully');
    window.location.href = '/login';
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      localStorage.removeItem('user_token');
      localStorage.removeItem('token');
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_data');
      toast.success('Account deleted');
      window.location.href = '/login';
    }
  };

  return (
    <div className="w-full select-none pb-8 font-sans">
      {/* 1. TOP CURVED PROFILE HEADER */}
      <div
        className="p-4 pt-4 pb-5 rounded-b-[28px] text-white shadow-md transition-colors duration-300 mb-4 sticky top-0 z-30"
        style={{ backgroundColor: currentTheme.headerBgColor }}
      >
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-all cursor-pointer active:scale-95 border border-white/20 shadow-xs shrink-0"
            title="Go Back"
          >
            <FaArrowLeft size={14} />
          </button>
          <h2 className="text-base font-bold text-white tracking-wide">
            My Profile
          </h2>
          <button
            onClick={onOpenSidebar}
            className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-all cursor-pointer active:scale-95 border border-white/20 shadow-xs shrink-0"
            title="Menu"
          >
            <FaBars size={14} />
          </button>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* 2. TOP USER DETAILS CARD */}
        <div className="bg-white rounded-3xl p-4.5 border border-gray-100 shadow-2xs flex items-center gap-4">
          {/* Orange Circular Avatar with initial */}
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-sm shrink-0"
            style={{ backgroundColor: currentTheme.headerBgColor }}
          >
            {user.name ? user.name.charAt(0).toUpperCase() : 'S'}
          </div>

          {/* User Info Details */}
          <div className="overflow-hidden">
            <h3 className="text-base font-bold text-gray-900 tracking-tight leading-tight">
              {user.name || 'Shubham'}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mt-1">
              <FaCreditCard size={11} className="text-gray-400" />
              <span>ID: {user.mobile || '8079003424'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mt-0.5">
              <FaMedal size={11} className="text-amber-500" />
              <span>Member since {formattedRegDate}</span>
            </div>
          </div>
        </div>

        {/* 3. THREE STATS CARDS: Balance, Games, Wins */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* Balance Card */}
          <div className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-2xs flex flex-col items-center justify-center text-center">
            <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center text-[#f97316] mb-1">
              <FaWallet size={14} />
            </div>
            <span className="text-[11px] font-medium text-gray-400">Balance</span>
            <span className="text-sm font-bold text-[#f97316] mt-0.5">
              ₹{displayBalance}
            </span>
          </div>

          {/* Games Card */}
          <div className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-2xs flex flex-col items-center justify-center text-center">
            <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 mb-1">
              <FaChartLine size={14} />
            </div>
            <span className="text-[11px] font-medium text-gray-400">Games</span>
            <span className="text-sm font-bold text-blue-600 mt-0.5">
              {user.gamesPlayed || 0}
            </span>
          </div>

          {/* Wins Card */}
          <div className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-2xs flex flex-col items-center justify-center text-center">
            <div className="w-9 h-9 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 mb-1">
              <FaTrophy size={14} />
            </div>
            <span className="text-[11px] font-medium text-gray-400">Wins</span>
            <span className="text-sm font-bold text-purple-600 mt-0.5">
              {user.winsCount || 0}
            </span>
          </div>
        </div>

        {/* 4. QUICK ACTIONS SECTION */}
        <div>
          <div className="flex items-center gap-1 text-sm font-bold text-gray-900 mb-2.5 px-1">
            <span>Quick Actions</span>
            <span className="text-amber-500 text-xs">⭐</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* My Wallet */}
            <div
              onClick={() => navigate('/wallet')}
              className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 active:scale-95 transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-1.5 shadow-2xs">
                <FaWallet size={16} />
              </div>
              <h4 className="text-xs font-semibold text-gray-900">My Wallet</h4>
              <p className="text-[10px] text-gray-400 font-normal mt-0.5">Manage your funds</p>
            </div>

            {/* Txn History */}
            <div
              onClick={() => navigate('/passbook')}
              className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 active:scale-95 transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-500 flex items-center justify-center mb-1.5 shadow-2xs">
                <FaHistory size={16} />
              </div>
              <h4 className="text-xs font-semibold text-gray-900">Txn History</h4>
              <p className="text-[10px] text-gray-400 font-normal mt-0.5">View past transactions</p>
            </div>

            {/* Game History */}
            <div
              onClick={() => navigate('/game-history')}
              className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 active:scale-95 transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-sky-50 text-sky-500 flex items-center justify-center mb-1.5 shadow-2xs">
                <FaFileAlt size={16} />
              </div>
              <h4 className="text-xs font-semibold text-gray-900">Game History</h4>
              <p className="text-[10px] text-gray-400 font-normal mt-0.5">View your game results</p>
            </div>

            {/* Help & Support */}
            <div
              onClick={() => navigate('/support')}
              className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 active:scale-95 transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center mb-1.5 shadow-2xs">
                <FaQuestionCircle size={16} />
              </div>
              <h4 className="text-xs font-semibold text-gray-900">Help & Support</h4>
              <p className="text-[10px] text-gray-400 font-normal mt-0.5">Get assistance</p>
            </div>
          </div>
        </div>

        {/* 5. LOGIN & SECURITY CARD */}
        <div
          onClick={openSecurityModal}
          className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs flex items-center justify-between cursor-pointer hover:bg-gray-50 active:scale-[0.99] transition-all"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shadow-2xs">
              <FaKey size={15} />
            </div>
            <span className="text-sm font-semibold text-gray-900">Login & Security</span>
          </div>
          <FaChevronRight size={12} className="text-gray-400" />
        </div>

        {/* 6. LOG OUT & DELETE ACCOUNT BUTTONS */}
        <div className="space-y-2.5 pt-1">
          {/* Log Out Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full bg-[#fff1f2] hover:bg-[#ffe4e6] active:scale-[0.99] border border-red-100 rounded-2xl p-3 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
          >
            <div className="w-7 h-7 rounded-xl bg-[#ef4444] text-white flex items-center justify-center shadow-xs">
              <BiExit size={16} />
            </div>
            <span className="font-semibold text-red-600 text-sm">Log Out</span>
          </button>

          {/* Delete Account Button */}
          <button
            type="button"
            onClick={handleDeleteAccount}
            className="w-full bg-white hover:bg-red-50/50 active:scale-[0.99] border-2 border-red-500 rounded-2xl p-3 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
          >
            <FaTrashAlt size={13} className="text-red-500" />
            <span className="font-semibold text-red-500 text-sm">Delete Account</span>
          </button>
        </div>
      </div>

      {/* 7. LOGIN & SECURITY BOTTOM DRAWER MODAL */}
      {isSecurityModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs transition-opacity duration-300"
          onClick={() => setIsSecurityModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-t-3xl overflow-hidden shadow-2xl transform transition-transform duration-300 animate-in slide-in-from-bottom pb-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Banner */}
            <div
              className="p-4 text-white flex items-center justify-between transition-colors duration-300"
              style={{ backgroundColor: currentTheme.headerBgColor }}
            >
              <div className="flex items-center gap-2">
                <FaShieldAlt size={16} />
                <h3 className="font-bold text-base">Login & Security</h3>
              </div>
              <button
                onClick={() => setIsSecurityModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <FaTimes size={13} />
              </button>
            </div>

            {/* 2 Navigation Tabs */}
            <div className="flex border-b border-gray-150 bg-gray-50/60">
              <button
                type="button"
                onClick={() => {
                  setSecurityTab('mpin');
                  setErrorMessage('');
                }}
                className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors border-b-2 ${securityTab === 'mpin'
                    ? 'border-[#f97316] text-[#f97316] bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
              >
                <FaKey size={12} />
                <span>Change MPIN</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSecurityTab('password');
                  setErrorMessage('');
                }}
                className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors border-b-2 ${securityTab === 'password'
                    ? 'border-[#f97316] text-[#f97316] bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
              >
                <FaLock size={12} />
                <span>Change Password</span>
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleUpdateSecurity} className="p-5 space-y-3.5">
              {/* Alert Warning Box */}
              {errorMessage && (
                <div className="bg-[#fff1f2] border border-red-100 rounded-2xl p-3 text-center animate-in fade-in">
                  <p className="text-xs font-semibold text-red-600 leading-tight">
                    {errorMessage}
                  </p>
                </div>
              )}

              {/* Field 1: Current MPIN */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Current MPIN (to confirm)
                </label>
                <input
                  type={showValues ? 'text' : 'password'}
                  maxLength={4}
                  value={currentMpin}
                  onChange={(e) => {
                    setCurrentMpin(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#f97316] transition-colors"
                />
              </div>

              {/* Field 2: New Value */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  {securityTab === 'password' ? 'New Password' : 'New 4-Digit MPIN'}
                </label>
                <input
                  type={showValues ? 'text' : 'password'}
                  maxLength={securityTab === 'mpin' ? 4 : 20}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder={securityTab === 'password' ? 'Min 4 characters' : 'Enter 4 digit MPIN'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#f97316] transition-colors"
                />
              </div>

              {/* Field 3: Confirm Value */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  {securityTab === 'password' ? 'Confirm New Password' : 'Confirm New MPIN'}
                </label>
                <input
                  type={showValues ? 'text' : 'password'}
                  maxLength={securityTab === 'mpin' ? 4 : 20}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder={securityTab === 'password' ? 'Re-enter new password' : 'Re-enter 4 digit MPIN'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#f97316] transition-colors"
                />
              </div>

              {/* Show Values Checkbox Toggle */}
              <div
                onClick={() => setShowValues(!showValues)}
                className="flex items-center gap-2 text-xs font-medium text-gray-500 cursor-pointer pt-0.5"
              >
                {showValues ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                <span>Show values</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-2xl text-white font-bold text-xs shadow-md transition-all active:scale-98 cursor-pointer mt-2 disabled:opacity-50"
                style={{ backgroundColor: currentTheme.headerBgColor }}
              >
                {isSubmitting
                  ? 'Updating...'
                  : securityTab === 'password'
                    ? 'Update Password'
                    : 'Update MPIN'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
