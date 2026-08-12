import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { FaArrowLeft, FaTrophy, FaShareAlt } from 'react-icons/fa';
import { IoBookmarkOutline, IoSparkles } from 'react-icons/io5';

export const UserGameRates = () => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();

  // Dynamic Theme Colors
  const isGreenTheme = currentTheme?.id?.includes('green') || currentTheme?.headerBgColor === '#447668';
  const themeColor = currentTheme?.headerBgColor || (isGreenTheme ? '#447668' : '#f95e07');
  
  // Rate items theme-matched background, border, and text color
  const rateBoxClass = isGreenTheme
    ? 'bg-[#ecfdf5] border-[#a7f3d0]'
    : 'bg-[#fff7ed] border-[#fed7aa]';
  const rateTextClass = isGreenTheme ? 'text-[#047857]' : 'text-[#ea580c]';

  // Backend state preparation (fallback to initial dummy data)
  const [loading, setLoading] = useState(false);
  const [rates, setRates] = useState({
    featured: {
      title: 'Single ank',
      subtitle: 'Single digit betting',
      gameType: 'Single ank',
      rate: '1 ka 10'
    },
    mainPana: [
      { title: 'Single ank', subtitle: 'Single digit betting', rate: '1 ka 10' },
      { title: 'Jodi', subtitle: 'Two digit combination', rate: '1 ka 100' },
      { title: 'Single Panna', subtitle: 'Three digit single panna', rate: '1 ka 160' },
      { title: 'Double Panna', subtitle: 'Three digit double panna', rate: '1 ka 320' },
      { title: 'Triple Panna', subtitle: 'Three digit triple panna', rate: '1 ka 700' },
      { title: 'Half Sangam', subtitle: 'Half sangam combination', rate: '1 ka 1000' },
      { title: 'Full Sangam', subtitle: 'Full sangam - highest payout!', rate: '1 ka 10000' }
    ],
    starline: [
      { title: 'Single ank', subtitle: 'Single digit betting', rate: '1 ka 10' },
      { title: 'Single Panna', subtitle: 'Three digit single panna', rate: '1 ka 160' },
      { title: 'Double Panna', subtitle: 'Three digit double panna', rate: '1 ka 320' },
      { title: 'Triple Panna', subtitle: 'Three digit triple panna', rate: '1 ka 800' }
    ],
    gali: [
      { title: 'Single ank', subtitle: 'Single digit betting', rate: '1 ka 10' },
      { title: 'Jodi', subtitle: 'Two digit combination', rate: '1 ka 100' }
    ],
    jackpot: [
      { title: 'Jodi', subtitle: 'Two digit combination', rate: '1 ka 100' }
    ]
  });

  useEffect(() => {
    // Ready for future backend API fetch:
    // e.g. api.get('/game-rates').then(res => setRates(res.data)).catch(...)
  }, []);

  return (
    <div className="w-full min-h-screen bg-[#f5f6fa] select-none font-sans flex flex-col pb-28">
      {/* 1. TOP HEADER */}
      <div
        className="w-full text-white shadow-md rounded-b-[28px] transition-colors duration-300 shrink-0 mb-1 sticky top-0 z-30"
        style={{ backgroundColor: themeColor }}
      >
        <div className="px-4 pt-4 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all cursor-pointer active:scale-95 border border-white/20 shadow-xs shrink-0"
              title="Go Back"
            >
              <FaArrowLeft size={14} />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white border border-white/20 shrink-0">
                <FaTrophy size={16} />
              </div>
              <div>
                <h1 className="text-base sm:text-[17px] font-bold tracking-tight text-white leading-tight">
                  Game Rates
                </h1>
                <p className="text-[11px] text-white/90 font-normal mt-0.5">
                  ✨ Latest payouts
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: 'Game Rates', url: window.location.href });
              }
            }}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all cursor-pointer active:scale-95 border border-white/20 shadow-xs shrink-0"
            title="Share"
          >
            <FaShareAlt size={14} />
          </button>
        </div>
      </div>

      {/* 2. BODY CONTENT */}
      <div className="px-4 pt-4 space-y-4">
        {/* TOP FEATURED GAME CARD */}
        <div
          className="rounded-3xl p-5 text-white shadow-md shadow-black/5 transition-colors duration-300"
          style={{ backgroundColor: themeColor }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-white">
              <span className="text-yellow-300">⭐</span>
              <span>Featured Game</span>
            </div>
            <IoSparkles className="text-yellow-300" size={16} />
          </div>

          <div className="mt-2.5">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {rates.featured.title}
            </h2>
            <p className="text-xs text-white/90 font-normal mt-0.5">
              {rates.featured.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            {/* Box 1: Game Type */}
            <div className="bg-white/20 backdrop-blur-xs rounded-2xl p-3.5 border border-white/20 shadow-2xs">
              <span className="text-[10px] sm:text-[11px] text-white/80 font-medium block">
                Game Type
              </span>
              <span className="text-xs sm:text-sm font-bold text-white block mt-0.5">
                {rates.featured.gameType}
              </span>
            </div>

            {/* Box 2: Game Rate */}
            <div className="bg-white/20 backdrop-blur-xs rounded-2xl p-3.5 border border-white/20 shadow-2xs">
              <span className="text-[10px] sm:text-[11px] text-white/80 font-medium block">
                Game Rate
              </span>
              <span className="text-xs sm:text-base font-bold text-white block mt-0.5">
                {rates.featured.rate}
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 1: Main Pana */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-100/90 shadow-md shadow-black/5 space-y-3">
          <div className="flex items-center justify-between pb-0.5">
            <h3 className="text-sm font-bold text-gray-900">Main Pana</h3>
            <IoBookmarkOutline className="text-gray-400" size={16} />
          </div>

          <div className="space-y-2.5">
            {rates.mainPana.map((item, index) => (
              <div
                key={index}
                className={`${rateBoxClass} border rounded-2xl p-3 sm:p-3.5 flex items-center justify-between shadow-2xs hover:shadow-xs transition-all`}
              >
                <div>
                  <h4 className="text-xs sm:text-[13px] font-bold text-gray-900 leading-tight">
                    {item.title}
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-gray-500 font-normal mt-0.5">
                    {item.subtitle}
                  </p>
                </div>

                <div className="text-right shrink-0 ml-2">
                  <span className={`text-xs sm:text-[13px] font-bold tracking-tight ${rateTextClass}`}>
                    {item.rate}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 2: Starline */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-100/90 shadow-md shadow-black/5 space-y-3">
          <div className="flex items-center justify-between pb-0.5">
            <h3 className="text-sm font-bold text-gray-900">Starline</h3>
            <IoBookmarkOutline className="text-gray-400" size={16} />
          </div>

          <div className="space-y-2.5">
            {rates.starline.map((item, index) => (
              <div
                key={index}
                className={`${rateBoxClass} border rounded-2xl p-3 sm:p-3.5 flex items-center justify-between shadow-2xs hover:shadow-xs transition-all`}
              >
                <div>
                  <h4 className="text-xs sm:text-[13px] font-bold text-gray-900 leading-tight">
                    {item.title}
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-gray-500 font-normal mt-0.5">
                    {item.subtitle}
                  </p>
                </div>

                <div className="text-right shrink-0 ml-2">
                  <span className={`text-xs sm:text-[13px] font-bold tracking-tight ${rateTextClass}`}>
                    {item.rate}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 3: Gali */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-100/90 shadow-md shadow-black/5 space-y-3">
          <div className="flex items-center justify-between pb-0.5">
            <h3 className="text-sm font-bold text-gray-900">Gali</h3>
            <IoBookmarkOutline className="text-gray-400" size={16} />
          </div>

          <div className="space-y-2.5">
            {rates.gali.map((item, index) => (
              <div
                key={index}
                className={`${rateBoxClass} border rounded-2xl p-3 sm:p-3.5 flex items-center justify-between shadow-2xs hover:shadow-xs transition-all`}
              >
                <div>
                  <h4 className="text-xs sm:text-[13px] font-bold text-gray-900 leading-tight">
                    {item.title}
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-gray-500 font-normal mt-0.5">
                    {item.subtitle}
                  </p>
                </div>

                <div className="text-right shrink-0 ml-2">
                  <span className={`text-xs sm:text-[13px] font-bold tracking-tight ${rateTextClass}`}>
                    {item.rate}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 4: Jackpot */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-100/90 shadow-md shadow-black/5 space-y-3">
          <div className="flex items-center justify-between pb-0.5">
            <h3 className="text-sm font-bold text-gray-900">Jackpot</h3>
            <IoBookmarkOutline className="text-gray-400" size={16} />
          </div>

          <div className="space-y-2.5">
            {rates.jackpot.map((item, index) => (
              <div
                key={index}
                className={`${rateBoxClass} border rounded-2xl p-3 sm:p-3.5 flex items-center justify-between shadow-2xs hover:shadow-xs transition-all`}
              >
                <div>
                  <h4 className="text-xs sm:text-[13px] font-bold text-gray-900 leading-tight">
                    {item.title}
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-gray-500 font-normal mt-0.5">
                    {item.subtitle}
                  </p>
                </div>

                <div className="text-right shrink-0 ml-2">
                  <span className={`text-xs sm:text-[13px] font-bold tracking-tight ${rateTextClass}`}>
                    {item.rate}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserGameRates;
