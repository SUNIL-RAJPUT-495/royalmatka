import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { FaArrowLeft, FaTrophy, FaLightbulb, FaGamepad, FaCalendarAlt, FaChevronDown } from 'react-icons/fa';
import { IoInformationCircleOutline, IoFilter } from 'react-icons/io5';

export const UserWinningTips = () => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();

  const [selectedMarket, setSelectedMarket] = useState('All Markets');
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  });

  const [isMarketDropdownOpen, setIsMarketDropdownOpen] = useState(false);

  const marketOptions = [
    'All Markets',
    'SITA MORNING',
    'KARNATAKA DAY',
    'MILAN MORNING',
    'TIME BAZAR',
    'MADHUR DAY',
    'KALYAN',
    'RAJDHANI NIGHT',
    'MAIN BAZAR'
  ];

  return (
    <div className="w-full select-none pb-8 font-sans">
      {/* 1. TOP ORANGE HEADER */}
      <div
        className="p-4 pt-4 pb-5 rounded-b-[28px] text-white shadow-md transition-colors duration-300 mb-4 sticky top-0 z-30"
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
                <FaLightbulb size={16} className="text-yellow-300" />
                <span>Winning Tips</span>
              </div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-white/80 mt-0.5">
                ELITE PREDICTIONS
              </p>
            </div>
          </div>

          <div className="w-10 h-10 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-yellow-300">
            <FaTrophy size={16} />
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* 2. FILTER CARD */}
        <div className="bg-white rounded-3xl p-4.5 border border-gray-100 shadow-2xs space-y-3">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            <IoFilter className="text-amber-500" size={13} />
            <span>FILTER BY MARKET (OPTIONAL) & DATE</span>
          </div>

          {/* Market Selector */}
          <div className="relative">
            <div
              onClick={() => setIsMarketDropdownOpen(!isMarketDropdownOpen)}
              className="w-full p-3.5 bg-gray-50/80 hover:bg-gray-50 rounded-2xl border border-gray-150 flex items-center justify-between cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3 text-xs font-semibold text-gray-900">
                <FaGamepad className="text-amber-500" size={15} />
                <span>{selectedMarket}</span>
              </div>
              <FaChevronDown size={12} className="text-gray-400" />
            </div>

            {/* Dropdown Menu */}
            {isMarketDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl border border-gray-150 shadow-xl z-20 overflow-hidden max-h-48 overflow-y-auto divide-y divide-gray-50">
                {marketOptions.map((market, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedMarket(market);
                      setIsMarketDropdownOpen(false);
                    }}
                    className="p-3 text-xs font-semibold text-gray-800 hover:bg-orange-50 hover:text-[#f97316] cursor-pointer transition-colors"
                  >
                    {market}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Date Selector */}
          <div className="w-full p-3.5 bg-gray-50/80 rounded-2xl border border-gray-150 flex items-center gap-3">
            <FaCalendarAlt className="text-amber-500" size={14} />
            <span className="text-xs font-semibold text-gray-900">{selectedDate}</span>
          </div>
        </div>

        {/* 3. NO TIPS FOUND CARD (Exact dashed border state) */}
        <div className="bg-white rounded-3xl p-10 border-2 border-dashed border-gray-200/90 flex flex-col items-center justify-center text-center shadow-2xs">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-300 mb-3">
            <IoInformationCircleOutline size={30} />
          </div>
          <h3 className="text-base font-bold text-gray-900">No Tips Found</h3>
          <p className="text-xs text-gray-400 font-normal mt-1">Try another date.</p>
        </div>
      </div>
    </div>
  );
};

export default UserWinningTips;
