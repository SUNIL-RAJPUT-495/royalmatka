import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { FaArrowLeft, FaShieldAlt, FaInfoCircle, FaCopy, FaCheckCircle, FaQrcode, FaHashtag, FaChevronRight } from 'react-icons/fa';
import { IoWalletOutline, IoSparkles, IoArrowForward } from 'react-icons/io5';
import toast, { Toaster } from 'react-hot-toast';
import Axios from '../../utils/axios';
import SummaryApi from '../../common/SummerAPI';

export const UserDeposit = () => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();

  // Step 1: Amount Selection | Step 2: Manual Payment (QR, UPI & UTR)
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Settings from backend
  const [settings, setSettings] = useState({
    upiId: 'sanwariyaboss@ybl',
    displayName: 'Sanwariya Boss',
    qrCodeUrl: '',
    activeFundSystem: 'Manual',
    minAmount: 100,
    maxAmount: 50000,
    quickAmounts: [100, 300, 500, 1000, 2000, 5000]
  });

  useEffect(() => {
    const fetchSettings = async () => {
      let fetchedPaymentSettings = null;
      try {
        const res = await Axios({
          url: SummaryApi.getPaymentSettings.url,
          method: SummaryApi.getPaymentSettings.method
        });
        if (res.data?.settings) {
          fetchedPaymentSettings = res.data.settings;
        }
      } catch (err) {
        console.warn('Using default payment settings');
      }

      try {
        const txnRes = await Axios({
          url: SummaryApi.getTransactionSettings.url,
          method: SummaryApi.getTransactionSettings.method
        });
        if (txnRes.data?.data?.minDeposit && (!fetchedPaymentSettings || fetchedPaymentSettings.minAmount === undefined)) {
          setSettings(prev => ({ ...prev, minAmount: Number(txnRes.data.data.minDeposit) }));
        }
      } catch (err) {
        console.warn('Using default transaction settings');
      }

      if (fetchedPaymentSettings) {
        setSettings(prev => ({ ...prev, ...fetchedPaymentSettings }));
      }
    };
    fetchSettings();
  }, []);

  const numAmount = Number(amount);
  const minAmt = settings.minAmount !== undefined && settings.minAmount !== null ? Number(settings.minAmount) : 100;
  const maxAmt = settings.maxAmount !== undefined && settings.maxAmount !== null ? Number(settings.maxAmount) : 50000;
  const isValidAmount = numAmount >= minAmt && numAmount <= maxAmt;
  const presetAmounts = settings.quickAmounts && settings.quickAmounts.length > 0
    ? settings.quickAmounts
    : [100, 200, 500, 1000, 2000, 5000];

  const handleCopyUpi = () => {
    if (settings.upiId) {
      navigator.clipboard.writeText(settings.upiId);
      setCopied(true);
      toast.success('UPI ID copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Step 1 "Proceed / Pay" Click Handler
  const handleProceedToPay = () => {
    if (!amount || isNaN(numAmount)) {
      toast.error(`Please enter deposit amount (min ₹${minAmt})`);
      return;
    }
    if (!isValidAmount) {
      toast.error(`Please enter an amount between ₹${minAmt} and ₹${maxAmt.toLocaleString('en-IN')}`);
      return;
    }

    if (settings.activeFundSystem === 'IMB') {
      handleIMBPayment();
    } else {
      // Manual mode -> Open Step 2 (QR, UPI & UTR page)
      setStep(2);
      window.scrollTo(0, 0);
    }
  };

  // IMB Gateway Payment Handler
  const handleIMBPayment = async () => {
    if (loading || isSubmitted) return;

    if (!isValidAmount) {
      toast.error(`Please enter an amount between ₹${minAmt} and ₹${maxAmt.toLocaleString('en-IN')}`);
      return;
    }

    setLoading(true);
    try {
      const savedUserStr = localStorage.getItem('user_data');
      let savedUser = null;
      try { if (savedUserStr) savedUser = JSON.parse(savedUserStr); } catch (e) { }

      const { data } = await Axios({
        url: SummaryApi.createOrder.url,
        method: SummaryApi.createOrder.method,
        data: {
          amount: Number(amount),
          mobile: savedUser?.mobile || ''
        }
      });

      if (data.success && (data.payment_url || data.redirect_url || data.url)) {
        const paymentLink = data.payment_url || data.redirect_url || data.url;
        window.location.href = paymentLink;
      } else {
        throw new Error(data.message || "Failed to initiate payment. No URL received.");
      }
    } catch (error) {
      console.error("Payment Handler Error:", error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || "Something went wrong.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUtrChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 12);
    setUtrNumber(val);
  };

  // Manual Deposit Request Handler
  const handleManualDeposit = async () => {
    if (loading || isSubmitted) return;

    if (!isValidAmount) {
      toast.error(`Please enter an amount between ₹${minAmt} and ₹${maxAmt.toLocaleString('en-IN')}`);
      return;
    }
    if (!utrNumber || utrNumber.length !== 12) {
      toast.error('Please enter a valid 12-digit UTR number (numbers only)');
      return;
    }

    setLoading(true);
    setIsSubmitted(true);

    try {
      const savedUserStr = localStorage.getItem('user_data');
      let savedUser = null;
      try { if (savedUserStr) savedUser = JSON.parse(savedUserStr); } catch (e) { }

      const res = await Axios({
        url: SummaryApi.manualDeposit.url,
        method: SummaryApi.manualDeposit.method,
        data: {
          amount: Number(amount),
          utrNumber: utrNumber.trim(),
          mobile: savedUser?.mobile || ''
        }
      });

      if (res.data?.success) {
        setShowSuccessModal(true);
        toast.success('Your deposit request has been submitted to Admin for verification and approval!', {
          duration: 4000,
          style: {
            borderRadius: '16px',
            background: '#10b981',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '13px'
          }
        });
        setTimeout(() => {
          navigate('/passbook');
        }, 2500);
      } else {
        setIsSubmitted(false);
        toast.error(res.data?.message || 'Failed to submit deposit request');
      }
    } catch (error) {
      setIsSubmitted(false);
      toast.error(error.response?.data?.message || 'Deposit request failed');
    } finally {
      setLoading(false);
    }
  };

  const themeHeaderBg = currentTheme?.headerBgColor || '#ea580c';

  return (
    <div className="w-full select-none pb-12 font-sans relative min-h-screen bg-[#f5f6fa]">
      {/* Toast Notification Provider */}
      <Toaster position="top-center" reverseOrder={false} />

      {/* SUCCESS MODAL POPUP */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[9999999] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <FaCheckCircle size={36} />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900">Deposit Request Submitted!</h3>
              <p className="text-xs font-semibold text-gray-600 mt-2 leading-relaxed">
                Your deposit request of <span className="font-extrabold text-emerald-600">₹{Number(amount).toLocaleString('en-IN')}</span> has been submitted to Admin for verification and approval!
              </p>
            </div>
            <button
              onClick={() => navigate('/passbook')}
              className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold py-3.5 rounded-2xl text-xs shadow-md transition-all cursor-pointer"
            >
              View Passbook Status
            </button>
          </div>
        </div>
      )}

      {/* 1. TOP HEADER */}
      <div
        className="p-4 pt-4 pb-5 rounded-b-[28px] text-white shadow-md transition-colors duration-300 mb-4 sticky top-0 z-30"
        style={{ backgroundColor: themeHeaderBg }}
      >
        <div className="flex items-center justify-between relative">
          <button
            onClick={() => {
              if (step === 2) {
                setStep(1);
              } else {
                navigate(-1);
              }
            }}
            className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-all cursor-pointer active:scale-95 border border-white/20 shadow-xs shrink-0 z-10"
            title="Go Back"
          >
            <FaArrowLeft size={14} />
          </button>

          <h2 className="absolute inset-0 flex items-center justify-center text-base font-bold text-white tracking-wide">
            {step === 1 ? 'Add Funds' : 'Complete Payment'}
          </h2>

          <div className="w-10 h-10 flex items-center justify-center text-xs font-bold bg-white/20 rounded-full border border-white/25">
            {step}/2
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4">

        {/* ========================================================= */}
        {/* STEP 1: AMOUNT SELECTION PAGE (Only Amount Input + Pay)    */}
        {/* ========================================================= */}
        {step === 1 && (
          <div className="bg-white rounded-3xl p-5 border border-gray-150 shadow-2xs space-y-5 animate-in fade-in duration-200">
            
            {/* Notice Banner */}
            <div className="bg-emerald-50/80 border-l-[4px] border-l-emerald-500 rounded-2xl p-4 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-sm">
                <IoWalletOutline size={17} />
                <span>Add Funds to Wallet</span>
              </div>
              <div className="text-emerald-800 font-bold text-xs uppercase tracking-wide">
                MINIMUM DEPOSIT ₹{minAmt}
              </div>
              <p className="text-emerald-700 text-xs font-medium leading-relaxed">
                {settings.activeFundSystem === 'IMB'
                  ? 'पेमेंट पूरा होने पर तुरंत आपके वॉलेट में ऑटो-क्रेडिट हो जाएगी।'
                  : 'अमाउंट सेलेक्ट करके Pay पर क्लिक करें, इसके बाद QR Scanner और UPI ID का पेज खुलेगा।'}
              </p>
            </div>

            {/* Quick Amount Preset Buttons */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider block">
                ⚡ Quick Deposit Amounts
              </span>
              <div className="grid grid-cols-3 gap-2.5">
                {presetAmounts.map((preset) => {
                  const isSelected = numAmount === preset;
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAmount(preset.toString())}
                      className={`py-3 px-2 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-[#f97316] text-white border-orange-600 shadow-md scale-[1.02]'
                          : 'bg-orange-50/80 hover:bg-orange-100/80 border-orange-200 text-orange-950 shadow-2xs active:scale-95'
                      }`}
                    >
                      + ₹{preset.toLocaleString('en-IN')}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Amount Input Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-800">
                Or Enter Custom Deposit Amount
              </label>
              <div className="border-2 border-[#f97316] rounded-2xl p-2.5 flex items-center gap-3 bg-white shadow-2xs focus-within:ring-2 focus-within:ring-orange-300">
                <div className="w-10 h-10 rounded-xl bg-[#f97316] text-white flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
                  ₹
                </div>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={`Enter Amount (min ₹${minAmt})`}
                  className="w-full text-base font-bold text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent"
                />
              </div>

              {/* Min & Max Limit Info */}
              <div className="text-xs font-semibold text-gray-400 flex items-center gap-1 mt-1.5 px-1">
                <span>Min:</span>
                <span className="text-[#f97316] font-bold">₹{minAmt}</span>
                <span className="mx-1">•</span>
                <span>Max:</span>
                <span className="text-[#f97316] font-bold">₹{maxAmt.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Big "PAY / PROCEED" Button */}
            <button
              type="button"
              disabled={loading || !isValidAmount}
              onClick={handleProceedToPay}
              className={`w-full py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
                isValidAmount
                  ? 'bg-[#f97316] hover:bg-orange-600 active:scale-98 text-white cursor-pointer shadow-orange-500/20'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <span>{isValidAmount ? `Pay ₹${numAmount.toLocaleString('en-IN')}` : 'Enter Valid Amount'}</span>
              <IoArrowForward size={16} />
            </button>

            {/* Help / Notice Banner */}
            <div className="bg-blue-50/70 border-l-[4px] border-l-blue-500 rounded-2xl p-3.5 flex items-start gap-2.5">
              <FaInfoCircle size={15} className="text-blue-500 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-900 leading-tight font-medium">
                <span className="font-bold">Notice:</span> Amount select karke Pay pe click karein. 100% Safe & Secure payment processing.
              </p>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 2: MANUAL PAYMENT PAGE (QR SCANNER, UPI ID & UTR)    */}
        {/* ========================================================= */}
        {step === 2 && (
          <div className="bg-white rounded-3xl p-5 border border-gray-150 shadow-2xs space-y-5 animate-in fade-in duration-200">
            
            {/* Amount Summary Header Card */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-4 text-white flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[10px] font-semibold text-orange-100 uppercase tracking-wider block">
                  Amount to Pay
                </span>
                <div className="text-2xl font-black tracking-tight mt-0.5">
                  ₹{Number(amount).toLocaleString('en-IN')}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-xl text-xs font-bold text-white border border-white/25 active:scale-95 transition-all"
              >
                Change Amount
              </button>
            </div>

            {/* QR Scanner Display Card */}
            {settings.qrCodeUrl ? (
              <div className="bg-orange-50/60 border border-orange-200/80 rounded-3xl p-5 text-center space-y-3">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-950 uppercase tracking-wide">
                  <FaQrcode className="text-orange-600" size={15} />
                  <span>Scan QR Code with Any UPI App</span>
                </div>

                {/* White Frame with Glowing QR */}
                <div className="bg-white p-3.5 rounded-2xl border-2 border-orange-300 shadow-md inline-block mx-auto">
                  <img
                    src={settings.qrCodeUrl}
                    alt="Payment QR Code"
                    className="w-52 h-52 object-contain rounded-xl mx-auto"
                  />
                </div>

                <p className="text-[11px] text-gray-500 font-semibold">
                  Google Pay, PhonePe, Paytm ya kisi bhi UPI app se scan karein
                </p>
              </div>
            ) : null}

            {/* UPI ID Display & Copy Box */}
            <div className="bg-white p-4 rounded-2xl border-2 border-orange-200 shadow-2xs space-y-2">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                Official UPI ID (Direct Transfer)
              </span>
              <div className="flex items-center justify-between gap-2 bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                <span className="text-xs sm:text-sm font-extrabold text-gray-900 font-mono select-all truncate">
                  {settings.upiId || 'sanwariyaboss@ybl'}
                </span>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="bg-[#f97316] hover:bg-orange-600 text-white font-bold text-[11px] px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
                >
                  {copied ? <FaCheckCircle size={12} /> : <FaCopy size={12} />}
                  <span>{copied ? 'Copied!' : 'Copy UPI'}</span>
                </button>
              </div>
            </div>

            {/* UTR / Transaction Reference ID Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-800 flex items-center gap-1">
                <FaHashtag size={11} className="text-orange-500" />
                <span>Enter 12-Digit UTR / Ref No. (Payment ke baad)</span>
              </label>

              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={12}
                  value={utrNumber}
                  onChange={handleUtrChange}
                  placeholder="Enter 12-digit UTR No. (Numbers only)"
                  className="w-full pl-4 pr-16 py-3.5 bg-white border-2 border-orange-200 rounded-2xl text-xs font-bold font-mono text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 shadow-2xs focus:ring-2 focus:ring-orange-200"
                />
                <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  utrNumber.length === 12
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                    : 'bg-gray-100 text-gray-400 border-gray-200'
                }`}>
                  {utrNumber.length}/12
                </span>
              </div>
              <p className="text-[10px] text-gray-500 font-medium px-1">
                Payment safalta-poorvak karne ke baad UPI app se 12-digit UTR number yahan enter karein.
              </p>
            </div>

            {/* Submit Manual Deposit Button */}
            <button
              type="button"
              disabled={loading || isSubmitted || utrNumber.length !== 12}
              onClick={handleManualDeposit}
              className={`w-full py-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
                utrNumber.length === 12 && !isSubmitted
                  ? 'bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white shadow-emerald-500/20 cursor-pointer'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <FaShieldAlt size={14} />
              <span>{loading || isSubmitted ? 'Submitting Request...' : `Submit Deposit Request (₹${Number(amount).toLocaleString('en-IN')})`}</span>
            </button>

            {/* Back to Step 1 Button */}
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full py-2.5 text-xs font-bold text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← Back to Amount Selection
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default UserDeposit;

