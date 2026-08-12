import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { FaArrowLeft, FaShareAlt } from 'react-icons/fa';
import { IoNotificationsOutline } from 'react-icons/io5';
import { HiOutlineSparkles } from 'react-icons/hi';

export const UserGameRates = () => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();

  const isGreenTheme = currentTheme?.id?.includes('green') || currentTheme?.headerBgColor === '#447668';
  const themeHeaderBg = currentTheme?.headerBgColor || (isGreenTheme ? '#447668' : '#ea580c');
  const accentBorderColor = isGreenTheme ? '#10b981' : '#f97316';
  const badgeBg = isGreenTheme ? 'bg-[#dcfce7] text-[#16a34a] border-emerald-200/80' : 'bg-[#ffedd5] text-[#ea580c] border-orange-200/80';
  const rateText = isGreenTheme ? 'text-[#16a34a]' : 'text-[#ea580c]';

  const MAIN_RATES = [
    { title: 'Single Digit (Ank)', subtitle: 'Single digit number (0-9)', rate: '10 ka 100', ratio: '1 : 10' },
    { title: 'Jodi Digit', subtitle: 'Two digit combination (00-99)', rate: '10 ka 1000', ratio: '1 : 100' },
    { title: 'Single Pana', subtitle: 'Three digit unique number', rate: '10 ka 1600', ratio: '1 : 160' },
    { title: 'Double Pana', subtitle: 'Three digit with two same numbers', rate: '10 ka 3200', ratio: '1 : 320' },
    { title: 'Triple Pana', subtitle: 'Three digit all same numbers (e.g. 111)', rate: '10 ka 10000', ratio: '1 : 1000' },
    { title: 'Half Sangam', subtitle: 'Open Pana + Close Ank or vice versa', rate: '10 ka 10000', ratio: '1 : 1000' },
    { title: 'Full Sangam', subtitle: 'Open Pana + Close Pana combination', rate: '10 ka 100000', ratio: '1 : 10000' }
  ];

  const GALI_RATES = [
    { title: 'Left Digit (Harup)', subtitle: 'Single left open digit', rate: '10 ka 100', ratio: '1 : 10' },
    { title: 'Right Digit (Harup)', subtitle: 'Single right close digit', rate: '10 ka 100', ratio: '1 : 10' },
    { title: 'Jodi Game', subtitle: 'Two digit jodi (00-99)', rate: '10 ka 950', ratio: '1 : 95' }
  ];

  const STARLINE_RATES = [
    { title: 'Single Digit', subtitle: 'Hourly single digit', rate: '10 ka 100', ratio: '1 : 10' },
    { title: 'Single Pana', subtitle: 'Hourly single panna', rate: '10 ka 1600', ratio: '1 : 160' },
    { title: 'Double Pana', subtitle: 'Hourly double panna', rate: '10 ka 3200', ratio: '1 : 320' },
    { title: 'Triple Pana', subtitle: 'Hourly triple panna', rate: '10 ka 10000', ratio: '1 : 1000' }
  ];

  return (
    <div className="w-full min-h-screen bg-[#f5f6fa] select-none font-sans flex flex-col pb-24">
      {/* 1. TOP HEADER */}
      <div
        className="w-full text-white shadow-xs transition-colors duration-300 shrink-0"
        style={{ backgroundColor: themeHeaderBg }}
      >
        <div className="px-4 pt-4 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all cursor-pointer active:scale-95 border border-white/20 shadow-xs shrink-0"
              title="Go Back"
            >
              <FaArrowLeft size={15} />
            </button>

            <div>
              <div className="flex items-center gap-1.5 text-base font-bold tracking-tight text-white">
                <span>Game Rates</span>
                <HiOutlineSparkles size={16} className="text-yellow-300" />
              </div>
              <p className="text-[11px] text-white/80 font-normal">✨ Latest market payout rates</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
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

            <button
              type="button"
              onClick={() => navigate('/notifications')}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all cursor-pointer active:scale-95 border border-white/20 shadow-xs shrink-0"
              title="Notifications"
            >
              <IoNotificationsOutline size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. BODY CONTENT */}
      <div className="px-4 pt-4 space-y-4">
        {/* Category 1: Main Markets */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-base">🏆</span>
            <h2 className="text-[15px] font-bold text-gray-900 tracking-tight">Main Market Rates</h2>
          </div>

          <div className="space-y-2">
            {MAIN_RATES.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-3.5 shadow-xs border-l-[4px] border border-gray-100 flex items-center justify-between transition-all hover:shadow-sm select-none"
                style={{ borderLeftColor: accentBorderColor }}
              >
                <div>
                  <h3 className="text-xs sm:text-[13px] font-bold text-gray-900 leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-gray-500 font-medium mt-0.5">{item.subtitle}</p>
                </div>

                <div className="text-right shrink-0 ml-3">
                  <span className={`text-xs sm:text-[13px] font-bold tracking-tight px-2.5 py-1 rounded-xl border ${badgeBg}`}>
                    {item.rate}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category 2: Jackpot Gali Markets */}
        <div className="space-y-2.5 pt-2">
          <div className="flex items-center gap-1.5">
            <span className="text-base">⚡</span>
            <h2 className="text-[15px] font-bold text-gray-900 tracking-tight">Jackpot Gali Rates</h2>
          </div>

          <div className="space-y-2">
            {GALI_RATES.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-3.5 shadow-xs border-l-[4px] border border-gray-100 flex items-center justify-between transition-all hover:shadow-sm select-none"
                style={{ borderLeftColor: accentBorderColor }}
              >
                <div>
                  <h3 className="text-xs sm:text-[13px] font-bold text-gray-900 leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-gray-500 font-medium mt-0.5">{item.subtitle}</p>
                </div>

                <div className="text-right shrink-0 ml-3">
                  <span className={`text-xs sm:text-[13px] font-bold tracking-tight px-2.5 py-1 rounded-xl border ${badgeBg}`}>
                    {item.rate}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category 3: StarLine Markets */}
        <div className="space-y-2.5 pt-2">
          <div className="flex items-center gap-1.5">
            <span className="text-base">⭐</span>
            <h2 className="text-[15px] font-bold text-gray-900 tracking-tight">StarLine Rates</h2>
          </div>

          <div className="space-y-2">
            {STARLINE_RATES.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-3.5 shadow-xs border-l-[4px] border border-gray-100 flex items-center justify-between transition-all hover:shadow-sm select-none"
                style={{ borderLeftColor: accentBorderColor }}
              >
                <div>
                  <h3 className="text-xs sm:text-[13px] font-bold text-gray-900 leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-gray-500 font-medium mt-0.5">{item.subtitle}</p>
                </div>

                <div className="text-right shrink-0 ml-3">
                  <span className={`text-xs sm:text-[13px] font-bold tracking-tight px-2.5 py-1 rounded-xl border ${badgeBg}`}>
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
