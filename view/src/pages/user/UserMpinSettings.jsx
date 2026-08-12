import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import {
  FaArrowLeft,
  FaCheckCircle
} from 'react-icons/fa';
import {
  IoShieldOutline,
  IoLockClosedOutline,
  IoPhonePortraitOutline,
  IoCheckmarkCircleOutline
} from 'react-icons/io5';
import toast from 'react-hot-toast';

export const UserMpinSettings = () => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  const context = useOutletContext() || {};
  const user = context.user || { mobile: '8079003424' };

  // View state: 'menu' | 'change_mpin' | 'change_password' | 'forgot_step1' | 'forgot_step2'
  const [currentView, setCurrentView] = useState('menu');

  // Change MPIN fields
  const [oldMpin, setOldMpin] = useState('');
  const [newMpin, setNewMpin] = useState('');
  const [confirmNewMpin, setConfirmNewMpin] = useState('');

  // Change Password fields
  const [currentMpinConfirm, setCurrentMpinConfirm] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Forgot MPIN fields
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(298);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let interval;
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timer]);

  const handleUpdateMpin = (e) => {
    e.preventDefault();
    if (!oldMpin || !newMpin || !confirmNewMpin) {
      toast.error('Please fill all MPIN fields');
      return;
    }
    if (newMpin !== confirmNewMpin) {
      toast.error('New MPIN and Confirm MPIN must match');
      return;
    }
    toast.success('MPIN updated successfully!');
    setOldMpin('');
    setNewMpin('');
    setConfirmNewMpin('');
    setCurrentView('menu');
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (!currentMpinConfirm || !newPassword || !confirmNewPassword) {
      toast.error('Please fill all password fields');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error('New password and confirm password must match');
      return;
    }
    toast.success('Password updated successfully!');
    setCurrentMpinConfirm('');
    setNewPassword('');
    setConfirmNewPassword('');
    setCurrentView('menu');
  };

  const handleSendOtp = () => {
    setTimer(298);
    setIsTimerRunning(true);
    setCurrentView('forgot_step2');
    toast.success('OTP sent to registered mobile number');
  };

  const handleVerifyOtp = () => {
    if (!otp || otp.length < 4) {
      toast.error('Please enter valid 6-digit OTP');
      return;
    }
    toast.success('OTP verified successfully!');
    setCurrentView('change_mpin');
  };

  return (
    <div className="w-full select-none pb-12 font-sans">
      {/* 1. TOP ORANGE HEADER */}
      <div
        className="p-4 pt-4 pb-5 rounded-b-[28px] text-white shadow-md transition-colors duration-300 mb-4 sticky top-0 z-30"
        style={{ backgroundColor: currentTheme.headerBgColor }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (currentView !== 'menu') {
                setCurrentView('menu');
              } else {
                navigate(-1);
              }
            }}
            className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-all cursor-pointer active:scale-95 border border-white/20 shadow-xs shrink-0"
            title="Go Back"
          >
            <FaArrowLeft size={14} />
          </button>
          <div>
            <h2 className="text-base font-bold tracking-tight text-white leading-tight">
              MPIN Settings
            </h2>
            <p className="text-xs text-white/80 font-normal mt-0.5">
              Registered mobile: {user.mobile || '8079003424'}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4">
        {/* ===================== VIEW 1: MAIN MENU ===================== */}
        {currentView === 'menu' && (
          <div className="bg-white rounded-3xl p-5 border border-gray-150 shadow-2xs space-y-3.5">
            {/* 1. Change MPIN */}
            <div
              onClick={() => setCurrentView('change_mpin')}
              className="p-4 rounded-2xl border border-gray-900/80 hover:bg-gray-50 active:scale-[0.99] cursor-pointer transition-all space-y-1"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
                <IoShieldOutline size={15} />
                <span>Change MPIN</span>
              </div>
              <p className="text-[11px] text-gray-500 font-normal">
                Enter old MPIN and set new MPIN.
              </p>
            </div>

            {/* 2. Change Password */}
            <div
              onClick={() => setCurrentView('change_password')}
              className="p-4 rounded-2xl border border-gray-900/80 hover:bg-gray-50 active:scale-[0.99] cursor-pointer transition-all space-y-1"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
                <IoLockClosedOutline size={15} />
                <span>Change Password</span>
              </div>
              <p className="text-[11px] text-gray-500 font-normal">
                Set or change your login password (MPIN se confirm).
              </p>
            </div>

            {/* 3. Forgot MPIN */}
            <div
              onClick={() => setCurrentView('forgot_step1')}
              className="p-4 rounded-2xl border border-gray-900/80 hover:bg-gray-50 active:scale-[0.99] cursor-pointer transition-all space-y-1"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
                <IoPhonePortraitOutline size={15} />
                <span>Forgot MPIN</span>
              </div>
              <p className="text-[11px] text-gray-500 font-normal">
                OTP verify karke MPIN reset karein.
              </p>
            </div>
          </div>
        )}

        {/* ===================== VIEW 2: CHANGE MPIN (Screenshot 4) ===================== */}
        {currentView === 'change_mpin' && (
          <form onSubmit={handleUpdateMpin} className="bg-white rounded-3xl p-5 border border-gray-150 shadow-2xs space-y-3">
            <input
              type="password"
              maxLength={6}
              value={oldMpin}
              onChange={(e) => setOldMpin(e.target.value)}
              placeholder="Old MPIN"
              className="w-full px-4 py-3.5 rounded-2xl border border-gray-900/80 text-xs font-semibold text-gray-900 placeholder-gray-500 focus:outline-none"
            />

            <input
              type="password"
              maxLength={6}
              value={newMpin}
              onChange={(e) => setNewMpin(e.target.value)}
              placeholder="New MPIN"
              className="w-full px-4 py-3.5 rounded-2xl border border-gray-900/80 text-xs font-semibold text-gray-900 placeholder-gray-500 focus:outline-none"
            />

            <input
              type="password"
              maxLength={6}
              value={confirmNewMpin}
              onChange={(e) => setConfirmNewMpin(e.target.value)}
              placeholder="Confirm New MPIN"
              className="w-full px-4 py-3.5 rounded-2xl border border-gray-900/80 text-xs font-semibold text-gray-900 placeholder-gray-500 focus:outline-none"
            />

            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setCurrentView('menu')}
                className="w-32 py-3 rounded-2xl border border-gray-900/80 text-xs font-bold text-gray-900 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                Back
              </button>

              <button
                type="submit"
                className="flex-1 py-3 rounded-2xl bg-[#f97316] hover:bg-orange-600 active:scale-95 text-white text-xs font-bold cursor-pointer shadow-xs transition-all"
              >
                Update MPIN
              </button>
            </div>
          </form>
        )}

        {/* ===================== VIEW 3: CHANGE PASSWORD (Screenshot 2) ===================== */}
        {currentView === 'change_password' && (
          <form onSubmit={handleUpdatePassword} className="bg-white rounded-3xl p-5 border border-gray-150 shadow-2xs space-y-3">
            <input
              type="password"
              value={currentMpinConfirm}
              onChange={(e) => setCurrentMpinConfirm(e.target.value)}
              placeholder="Current MPIN (to confirm)"
              className="w-full px-4 py-3.5 rounded-2xl border border-gray-900/80 text-xs font-semibold text-gray-900 placeholder-gray-500 focus:outline-none"
            />

            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password (min 4 chars)"
              className="w-full px-4 py-3.5 rounded-2xl border border-gray-900/80 text-xs font-semibold text-gray-900 placeholder-gray-500 focus:outline-none"
            />

            <input
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              placeholder="Confirm New Password"
              className="w-full px-4 py-3.5 rounded-2xl border border-gray-900/80 text-xs font-semibold text-gray-900 placeholder-gray-500 focus:outline-none"
            />

            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setCurrentView('menu')}
                className="w-32 py-3 rounded-2xl border border-gray-900/80 text-xs font-bold text-gray-900 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                Back
              </button>

              <button
                type="submit"
                className="flex-1 py-3 rounded-2xl bg-[#f97316] hover:bg-orange-600 active:scale-95 text-white text-xs font-bold cursor-pointer shadow-xs transition-all"
              >
                Update Password
              </button>
            </div>
          </form>
        )}

        {/* ===================== VIEW 4: FORGOT MPIN STEP 1 (Screenshot 3) ===================== */}
        {currentView === 'forgot_step1' && (
          <div className="bg-white rounded-3xl p-5 border border-gray-150 shadow-2xs space-y-3">
            <button
              type="button"
              onClick={handleSendOtp}
              className="w-full py-3.5 rounded-2xl bg-[#f97316] hover:bg-orange-600 active:scale-[0.99] text-white text-xs font-bold cursor-pointer shadow-xs transition-all text-center"
            >
              Send OTP on {user.mobile || '8079003424'}
            </button>

            <button
              type="button"
              onClick={() => setCurrentView('menu')}
              className="w-full py-3 rounded-2xl border border-gray-900/80 text-xs font-bold text-gray-900 hover:bg-gray-50 cursor-pointer transition-colors text-center"
            >
              Back
            </button>
          </div>
        )}

        {/* ===================== VIEW 5: FORGOT MPIN STEP 2 (Screenshot 1) ===================== */}
        {currentView === 'forgot_step2' && (
          <div className="bg-white rounded-3xl p-5 border border-gray-150 shadow-2xs space-y-3.5">
            {/* Green OTP Sent Banner */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center gap-2 text-xs font-medium text-emerald-800">
              <IoCheckmarkCircleOutline size={18} className="text-emerald-600 shrink-0" />
              <span>OTP sent to your registered mobile number.</span>
            </div>

            {/* Resend Timer Text */}
            <div className="text-xs text-gray-500 font-medium px-1">
              Resend OTP in {timer}s
            </div>

            {/* OTP Input */}
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP"
              className="w-full px-4 py-3.5 rounded-2xl border border-gray-900/80 text-xs font-semibold text-gray-900 placeholder-gray-500 focus:outline-none"
            />

            {/* Buttons Stack */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleVerifyOtp}
                className="w-full py-3.5 rounded-2xl bg-[#2563eb] hover:bg-blue-700 active:scale-[0.99] text-white text-xs font-bold cursor-pointer shadow-xs transition-all text-center"
              >
                Verify OTP
              </button>

              <button
                type="button"
                onClick={handleSendOtp}
                className="w-full py-3 rounded-2xl border border-gray-900/80 text-xs font-bold text-gray-900 hover:bg-gray-50 cursor-pointer transition-colors text-center"
              >
                Resend OTP
              </button>

              <button
                type="button"
                onClick={() => setCurrentView('menu')}
                className="w-full py-3 rounded-2xl border border-gray-900/80 text-xs font-bold text-gray-900 hover:bg-gray-50 cursor-pointer transition-colors text-center"
              >
                Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserMpinSettings;
