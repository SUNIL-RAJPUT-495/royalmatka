import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import {
  FaArrowLeft,
  FaShieldAlt,
  FaLock,
  FaMobileAlt
} from 'react-icons/fa';
import { IoShieldOutline, IoLockClosedOutline, IoPhonePortraitOutline } from 'react-icons/io5';

export const UserMpinSettings = () => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  const context = useOutletContext() || {};
  const user = context.user || { mobile: '8079003424' };

  return (
    <div className="w-full select-none pb-12 font-sans">
      {/* 1. TOP ORANGE HEADER (Exact Match with Screenshot 1) */}
      <div
        className="p-4 pt-4 pb-5 rounded-b-[28px] text-white shadow-md transition-colors duration-300 mb-4"
        style={{ backgroundColor: currentTheme.headerBgColor }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
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
        {/* 2. MAIN WHITE CONTAINER CARD (Exact Match with Screenshot 1) */}
        <div className="bg-white rounded-3xl p-5 border border-gray-150 shadow-2xs space-y-3.5">
          {/* Option 1: Change MPIN */}
          <div
            onClick={() => navigate('/change-mpin')}
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

          {/* Option 2: Change Password */}
          <div
            onClick={() => navigate('/change-password')}
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

          {/* Option 3: Forgot MPIN */}
          <div
            onClick={() => navigate('/forgot-mpin')}
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
      </div>
    </div>
  );
};

export default UserMpinSettings;
