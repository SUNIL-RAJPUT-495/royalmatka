import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { IoClose } from 'react-icons/io5';
import { FaShieldAlt } from 'react-icons/fa';

export const WelcomePopup = () => {
  const { currentTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const isGreenTheme = currentTheme?.id?.includes('green') || currentTheme?.headerBgColor === '#447668';
  const themeColor = currentTheme?.headerBgColor || (isGreenTheme ? '#447668' : '#f95e07');

  useEffect(() => {
    // Show only once per browser session
    const hasShown = sessionStorage.getItem('welcome_popup_shown');
    if (!hasShown) {
      setIsOpen(true);
      sessionStorage.setItem('welcome_popup_shown', 'true');
    }
  }, []);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto select-none font-sans">
      {/* Scrollable Container Wrapper */}
      <div className="w-full max-w-[375px] max-h-[85vh] overflow-y-auto rounded-3xl bg-white shadow-2xl relative my-auto scrollbar-none">
        
        {/* 1. TOP GRADIENT HEADER */}
        <div 
          className="rounded-b-[40px] px-5 pt-8 pb-7 text-center text-white relative flex flex-col items-center justify-center shadow-md"
          style={{ backgroundColor: themeColor }}
        >
          {/* Close Icon Button */}
          <button
            type="button"
            onClick={handleClose}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer transition-all border border-white/10 absolute top-4 right-4 active:scale-95 shadow-2xs"
            title="Close"
          >
            <IoClose size={20} />
          </button>

          {/* Sub-banner */}
          <div className="text-[10px] tracking-widest font-extrabold text-white/80 uppercase">
            ✦ ELITE EXPERIENCE ✦
          </div>

          {/* Welcome Title */}
          <h2 className="text-xl font-extrabold tracking-tight uppercase mt-1">
            WELCOME TO
          </h2>

          {/* Brand Name (Italicized Golden Highlight) */}
          <h1 className="text-4xl font-black italic tracking-tight text-yellow-300 drop-shadow-md mt-1">
            Royal 1008
          </h1>

          {/* Trusted Badge */}
          <div className="bg-white/15 px-4 py-1.5 rounded-full border border-white/25 flex items-center gap-1.5 justify-center mt-3.5 shadow-2xs">
            <FaShieldAlt className="text-yellow-300" size={11} />
            <span className="text-[9px] font-extrabold tracking-wider text-white uppercase">
              INDIA'S #1 TRUSTED APP
            </span>
          </div>

          {/* Description */}
          <p className="text-white/90 text-xs font-medium max-w-[270px] mt-4 leading-relaxed">
            Play safely with trusted rates and transparent payout rules.
          </p>
        </div>

        {/* 2. STATS GRID (2x2 Boxes with Thick Dark Borders & Hover Wiggle) */}
        <div className="grid grid-cols-2 gap-3.5 px-5 pt-5.5">
          {/* Box 1: Min Deposit */}
          <div className="bg-white border-2 border-black rounded-[20px] py-4 px-2 text-center shadow-xs flex flex-col justify-center min-h-[80px] hover-wiggle hover:bg-emerald-50/65 cursor-pointer">
            <span className="text-[10px] font-black text-emerald-650 uppercase tracking-wider">
              MIN DEPOSIT
            </span>
            <span className="text-base font-black text-emerald-600 mt-1">
              ₹100
            </span>
          </div>

          {/* Box 2: Min Withdraw */}
          <div className="bg-white border-2 border-black rounded-[20px] py-4 px-2 text-center shadow-xs flex flex-col justify-center min-h-[80px] hover-wiggle hover:bg-blue-50/65 cursor-pointer">
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider">
              MIN WITHDRAW
            </span>
            <span className="text-base font-black text-blue-600 mt-1">
              ₹1000
            </span>
          </div>

          {/* Box 3: Min Bid Point */}
          <div className="bg-white border-2 border-black rounded-[20px] py-4 px-2 text-center shadow-xs flex flex-col justify-center min-h-[80px] hover-wiggle hover:bg-orange-50/65 cursor-pointer">
            <span className="text-[10px] font-black text-[#ea580c] uppercase tracking-wider">
              MIN BID POINT
            </span>
            <span className="text-base font-black text-[#f95e07] mt-1">
              ₹10
            </span>
          </div>

          {/* Box 4: Withdrawal Time */}
          <div className="bg-white border-2 border-black rounded-[20px] py-4 px-2 text-center shadow-xs flex flex-col justify-center min-h-[80px] hover-wiggle hover:bg-rose-50/65 cursor-pointer">
            <span className="text-[10px] font-black text-rose-500 uppercase tracking-wider">
              WITHDRAWAL
            </span>
            <span className="text-[12px] font-black text-rose-650 mt-1">
              6AM - 5PM
            </span>
          </div>
        </div>

        {/* 3. FEATURE PILLS */}
        <div className="flex items-center justify-between gap-1.5 px-5 pt-4">
          <span className="bg-orange-50/60 text-[#ea580c] text-[10px] font-extrabold py-1 rounded-full border border-orange-100/70 flex-1 text-center shadow-2xs">
            Fast support
          </span>
          <span className="bg-orange-50/60 text-[#ea580c] text-[10px] font-extrabold py-1 rounded-full border border-orange-100/70 flex-1 text-center shadow-2xs">
            Secure wallet
          </span>
          <span className="bg-orange-50/60 text-[#ea580c] text-[10px] font-extrabold py-1 rounded-full border border-orange-100/70 flex-1 text-center shadow-2xs">
            Instant updates
          </span>
        </div>

        {/* 4. LIVE PAYOUT RATES CARD */}
        <div className="bg-white rounded-3xl p-4 border border-gray-150 shadow-xs mx-5 mt-4.5 space-y-2.5">
          {/* Section Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs">📈</span>
              <h3 className="font-extrabold text-[10px] text-gray-900 tracking-wide">
                LIVE PAYOUT RATES
              </h3>
            </div>
            <span className="bg-gray-100 text-gray-500 text-[9px] font-bold px-2 py-0.5 rounded-md">
              10 Ka Rate
            </span>
          </div>

          {/* Rates List */}
          <div className="space-y-2">
            {[
              { label: 'SINGLE ANK', rate: '₹1 ka 10' },
              { label: 'JODI', rate: '₹1 ka 100' },
              { label: 'SINGLE PANNA', rate: '₹1 ka 160' },
              { label: 'DOUBLE PANNA', rate: '₹1 ka 320' },
              { label: 'TRIPLE PANNA', rate: '₹1 ka 700' },
              { label: 'HALF SANGAM', rate: '₹1 ka 1000' },
              { label: 'FULL SANGAM', rate: '₹1 ka 10000' },
            ].map((item, idx) => (
              <div 
                key={idx} 
                className={`bg-white rounded-xl border border-gray-100/80 p-2.5 flex items-center justify-between shadow-2xs transition-all duration-350 cursor-pointer ${
                  isGreenTheme 
                    ? 'hover:bg-emerald-50/30 hover:border-emerald-500/80' 
                    : 'hover:bg-orange-50/30 hover:border-orange-500/80'
                }`}
              >
                <span className="font-extrabold text-[9px] text-gray-700 tracking-wide uppercase">
                  {item.label}
                </span>
                <span className="font-extrabold text-xs text-emerald-600">
                  {item.rate}
                </span>
              </div>
            ))}
          </div>

          {/* Mini disclaimer */}
          <p className="text-[9px] text-gray-400 font-medium text-center leading-normal">
            Below rates are for quick reference. Please verify before placing bids.
          </p>
        </div>

        {/* 5. IMPORTANT NOTES BOX */}
        <div className="bg-emerald-50/40 rounded-2xl p-3.5 border border-emerald-100/60 mx-5 mt-4 text-left">
          <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider block mb-1.5">
            IMPORTANT NOTES
          </span>
          <div className="space-y-1">
            <p className="text-[10px] text-emerald-800 font-bold flex items-center gap-1.5">
              <span>•</span> KYC required for withdrawals.
            </p>
            <p className="text-[10px] text-emerald-800 font-bold flex items-center gap-1.5">
              <span>•</span> Play responsibly.
            </p>
          </div>
        </div>

        {/* 6. START PLAYING NOW ACTION BUTTON */}
        <div className="px-5 pt-4.5 pb-1">
          <button
            type="button"
            onClick={handleClose}
            style={{ backgroundColor: themeColor }}
            className="w-full text-white font-extrabold text-xs tracking-wider py-3.5 rounded-2xl shadow-md flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer uppercase"
          >
            <span>⭐ START PLAYING NOW</span>
            <span className="text-[10px]">▶</span>
          </button>
        </div>

        {/* 7. FOOTER BRAND BRANDING */}
        <div className="text-center px-5 pt-3.5 pb-5">
          <span className="text-[9px] font-extrabold text-gray-400 tracking-widest uppercase block">
            AUTHORIZED GAMING ENVIRONMENT
          </span>
          <p className="text-[10px] text-gray-500 font-bold mt-2">
            ⚡ Target your success with <span className="text-[#ea580c] font-black">Royal Matka</span> 🎯
          </p>
        </div>

      </div>
    </div>
  );
};

export default WelcomePopup;
