import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import Axios from '../../utils/axios';
import SummaryApi from '../../common/SummerAPI';
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
  FaBars,
  FaExclamationTriangle
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
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showValues, setShowValues] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openSecurityModal = () => {
    setErrorMessage('');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setIsSecurityModalOpen(true);
  };

  const handleUpdateSecurity = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!newPassword || newPassword.length < 4) {
      setErrorMessage('New password must be at least 4 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('New password and confirm password do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await Axios({
        url: SummaryApi.changeUserPassword.url,
        method: SummaryApi.changeUserPassword.method,
        data: {
          userId: user._id || user.id,
          mobile: user.mobile,
          oldPassword: oldPassword,
          newPassword: newPassword.trim()
        }
      });

      if (response?.data?.success) {
        toast.success(response.data.message || 'Password updated successfully! 🔑');
        setIsSecurityModalOpen(false);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setErrorMessage(response?.data?.message || 'Failed to update password.');
      }
    } catch (err) {
      console.error('Error updating password:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user_token');
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    toast.success('Logged out successfully');
    window.location.href = '/login';
  };

  // Delete Account Modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const openDeleteModal = () => {
    setDeleteReason('');
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDeleteRequest = async (e) => {
    e?.preventDefault();
    setIsDeleting(true);
    try {
      const response = await Axios({
        url: SummaryApi.requestAccountDeletion.url,
        method: SummaryApi.requestAccountDeletion.method,
        data: {
          userId: user._id || user.id,
          mobile: user.mobile,
          reason: deleteReason || "User requested account deletion"
        }
      });

      if (response?.data?.success) {
        toast.success(response.data.message || 'Account deletion request submitted!');
        setIsDeleteModalOpen(false);
        setTimeout(() => {
          localStorage.removeItem('user_token');
          localStorage.removeItem('token');
          localStorage.removeItem('access_token');
          localStorage.removeItem('user_data');
          window.location.href = '/login';
        }, 1500);
      } else {
        toast.error(response?.data?.message || 'Failed to submit deletion request.');
      }
    } catch (err) {
      console.error('Error submitting deletion request:', err);
      const msg = err.response?.data?.message || 'Failed to submit account deletion request.';
      toast.error(msg);
    } finally {
      setIsDeleting(false);
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

        {/* 5. CHANGE PASSWORD CARD */}
        <div
          onClick={openSecurityModal}
          className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs flex items-center justify-between cursor-pointer hover:bg-gray-50 active:scale-[0.99] transition-all"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shadow-2xs">
              <FaLock size={15} />
            </div>
            <span className="text-sm font-semibold text-gray-900">Change Password</span>
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
            onClick={openDeleteModal}
            className="w-full bg-white hover:bg-red-50/50 active:scale-[0.99] border-2 border-red-500 rounded-2xl p-3 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
          >
            <FaTrashAlt size={13} className="text-red-500" />
            <span className="font-semibold text-red-500 text-sm">Delete Account</span>
          </button>
        </div>
      </div>

      {/* 7. CHANGE PASSWORD BOTTOM DRAWER MODAL */}
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
                <FaLock size={16} />
                <h3 className="font-bold text-base">Change Password</h3>
              </div>
              <button
                onClick={() => setIsSecurityModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <FaTimes size={13} />
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

              {/* Field 1: Old Password */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Old / Current Password (Optional)
                </label>
                <input
                  type={showValues ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => {
                    setOldPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="Enter current password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#f97316] transition-colors"
                />
              </div>

              {/* Field 2: New Password */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type={showValues ? 'text' : 'password'}
                  maxLength={30}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="Min 4 characters"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#f97316] transition-colors"
                />
              </div>

              {/* Field 3: Confirm New Password */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type={showValues ? 'text' : 'password'}
                  maxLength={30}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="Re-enter new password"
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
                {isSubmitting ? 'Updating Password...' : 'Update Password 🔑'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 8. DELETE ACCOUNT CONFIRMATION MODAL */}
      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 transition-opacity duration-300"
          onClick={() => setIsDeleteModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl transform transition-transform duration-300 animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-red-600 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-base">
                <FaExclamationTriangle size={18} />
                <span>Delete Account Request</span>
              </div>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <FaTimes size={13} />
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleConfirmDeleteRequest} className="p-5 space-y-4 text-left">
              <div className="bg-red-50 border border-red-100 rounded-2xl p-3.5 text-xs text-red-700 font-medium">
                Kya aap apna account delete karna chahte hain? Confirm karne par deletion request Admin ke paas jayegi aur approve hone par aapka account database se permanently delete ho jayega.
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Reason for Deletion (Optional)
                </label>
                <textarea
                  rows={3}
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="Tell us why you want to delete your account..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-xs hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDeleting}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-all active:scale-98 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <FaTrashAlt size={12} />
                  <span>{isDeleting ? 'Submitting...' : 'Submit Request'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
