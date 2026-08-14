import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import Axios from '../../utils/axios';
import SummaryApi from '../../common/SummerAPI';
import {
  FaArrowLeft,
  FaCheckCircle,
  FaFileAlt,
  FaChevronRight,
  FaUniversity,
  FaMobileAlt
} from 'react-icons/fa';
import { IoWalletOutline } from 'react-icons/io5';
import toast from 'react-hot-toast';

export const UserWithdraw = () => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  const context = useOutletContext() || {};

  const localUserStr = localStorage.getItem("user_data");
  let localUser = null;
  try {
    if (localUserStr) localUser = JSON.parse(localUserStr);
  } catch (e) { }

  const user = (context.user && context.user.role !== 'Admin')
    ? context.user
    : (localUser && localUser.role !== 'Admin' ? localUser : (context.user || localUser || {}));

  const withdrawableBalance = Number(
    user.wallet?.withdrowalable !== undefined
      ? user.wallet.withdrowalable
      : (user.balance !== undefined ? user.balance : (user.walletBalance || 0))
  );

  const [amount, setAmount] = useState('1000');
  const [method, setMethod] = useState('bank'); // 'bank' or 'upi'
  const [upiId, setUpiId] = useState(() => {
    const primaryUpi = (user.upiIds && user.upiIds.length > 0) ? user.upiIds[0]?.upiId : (user.paymentInfo?.upiId || '');
    return primaryUpi || '';
  });
  const [showRules, setShowRules] = useState(false);
  const [showExposureModal, setShowExposureModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const localBankStr = localStorage.getItem('bank_details');
  let localBank = null;
  try { if (localBankStr) localBank = JSON.parse(localBankStr); } catch (e) { }

  const primaryBank = (user.bankAccounts && user.bankAccounts.length > 0)
    ? (user.bankAccounts.find(b => b.isPrimary) || user.bankAccounts[0])
    : (user.bankDetails || user.paymentInfo || localBank || null);

  const hasBankDetails = Boolean(
    primaryBank && (primaryBank.accountNumber || primaryBank.bankName)
  );

  const numAmount = Number(amount);
  const isValidMethod = method === 'bank' ? hasBankDetails : Boolean(upiId && upiId.trim().length >= 3);
  const isValidAmount = numAmount > 0 && isValidMethod;

  const exposureAmount = Number(user.wallet?.exposureAmount !== undefined ? user.wallet.exposureAmount : (user.exposureAmount || 0));

  const handleProceed = async () => {
    if (exposureAmount > 0) {
      setShowExposureModal(true);
      return;
    }
    if (numAmount < 100) {
      toast.error('Minimum withdrawal amount is ₹100');
      return;
    }
    if (withdrawableBalance > 0 && numAmount > withdrawableBalance) {
      toast.error(`Amount exceeds available withdrawable balance (₹${withdrawableBalance.toFixed(2)})`);
      return;
    }
    if (method === 'bank' && !hasBankDetails) {
      toast.error('Please add bank details first');
      navigate('/bank-details');
      return;
    }
    if (method === 'upi' && (!upiId || upiId.trim().length < 3)) {
      toast.error('Please enter a valid UPI ID');
      return;
    }

    const accountDetailsStr = method === 'bank'
      ? `${primaryBank?.bankName || 'Bank'} - A/C: ${primaryBank?.accountNumber || ''} (IFSC: ${primaryBank?.ifscCode || ''})`
      : `UPI: ${upiId.trim()}`;

    setSubmitting(true);
    try {
      const response = await Axios({
        url: SummaryApi.requestWithdrawal?.url || '/api/payment/request-withdrawal',
        method: SummaryApi.requestWithdrawal?.method || 'post',
        data: {
          userId: user._id || user.id || '',
          mobile: user.mobile || '',
          amount: numAmount,
          method: method === 'bank' ? 'Bank Transfer' : 'UPI',
          accountDetails: accountDetailsStr
        }
      });

      if (response.data?.success) {
        toast.success('Withdrawal request submitted successfully! 🎉');
        setTimeout(() => {
          navigate('/passbook');
        }, 1000);
      } else {
        toast.error(response.data?.message || 'Failed to submit withdrawal request');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit withdrawal request';
      if (err.response?.data?.isExposureLocked) {
        setShowExposureModal(true);
      } else {
        toast.error(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full select-none pb-8 font-sans">
      {/* 1. TOP HEADER */}
      <div
        className="p-4 pt-4 pb-5 rounded-b-[28px] text-white shadow-md transition-colors duration-300 mb-4 sticky top-0 z-30"
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
              ₹{withdrawableBalance.toFixed(2)}
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
          onClick={() => setShowRules(!showRules)}
          className="w-full bg-[#f97316] hover:bg-orange-600 active:scale-[0.99] text-white font-bold py-3 rounded-2xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer text-xs"
        >
          <FaFileAlt size={13} />
          <span>Withdrawal Rules</span>
        </button>

        {/* 4.1 EXPANDABLE WITHDRAWAL RULES CARD (Exact match with screenshot) */}
        {showRules && (
          <div className="bg-white rounded-3xl p-5 border border-gray-150 shadow-2xs space-y-3.5 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-1">
              <FaFileAlt className="text-[#f97316]" size={14} />
              <span>Withdrawal Rules</span>
            </div>

            <div className="space-y-3 text-xs text-gray-700">
              {/* Rule 1 */}
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#f97316] text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  1
                </span>
                <p className="leading-tight font-medium text-gray-800">
                  Withdrawal requests are processed from 06:00 AM to 5:00 PM daily.
                </p>
              </div>

              {/* Rule 2 */}
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#f97316] text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  2
                </span>
                <p className="leading-tight font-medium text-gray-800">
                  Minimum withdrawal amount is ₹1000.
                </p>
              </div>

              {/* Rule 3 */}
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#f97316] text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  3
                </span>
                <p className="leading-tight font-medium text-gray-800">
                  All withdrawal requests require admin approval before processing.
                </p>
              </div>

              {/* Rule 4 */}
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#f97316] text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  4
                </span>
                <p className="leading-tight font-medium text-gray-800">
                  For any issues, please contact customer support.
                </p>
              </div>
            </div>
          </div>
        )}

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
              Minimum ₹1000 • Available: ₹{withdrawableBalance.toFixed(2)}
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

          {/* Field 3: Bank Account / UPI */}
          {method === 'bank' ? (
            hasBankDetails ? (
              <div
                onClick={() => navigate('/bank-details')}
                className="border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/70 rounded-2xl p-3.5 flex items-center justify-between cursor-pointer transition-all shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <FaUniversity size={15} />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-gray-900">
                      {primaryBank.bankName || 'Saved Bank Account'}
                    </h5>
                    <p className="text-[11px] font-mono font-semibold text-emerald-900 mt-0.5">
                      A/C: {primaryBank.accountNumber || primaryBank.accNo} {primaryBank.ifscCode ? `• IFSC: ${primaryBank.ifscCode}` : ''}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 bg-white/90 px-2.5 py-1 rounded-xl border border-emerald-200 shadow-2xs">
                  <span>Edit</span>
                  <span>→</span>
                </span>
              </div>
            ) : (
              <div
                onClick={() => navigate('/bank-details')}
                className="border-2 border-dashed border-gray-200 hover:border-gray-300 rounded-2xl p-3.5 flex items-center gap-3.5 bg-gray-50/60 cursor-pointer transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                  <FaUniversity size={15} />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-gray-900">Bank Account</h5>
                  <span className="text-[11px] text-[#f97316] font-semibold flex items-center gap-1 mt-0.5">
                    <span>Tap to add bank details</span>
                    <span>→</span>
                  </span>
                </div>
              </div>
            )
          ) : (
            <div>
              <div className="bg-gray-50/80 rounded-2xl border border-gray-200 p-2 flex items-center gap-2.5 focus-within:border-[#f97316] transition-colors">
                <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#f97316] border border-orange-100 flex items-center justify-center shrink-0">
                  <FaMobileAlt size={14} />
                </div>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="Enter UPI ID (e.g. name@upi)"
                  className="w-full text-xs font-semibold text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent"
                />
              </div>
              <p className="text-[10px] text-gray-400 font-normal mt-1 px-1">
                Example: mobilenumber@paytm, name@oksbi
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleProceed}
            className={`w-full py-3.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isValidAmount
                ? 'bg-[#f97316] hover:bg-orange-600 active:scale-98 text-white shadow-md'
                : 'bg-orange-400/90 text-white shadow-xs'
            }`}
          >
            <FaChevronRight size={10} />
            <span>Proceed to Review</span>
          </button>
        </div>
      </div>

      {/* EXPOSURE LOCK POPUP MODAL */}
      {showExposureModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-xs">
              <span className="text-3xl">🔒</span>
            </div>

            <div>
              <h3 className="text-base font-bold text-gray-900">Withdrawal Locked</h3>
              <p className="text-xs text-gray-700 font-semibold mt-2 leading-relaxed">
                You have a remaining exposure requirement of <span className="font-bold text-amber-700">₹{exposureAmount.toFixed(2)}</span>.
              </p>
              <p className="text-[11px] text-gray-500 font-normal mt-1.5 leading-normal">
                You must place bets worth <span className="font-bold text-gray-900">₹{exposureAmount.toFixed(2)}</span> more to unlock your withdrawal.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowExposureModal(false);
                  navigate('/home');
                }}
                className="w-full bg-[#f97316] hover:bg-orange-600 active:scale-95 text-white font-bold py-3 rounded-2xl shadow-xs transition-all cursor-pointer text-xs flex items-center justify-center gap-1.5"
              >
                <span>🎮 Play Games & Unlock</span>
              </button>
              <button
                type="button"
                onClick={() => setShowExposureModal(false)}
                className="w-full bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-700 font-bold py-2.5 rounded-2xl transition-all cursor-pointer text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserWithdraw;
