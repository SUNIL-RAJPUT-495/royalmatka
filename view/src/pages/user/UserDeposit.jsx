import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { FaArrowLeft, FaShieldAlt, FaInfoCircle, FaCopy, FaCheckCircle, FaQrcode, FaHashtag } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import Axios from '../../utils/axios';
import SummaryApi from '../../common/SummerAPI';

export const UserDeposit = () => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();

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
      try {
        const res = await Axios({
          url: SummaryApi.getPaymentSettings.url,
          method: SummaryApi.getPaymentSettings.method
        });
        if (res.data?.settings) {
          setSettings(prev => ({ ...prev, ...res.data.settings }));
        }
      } catch (err) {
        console.warn('Using default payment settings');
      }

      try {
        const txnRes = await Axios({
          url: SummaryApi.getTransactionSettings.url,
          method: SummaryApi.getTransactionSettings.method
        });
        if (txnRes.data?.data?.minDeposit) {
          setSettings(prev => ({ ...prev, minAmount: Number(txnRes.data.data.minDeposit) }));
        }
      } catch (err) {
        console.warn('Using default transaction settings');
      }
    };
    fetchSettings();
  }, []);

  const numAmount = Number(amount);
  const minAmt = settings.minAmount || 100;
  const maxAmt = settings.maxAmount || 50000;
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

  // IMB Gateway Payment Handler
  const handleIMBPayment = async () => {
    if (loading || isSubmitted) return;

    if (!isValidAmount) {
      toast.error(`Please enter an amount between ₹${minAmt} and ₹${maxAmt.toLocaleString()}`);
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
    // 1. Strict guard against duplicate requests
    if (loading || isSubmitted) return;

    if (!isValidAmount) {
      toast.error(`Please enter an amount between ₹${minAmt} and ₹${maxAmt.toLocaleString()}`);
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

  return (
    <div className="w-full select-none pb-8 font-sans relative">
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

      <div className="px-4 space-y-4">
        {/* 2. MAIN CARD */}
        <div className="bg-white rounded-3xl p-5 border border-gray-150 shadow-2xs space-y-4">
          
          {/* Green Notice Banner */}
          <div className="bg-emerald-50/70 border-l-[4px] border-l-emerald-500 rounded-2xl p-4 space-y-1">
            <h3 className="text-emerald-800 font-bold text-sm leading-tight">Add Funds to Wallet</h3>
            <div className="text-emerald-800 font-bold text-xs uppercase tracking-wide">
              MINIMUM DEPOSIT ₹{minAmt}
            </div>
            <p className="text-emerald-700 text-xs font-medium">
              {settings.activeFundSystem === 'IMB'
                ? 'पेमेंट पूरा होने पर तुरंत आपके वॉलेट में ऑटो-क्रेडिट हो जाएगी।'
                : 'QR स्कैन या UPI पर पेमेंट करने के बाद UTR नंबर डालें। Admin सत्यापन के बाद क्रेडिट होगा।'}
            </p>
          </div>

          {/* Quick Amount Preset Buttons at the Top */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider block">
              ⚡ Select Quick Deposit Amount
            </span>
            <div className="grid grid-cols-3 gap-2">
              {presetAmounts.map((preset) => {
                const isSelected = numAmount === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset.toString())}
                    className={`py-2.5 px-2 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-orange-500 text-white border-orange-600 shadow-md scale-[1.02]'
                        : 'bg-orange-50/80 hover:bg-orange-100/80 border-orange-200 text-orange-900 shadow-2xs'
                    }`}
                  >
                    + ₹{preset.toLocaleString()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1.5">
              Or Enter Custom Deposit Amount
            </label>
            <div className="border-2 border-[#f97316] rounded-2xl p-2.5 flex items-center gap-3 bg-white shadow-2xs">
              <div className="w-9 h-9 rounded-full bg-[#f97316] text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                ₹
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Enter Amount (min ₹${minAmt})`}
                className="w-full text-sm font-semibold text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent"
              />
            </div>

            {/* Min & Max Limit Labels */}
            <div className="text-xs font-semibold text-gray-400 flex items-center gap-1 mt-1.5 px-1">
              <span>Min:</span>
              <span className="text-[#f97316] font-bold">₹{minAmt}</span>
              <span className="mx-1">•</span>
              <span>Max:</span>
              <span className="text-[#f97316] font-bold">₹{maxAmt.toLocaleString()}</span>
            </div>
          </div>

          {/* MANUAL QR / UPI SECTION (Displayed when activeFundSystem === 'Manual') */}
          {settings.activeFundSystem === 'Manual' && (
            <div className="bg-orange-50/50 border border-orange-200 rounded-3xl p-4 space-y-4">
              
              {/* QR Scanner Display */}
              {settings.qrCodeUrl ? (
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-900">
                    <FaQrcode className="text-orange-500" size={14} />
                    <span>Scan QR Code to Pay</span>
                  </div>
                  <div className="bg-white p-3 rounded-2xl border border-orange-200 shadow-sm inline-block mx-auto">
                    <img
                      src={settings.qrCodeUrl}
                      alt="Payment QR Code"
                      className="w-48 h-48 object-contain rounded-xl mx-auto"
                    />
                  </div>
                </div>
              ) : null}

              {/* UPI ID Display & Copy Box */}
              <div className="bg-white p-3.5 rounded-2xl border border-orange-200 shadow-2xs space-y-1.5">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Official UPI ID</span>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-gray-900 font-mono">
                    {settings.upiId || 'sanwariyaboss@ybl'}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                  >
                    {copied ? <FaCheckCircle size={12} /> : <FaCopy size={12} />}
                    <span>{copied ? 'Copied!' : 'Copy UPI'}</span>
                  </button>
                </div>
              </div>

              {/* UTR / Reference Transaction ID Input */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5 flex items-center gap-1">
                  <FaHashtag size={11} className="text-orange-500" />
                  <span>Enter UTR / Transaction Reference No.</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={12}
                    value={utrNumber}
                    onChange={handleUtrChange}
                    placeholder="Enter 12-digit UTR No. (Numbers only)"
                    className="w-full pl-4 pr-16 py-3 bg-white border border-gray-200 rounded-2xl text-xs font-bold font-mono text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 shadow-2xs"
                  />
                  <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    utrNumber.length === 12
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                      : 'bg-gray-100 text-gray-400 border-gray-200'
                  }`}>
                    {utrNumber.length}/12
                  </span>
                </div>
                <p className="text-[10px] text-gray-500 font-medium mt-1 px-1">
                  Payment complete karne ke baad app se 12-digit numeric UTR/Ref No. yahan daalein.
                </p>
              </div>

              {/* Submit Manual Deposit Button */}
              <button
                type="button"
                disabled={loading || isSubmitted || !isValidAmount || utrNumber.length !== 12}
                onClick={handleManualDeposit}
                className={`w-full py-3.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  isValidAmount && utrNumber.length === 12 && !isSubmitted
                    ? 'bg-[#f97316] hover:bg-orange-600 active:scale-98 text-white shadow-md cursor-pointer'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <FaShieldAlt size={13} />
                <span>{loading || isSubmitted ? 'Submitting Request...' : 'Submit Deposit Request'}</span>
              </button>
            </div>
          )}

          {/* IMB GATEWAY BUTTON (Displayed when activeFundSystem === 'IMB') */}
          {settings.activeFundSystem === 'IMB' && (
            <button
              type="button"
              disabled={loading || isSubmitted || !isValidAmount}
              onClick={handleIMBPayment}
              className={`w-full py-3.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                isValidAmount && !isSubmitted
                  ? 'bg-[#f97316] hover:bg-orange-600 active:scale-98 text-white shadow-md cursor-pointer'
                  : 'bg-gray-150 text-gray-400 cursor-not-allowed'
              }`}
            >
              <FaShieldAlt size={13} />
              <span>{loading ? 'Initiating Gateway...' : 'Pay via UPI Gateway (Instant)'}</span>
            </button>
          )}

          {/* Notice Alert */}
          <div className="bg-blue-50/70 border-l-[4px] border-l-blue-500 rounded-2xl p-3.5 flex items-start gap-2.5">
            <FaInfoCircle size={15} className="text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-900 leading-tight font-medium">
              <span className="font-bold">Notice:</span> Payment complete karne ke baad wallet mein credit kar diya jayega. For help, contact support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDeposit;
