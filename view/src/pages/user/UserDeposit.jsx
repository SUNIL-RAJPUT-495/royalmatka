import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { FaArrowLeft, FaShieldAlt, FaInfoCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';

export const UserDeposit = () => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();

  const [amount, setAmount] = useState('');
  const presetAmounts = [100, 200, 500, 1000, 2000, 10000];

  const numAmount = Number(amount);
  const isValidAmount = numAmount >= 100 && numAmount <= 50000;

  const handlePay = () => {
    if (!isValidAmount) {
      toast.error('Please enter an amount between ₹100 and ₹50,000');
      return;
    }
    toast.success(`Opening UPI Gateway for ₹${numAmount}...`);
  };

  return (
    <div className="w-full select-none pb-8 font-sans">
      {/* 1. TOP ORANGE HEADER */}
      <div
        className="p-4 pt-4 pb-5 rounded-b-[28px] text-white shadow-md transition-colors duration-300 mb-4 sticky top-0 z-30"
        style={{ backgroundColor: currentTheme.headerBgColor }}
      >
        <div className="flex items-center justify-between relative">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-all cursor-pointer active:scale-95 border border-white/20 shadow-xs shrink-0 z-10"
            title="Go Back"
          >
            <FaArrowLeft size={14} />
          </button>
          
          <h2 className="absolute inset-0 flex items-center justify-center text-base font-bold text-white tracking-wide">
            Add Funds
          </h2>

          <div className="w-10 h-10" />
        </div>
      </div>

      <div className="px-4">
        {/* 2. MAIN WHITE CARD CONTAINER */}
        <div className="bg-white rounded-3xl p-5 border border-gray-150 shadow-2xs space-y-4">
          {/* Green Notice Banner */}
          <div className="bg-emerald-50/60 border-l-[4px] border-l-emerald-500 rounded-2xl p-4 space-y-1">
            <h3 className="text-emerald-700 font-bold text-sm leading-tight">Add Fund</h3>
            <div className="text-emerald-800 font-bold text-xs uppercase tracking-wide">
              MINIMUM DEPOSIT ₹100
            </div>
            <p className="text-emerald-600 text-xs font-medium">
              पेमेंट तुरंत आपके वॉलेट में क्रेडिट हो जाएगी।
            </p>
          </div>

          {/* Amount Input with Orange Border */}
          <div className="border-2 border-[#f97316] rounded-2xl p-2.5 flex items-center gap-3 bg-white shadow-2xs">
            <div className="w-9 h-9 rounded-full bg-[#f97316] text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
              ₹
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter Amount"
              className="w-full text-sm font-semibold text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent"
            />
          </div>

          {/* Min & Max Limit Labels */}
          <div className="text-xs font-semibold text-gray-400 flex items-center gap-1">
            <span>Min:</span>
            <span className="text-[#f97316] font-bold">₹100</span>
            <span className="mx-1">•</span>
            <span>Max:</span>
            <span className="text-[#f97316] font-bold">₹50,000</span>
          </div>

          {/* 6 Quick Amount Preset Buttons */}
          <div className="grid grid-cols-3 gap-2.5">
            {presetAmounts.map((preset) => {
              const isSelected = numAmount === preset;
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset.toString())}
                  className={`py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-orange-50 border-[#f97316] text-[#f97316] shadow-xs'
                      : 'bg-gray-100/80 hover:bg-gray-100 border-transparent text-gray-800'
                  }`}
                >
                  ₹{preset.toLocaleString()}
                </button>
              );
            })}
          </div>

          {/* Pay Button */}
          <button
            type="button"
            disabled={!isValidAmount}
            onClick={handlePay}
            className={`w-full py-3.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              isValidAmount
                ? 'bg-[#f97316] hover:bg-orange-600 active:scale-98 text-white shadow-md cursor-pointer'
                : 'bg-gray-150 text-gray-400 cursor-not-allowed'
            }`}
          >
            <FaShieldAlt size={13} />
            <span>Pay via UPI Gateway</span>
            <span className="opacity-80 font-normal">• Instant</span>
          </button>

          {/* Blue Notice Alert */}
          <div className="bg-blue-50/70 border-l-[4px] border-l-blue-500 rounded-2xl p-3.5 flex items-start gap-2.5">
            <FaInfoCircle size={15} className="text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-900 leading-tight font-medium">
              <span className="font-bold">Notice:</span> Payment complete karne ke baad wallet mein automatically credit ho jayega.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDeposit;
