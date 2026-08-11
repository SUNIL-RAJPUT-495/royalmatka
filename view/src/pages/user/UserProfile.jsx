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
  FaEyeSlash
} from 'react-icons/fa';
import toast from 'react-hot-toast';

export const UserProfile = () => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  const context = useOutletContext() || {};
  const user = context.user || {
    name: 'Shubham',
    mobile: '8079003424',
    walletBalance: 9.0,
    gamesPlayed: 0,
    winsCount: 0,
    createdAt: '17/7/2026'
  };

  // Login & Security Modal state
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [securityTab, setSecurityTab] = useState('password'); // 'mpin' or 'password'
  const [currentMpin, setCurrentMpin] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showValues, setShowValues] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdateSecurity = (e) => {
    e.preventDefault();
    if (!currentMpin) {
      toast.error('Please enter your 4-digit MPIN to confirm.');
      return;
    }
    if (securityTab === 'password') {
      if (!newPassword || newPassword.length < 4) {
        toast.error('New password must be at least 4 characters.');
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error('Passwords do not match.');
        return;
      }
    } else {
      if (!newPassword || newPassword.length !== 4) {
        toast.error('New MPIN must be 4 digits.');
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error('MPIN does not match.');
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
      setCurrentMpin('');
      setNewPassword('');
      setConfirmPassword('');
    }, 600);
  };

  return (
    <div className="w-full space-y-4 select-none pb-6 font-sans">
      {/* 1. TOP USER DETAILS CARD */}
      <div className="bg-white rounded-3xl p-4.5 border border-gray-100 shadow-2xs flex items-center gap-4">
        {/* Orange Circular Avatar with initial */}
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl font-black shadow-sm shrink-0"
          style={{ backgroundColor: currentTheme.headerBgColor }}
        >
          {user.name ? user.name.charAt(0).toUpperCase() : 'S'}
        </div>

        {/* User Info Details */}
        <div className="overflow-hidden">
          <h3 className="text-lg font-black text-gray-900 tracking-tight leading-tight">
            {user.name || 'Shubham'}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold mt-1">
            <FaCreditCard size={11} className="text-gray-400" />
            <span>ID: {user.mobile || '8079003424'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold mt-0.5">
            <FaMedal size={11} className="text-amber-500" />
            <span>Member since {user.createdAt || '17/7/2026'}</span>
          </div>
        </div>
      </div>

      {/* 2. THREE STATS CARDS: Balance, Games, Wins */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Balance Card */}
        <div className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-2xs flex flex-col items-center justify-center text-center">
          <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center text-[#f97316] mb-1">
            <FaWallet size={15} />
          </div>
          <span className="text-[11px] font-bold text-gray-400">Balance</span>
          <span className="text-sm font-black text-[#f97316] mt-0.5">
            ₹{Number(user.walletBalance || 9).toFixed(2)}
          </span>
        </div>

        {/* Games Card */}
        <div className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-2xs flex flex-col items-center justify-center text-center">
          <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 mb-1">
            <FaChartLine size={15} />
          </div>
          <span className="text-[11px] font-bold text-gray-400">Games</span>
          <span className="text-sm font-black text-blue-600 mt-0.5">
            {user.gamesPlayed || 0}
          </span>
        </div>

        {/* Wins Card */}
        <div className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-2xs flex flex-col items-center justify-center text-center">
          <div className="w-9 h-9 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 mb-1">
            <FaTrophy size={15} />
          </div>
          <span className="text-[11px] font-bold text-gray-400">Wins</span>
          <span className="text-sm font-black text-purple-600 mt-0.5">
            {user.winsCount || 0}
          </span>
        </div>
      </div>

      {/* 3. QUICK ACTIONS SECTION */}
      <div>
        <div className="flex items-center gap-1 text-sm font-black text-gray-900 mb-2.5 px-1">
          <span>Quick Actions</span>
          <span className="text-amber-500 text-xs">⭐</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* My Wallet */}
          <div
            onClick={() => navigate('/deposit')}
            className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 active:scale-95 transition-all"
          >
            <div className="w-11 h-11 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-2 shadow-2xs">
              <FaWallet size={18} />
            </div>
            <h4 className="text-xs font-black text-gray-900">My Wallet</h4>
            <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Manage your funds</p>
          </div>

          {/* Txn History */}
          <div
            onClick={() => navigate('/passbook')}
            className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 active:scale-95 transition-all"
          >
            <div className="w-11 h-11 rounded-full bg-teal-50 text-teal-500 flex items-center justify-center mb-2 shadow-2xs">
              <FaHistory size={18} />
            </div>
            <h4 className="text-xs font-black text-gray-900">Txn History</h4>
            <p className="text-[10px] text-gray-400 font-semibold mt-0.5">View past transactions</p>
          </div>

          {/* Game History */}
          <div
            onClick={() => navigate('/my-bids')}
            className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 active:scale-95 transition-all"
          >
            <div className="w-11 h-11 rounded-full bg-sky-50 text-sky-500 flex items-center justify-center mb-2 shadow-2xs">
              <FaFileAlt size={18} />
            </div>
            <h4 className="text-xs font-black text-gray-900">Game History</h4>
            <p className="text-[10px] text-gray-400 font-semibold mt-0.5">View your game results</p>
          </div>

          {/* Help & Support */}
          <div
            onClick={() => navigate('/support')}
            className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 active:scale-95 transition-all"
          >
            <div className="w-11 h-11 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center mb-2 shadow-2xs">
              <FaQuestionCircle size={18} />
            </div>
            <h4 className="text-xs font-black text-gray-900">Help & Support</h4>
            <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Get assistance</p>
          </div>
        </div>
      </div>

      {/* 4. LOGIN & SECURITY CARD */}
      <div
        onClick={() => setIsSecurityModalOpen(true)}
        className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs flex items-center justify-between cursor-pointer hover:bg-gray-50 active:scale-[0.99] transition-all"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shadow-2xs">
            <FaKey size={16} />
          </div>
          <span className="text-sm font-black text-gray-900">Login & Security</span>
        </div>
        <FaChevronRight size={12} className="text-gray-400" />
      </div>

      {/* 5. LOGIN & SECURITY MODAL DRAWER (Exact match with Screenshot 2) */}
      {isSecurityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div
              className="p-4 text-white flex items-center justify-between transition-colors duration-300"
              style={{ backgroundColor: currentTheme.headerBgColor }}
            >
              <div className="flex items-center gap-2">
                <FaShieldAlt size={16} />
                <h3 className="font-extrabold text-base">Login & Security</h3>
              </div>
              <button
                onClick={() => setIsSecurityModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <FaTimes size={13} />
              </button>
            </div>

            {/* 2 Navigation Tabs */}
            <div className="flex border-b border-gray-100 bg-gray-50/50">
              <button
                type="button"
                onClick={() => setSecurityTab('mpin')}
                className={`flex-1 py-3 text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-colors border-b-2 ${
                  securityTab === 'mpin'
                    ? 'border-[#f97316] text-[#f97316] bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <FaKey size={12} />
                <span>Change MPIN</span>
              </button>

              <button
                type="button"
                onClick={() => setSecurityTab('password')}
                className={`flex-1 py-3 text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-colors border-b-2 ${
                  securityTab === 'password'
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
              <div className="bg-[#fff1f2] border border-red-100 rounded-2xl p-3 text-center">
                <p className="text-xs font-bold text-red-600 leading-tight">
                  Enter your current 4-digit MPIN to confirm.
                </p>
              </div>

              {/* Field 1: Current MPIN */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Current MPIN (to confirm)
                </label>
                <input
                  type={showValues ? 'text' : 'password'}
                  maxLength={4}
                  value={currentMpin}
                  onChange={(e) => setCurrentMpin(e.target.value)}
                  placeholder="••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#f97316] transition-colors"
                />
              </div>

              {/* Field 2: New Value */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  {securityTab === 'password' ? 'New Password' : 'New 4-Digit MPIN'}
                </label>
                <input
                  type={showValues ? 'text' : 'password'}
                  maxLength={securityTab === 'mpin' ? 4 : 20}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={securityTab === 'password' ? 'Min 4 characters' : 'Enter 4 digit MPIN'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#f97316] transition-colors"
                />
              </div>

              {/* Field 3: Confirm Value */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  {securityTab === 'password' ? 'Confirm New Password' : 'Confirm New MPIN'}
                </label>
                <input
                  type={showValues ? 'text' : 'password'}
                  maxLength={securityTab === 'mpin' ? 4 : 20}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={securityTab === 'password' ? 'Re-enter new password' : 'Re-enter 4 digit MPIN'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#f97316] transition-colors"
                />
              </div>

              {/* Show Values Checkbox */}
              <div
                onClick={() => setShowValues(!showValues)}
                className="flex items-center gap-2 text-xs font-bold text-gray-500 cursor-pointer pt-0.5"
              >
                {showValues ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                <span>Show values</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-2xl text-white font-extrabold text-xs shadow-md transition-all active:scale-98 cursor-pointer mt-2 disabled:opacity-50"
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
