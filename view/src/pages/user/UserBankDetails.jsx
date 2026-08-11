import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import {
  FaArrowLeft,
  FaUniversity,
  FaCreditCard,
  FaCode,
  FaUser,
  FaCheck,
  FaInfoCircle,
  FaShieldAlt
} from 'react-icons/fa';
import { IoCheckmarkCircleOutline } from 'react-icons/io5';
import toast from 'react-hot-toast';

export const UserBankDetails = () => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();

  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [holderName, setHolderName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    if (!accountNumber || !ifscCode || !holderName) {
      toast.error('Please fill in all bank details');
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      localStorage.setItem('bank_details', JSON.stringify({ bankName, accountNumber, ifscCode, holderName }));
      toast.success('Bank details saved successfully!');
      navigate('/withdraw');
    }, 600);
  };

  return (
    <div className="w-full select-none pb-8 font-sans">
      {/* 1. TOP ORANGE HEADER */}
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

          <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-white shrink-0">
            <FaUniversity size={17} />
          </div>

          <div>
            <h2 className="text-base font-bold tracking-tight text-white leading-tight">
              Bank Details
            </h2>
            <p className="text-xs text-white/80 font-normal mt-0.5">Add your bank account</p>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* 2. MAIN BANK FORM CARD */}
        <form onSubmit={handleSave} className="bg-white rounded-3xl p-5 border border-gray-150 shadow-2xs space-y-3.5">
          {/* Field 1: Bank Name */}
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1.5">
              Bank Name
            </label>
            <div className="bg-gray-50/80 rounded-2xl border border-gray-200 p-1.5 flex items-center gap-2.5 focus-within:border-[#f97316] transition-colors">
              <div className="w-8 h-8 rounded-xl bg-[#f97316] text-white flex items-center justify-center shrink-0 shadow-2xs">
                <FaUniversity size={14} />
              </div>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g., State Bank of India"
                className="w-full text-xs font-semibold text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent"
              />
            </div>
          </div>

          {/* Field 2: Account Number */}
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1.5">
              Account Number
            </label>
            <div className="bg-gray-50/80 rounded-2xl border border-gray-200 p-1.5 flex items-center gap-2.5 focus-within:border-[#f97316] transition-colors">
              <div className="w-8 h-8 rounded-xl bg-[#f97316] text-white flex items-center justify-center shrink-0 shadow-2xs">
                <FaCreditCard size={13} />
              </div>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Enter account number"
                className="w-full text-xs font-semibold text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent"
              />
            </div>
          </div>

          {/* Field 3: IFSC Code */}
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1.5">
              IFSC Code
            </label>
            <div className="bg-gray-50/80 rounded-2xl border border-gray-200 p-1.5 flex items-center gap-2.5 focus-within:border-[#f97316] transition-colors">
              <div className="w-8 h-8 rounded-xl bg-[#f97316] text-white flex items-center justify-center shrink-0 shadow-2xs">
                <FaCode size={13} />
              </div>
              <input
                type="text"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                placeholder="Enter IFSC code"
                className="w-full text-xs font-semibold text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent uppercase"
              />
            </div>
          </div>

          {/* Field 4: Account Holder Name */}
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1.5">
              Account Holder Name
            </label>
            <div className="bg-gray-50/80 rounded-2xl border border-gray-200 p-1.5 flex items-center gap-2.5 focus-within:border-[#f97316] transition-colors">
              <div className="w-8 h-8 rounded-xl bg-[#f97316] text-white flex items-center justify-center shrink-0 shadow-2xs">
                <FaUser size={13} />
              </div>
              <input
                type="text"
                value={holderName}
                onChange={(e) => setHolderName(e.target.value)}
                placeholder="Enter account holder name"
                className="w-full text-xs font-semibold text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-1">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-[#f97316] hover:bg-orange-600 active:scale-98 text-white font-bold py-3.5 rounded-2xl shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all text-xs"
            >
              <FaCheck size={12} />
              <span>{isSaving ? 'Saving...' : 'Save Bank Details'}</span>
            </button>
          </div>
        </form>

        {/* 3. WHY WE NEED THIS INFO CARD */}
        <div className="bg-[#fff4ed] border border-orange-150 rounded-3xl p-4 flex items-start gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-2xl bg-[#f97316] text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
            <FaInfoCircle size={18} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900 leading-tight">
              Why we need this?
            </h4>
            <p className="text-[11px] text-gray-600 font-normal leading-relaxed mt-1">
              Your bank details will be used for processing withdrawals and refunds. Please ensure all information is accurate and matches your bank records.
            </p>
          </div>
        </div>

        {/* 4. BANK-GRADE SECURITY PILL BADGE */}
        <div className="flex justify-center pt-2">
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs px-4 py-2 rounded-full inline-flex items-center gap-2 shadow-2xs">
            <IoCheckmarkCircleOutline size={16} className="text-emerald-600" />
            <span>Bank-Grade Security</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserBankDetails;
