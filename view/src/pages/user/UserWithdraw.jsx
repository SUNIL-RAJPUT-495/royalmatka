import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import {
  FaArrowLeft,
  FaCheckCircle,
  FaFileAlt,
  FaChevronRight,
  FaUniversity,
  FaMobileAlt
} from 'react-icons/fa';
import { IoWalletOutline } from 'react-icons/io5';

export const UserWithdraw = () => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  const context = useOutletContext() || {};
  const user = context.user || { walletBalance: 9.0 };

  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('bank');

  const isValidAmount = Number(amount) >= 1000 && Number(amount) <= Number(user.walletBalance || 9);

  return (
    <div className="w-full select-none pb-8 font-sans">
      {/* 1. TOP HEADER */}
      <div
        className="p-4 pt-4 pb-5 rounded-b-[28px] text-white shadow-md transition-colors duration-300 mb-4"
        style={{ backgroundColor: currentTheme.headerBgColor }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-all cursor-pointer active:scale-95 border border-white/20 shadow-xs shrink-0"
          >
            <FaArrowLeft size={14} />
          </button>
          <div>
            <h2 className="text-base font-bold tracking-tight text-white">Withdraw Funds</h2>
            <p className="text-xs text-white/80 font-normal mt-0.5">Safe and secure withdrawals</p>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* 2. AVAILABLE BALANCE CARD */}
        <div className="bg-white rounded-3xl p-4.5 border border-gray-150 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500">Available Balance</span>
            <div className="text-2xl font-bold text-gray-900 mt-0.5">
              ₹{Number(user.walletBalance || 9).toFixed(2)}
            </div>
          </div>

          <div className="w-11 h-11 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center shadow-2xs">
            <IoWalletOutline size={20} />
          </div>
        </div>

        {/* 3. WITHDRAWAL WINDOW OPEN ALERT */}
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <FaCheckCircle size={14} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-emerald-900">Withdrawal Window Open</h4>
            <p className="text-[11px] text-emerald-700 font-normal mt-0.5">
              You can withdraw between 6:00 AM and 5:00 PM.
            </p>
          </div>
        </div>

        {/* 4. WITHDRAWAL RULES BUTTON */}
        <button
          type="button"
          onClick={() => navigate('/withdrawal-rules')}
          className="w-full bg-[#f97316] hover:bg-orange-600 active:scale-[0.99] text-white font-bold py-3 rounded-2xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer text-xs"
        >
          <FaFileAlt size={13} />
          <span>Withdrawal Rules</span>
        </button>

        {/* 5. WITHDRAWAL FORM CONTAINER CARD */}
        <div className="bg-white rounded-3xl p-5 border border-gray-150 shadow-2xs space-y-4">
          {/* Field 1: Amount */}
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1.5">
              Withdrawal Amount
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500">
                ₹
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount (min ₹1000)"
                className="w-full pl-8 pr-3.5 py-3 rounded-2xl border border-gray-200 text-xs font-semibold text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#f97316] transition-colors"
              />
            </div>
            <div className="text-[10px] font-medium text-gray-400 mt-1">
              Minimum ₹1000 • Available: ₹{Number(user.walletBalance || 9).toFixed(2)}
            </div>
          </div>

          {/* Field 2: Payment Method */}
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1.5">
              Payment Method
            </label>
            <div className="bg-gray-50 p-1 rounded-2xl border border-gray-150 flex items-center">
              <button
                type="button"
                onClick={() => setMethod('bank')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  method === 'bank'
                    ? 'bg-[#f97316] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FaUniversity size={13} />
                <span>Bank Account</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('upi')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  method === 'upi'
                    ? 'bg-[#f97316] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FaMobileAlt size={13} />
                <span>UPI ID</span>
              </button>
            </div>
          </div>

          {/* Field 3: Bank Account / UPI dashed card */}
          <div
            onClick={() => navigate('/payment-methods')}
            className="border-2 border-dashed border-gray-200 hover:border-gray-300 rounded-2xl p-3.5 flex items-center gap-3.5 bg-gray-50/60 cursor-pointer transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
              {method === 'bank' ? <FaUniversity size={15} /> : <FaMobileAlt size={15} />}
            </div>
            <div>
              <h5 className="text-xs font-bold text-gray-900">
                {method === 'bank' ? 'Bank Account' : 'UPI ID'}
              </h5>
              <span className="text-[11px] text-[#f97316] font-semibold flex items-center gap-1 mt-0.5">
                <span>Tap to add {method === 'bank' ? 'bank' : 'UPI'} details</span>
                <span>→</span>
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="button"
            disabled={!isValidAmount}
            className={`w-full py-3.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              isValidAmount
                ? 'bg-[#f97316] hover:bg-orange-600 text-white shadow-md cursor-pointer'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <FaChevronRight size={10} />
            <span>Proceed to Review</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserWithdraw;
