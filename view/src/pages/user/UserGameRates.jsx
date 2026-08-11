import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { FaArrowLeft, FaTrophy, FaShareAlt, FaBookmark } from 'react-icons/fa';

export const UserGameRates = () => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();

  const rates = [
    { title: 'Single ank', subtitle: 'Single digit betting', rate: '10 ka 100' },
    { title: 'Jodi', subtitle: 'Two digit combination', rate: '10 ka 1000' },
    { title: 'Single Panna', subtitle: 'Three digit single panna', rate: '10 ka 1600' },
    { title: 'Double Panna', subtitle: 'Three digit double panna', rate: '10 ka 3200' },
    { title: 'Triple Panna', subtitle: 'Three digit triple panna', rate: '10 ka 10000' }
  ];

  return (
    <div className="w-full space-y-4 select-none pb-8 font-sans">
      {/* 1. TOP HEADER */}
      <div
        className="-mx-4 -mt-3 p-4 pt-4 pb-5 rounded-b-[28px] text-white shadow-md transition-colors duration-300"
        style={{ backgroundColor: currentTheme.headerBgColor }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-all cursor-pointer active:scale-95 border border-white/20 shadow-xs shrink-0"
            >
              <FaArrowLeft size={14} />
            </button>
            <div>
              <div className="flex items-center gap-2 text-base font-bold tracking-tight text-white">
                <FaTrophy size={16} className="text-yellow-300" />
                <span>Game Rates</span>
              </div>
              <p className="text-xs text-white/80 font-normal mt-0.5">✨ Latest payouts</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: 'Royal1008 Game Rates', url: window.location.href });
              }
            }}
            className="w-10 h-10 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-white cursor-pointer hover:bg-white/25 transition-colors"
          >
            <FaShareAlt size={14} />
          </button>
        </div>
      </div>

      {/* 2. MAIN PANA CARD (Exact match with Screenshot 4) */}
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-2xs space-y-3.5">
        {/* Card Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900">Main Pana</h3>
          <FaBookmark className="text-gray-400" size={14} />
        </div>

        {/* 5 Green Rate Boxes */}
        <div className="space-y-2.5">
          {rates.map((item, index) => (
            <div
              key={index}
              className="bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-150/70 rounded-2xl p-3.5 flex items-center justify-between transition-colors"
            >
              <div>
                <h4 className="text-xs font-bold text-gray-900 leading-tight">{item.title}</h4>
                <p className="text-[10px] text-gray-500 font-normal mt-0.5">{item.subtitle}</p>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-emerald-700 tracking-tight">
                  {item.rate}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserGameRates;
