import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { FaArrowLeft, FaPlay, FaChartLine } from 'react-icons/fa';
import { IoNotificationsOutline, IoStarOutline, IoTimeOutline, IoGridOutline, IoFlashSharp } from 'react-icons/io5';

const DEFAULT_JACKPOT_MARKETS = [
  { id: 'jp-1', name: '10:30 AM', result: '* *', time: '10:30 AM', status: 'closed', is_closed: true },
  { id: 'jp-2', name: '11:30 AM', result: '* *', time: '11:30 AM', status: 'closed', is_closed: true },
  { id: 'jp-3', name: '12:30 PM', result: '* *', time: '12:30 PM', status: 'closed', is_closed: true },
  { id: 'jp-4', name: '1:30 PM', result: '* *', time: '1:30 PM', status: 'closed', is_closed: true },
  { id: 'jp-5', name: '2:30 PM', result: '* *', time: '2:30 PM', status: 'closed', is_closed: true },
  { id: 'jp-6', name: '3:30 PM', result: '* *', time: '3:30 PM', status: 'running', is_closed: false },
  { id: 'jp-7', name: '4:30 PM', result: '* *', time: '4:30 PM', status: 'running', is_closed: false },
  { id: 'jp-8', name: '5:30 PM', result: '* *', time: '5:30 PM', status: 'running', is_closed: false },
  { id: 'jp-9', name: '6:30 PM', result: '* *', time: '6:30 PM', status: 'running', is_closed: false },
  { id: 'jp-10', name: '7:30 PM', result: '* *', time: '7:30 PM', status: 'running', is_closed: false },
  { id: 'jp-11', name: '8:30 PM', result: '* *', time: '8:30 PM', status: 'running', is_closed: false },
  { id: 'jp-12', name: '9:30 PM', result: '* *', time: '9:30 PM', status: 'running', is_closed: false },
  { id: 'jp-13', name: '10:30 PM', result: '* *', time: '10:30 PM', status: 'running', is_closed: false }
];

export const UserJackpot = () => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  const [markets] = useState(DEFAULT_JACKPOT_MARKETS);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handlePlayMarket = (market) => {
    if (market.status === 'closed' || market.is_closed) return;
    navigate(`/play-game/${encodeURIComponent('JACKPOT ' + market.name)}`);
  };

  const isGreenTheme = currentTheme?.id?.includes('green') || currentTheme?.headerBgColor === '#447668';
  const themeHeaderBg = currentTheme?.headerBgColor || (isGreenTheme ? '#447668' : '#ea580c');
  const accentBorderColor = isGreenTheme ? '#10b981' : '#f97316';
  const resultTextColor = isGreenTheme ? 'text-[#00c853]' : 'text-[#ea580c]';
  const runningBadgeClass = isGreenTheme
    ? 'bg-[#dcfce7] text-[#16a34a] border-emerald-100'
    : 'bg-[#ffedd5] text-[#ea580c] border-orange-100';
  const playBtnClass = isGreenTheme
    ? 'bg-[#dcfce7] hover:bg-emerald-100 text-[#16a34a] border-emerald-200/80'
    : 'bg-orange-50 hover:bg-orange-100 text-[#ea580c] border-orange-200/80';

  return (
    <div className="w-full min-h-screen bg-[#f5f6fa] select-none font-sans flex flex-col pb-24">
      {/* 1. TOP HEADER */}
      <div
        className="w-full text-white shadow-xs transition-colors duration-300 shrink-0 sticky top-0 z-30"
        style={{ backgroundColor: themeHeaderBg }}
      >
        {/* Top Action Bar (Back Arrow + Notification Bell) */}
        <div className="px-4 pt-4 pb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all cursor-pointer active:scale-95 border border-white/20 shadow-xs shrink-0"
            title="Go Back"
          >
            <FaArrowLeft size={15} />
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

        {/* 3 Horizontal Nav Tabs */}
        <div className="px-4 pb-5">
          <div className="grid grid-cols-3 gap-2.5">
            {/* TAB 1: StarLine */}
            <div
              onClick={() => navigate('/starline')}
              className="bg-white/95 hover:bg-white active:scale-95 rounded-2xl py-3.5 px-2 flex flex-col items-center justify-center gap-1 shadow-sm cursor-pointer transition-all border border-white/60"
            >
              <div className="w-8 h-8 rounded-xl bg-[#f5eeff] flex items-center justify-center text-[#9333ea] shrink-0 shadow-2xs">
                <IoStarOutline size={18} className="text-[#9333ea]" />
              </div>
              <span className="text-xs font-bold text-gray-800 tracking-tight">
                StarLine
              </span>
            </div>

            {/* TAB 2: Gali (Navigates to /JackpotGali) */}
            <div
              onClick={() => navigate('/JackpotGali')}
              className="bg-white/95 hover:bg-white active:scale-95 rounded-2xl py-3.5 px-2 flex flex-col items-center justify-center gap-1 shadow-sm cursor-pointer transition-all border border-white/60"
            >
              <div className="w-8 h-8 rounded-xl bg-[#eff6ff] flex items-center justify-center text-[#3b82f6] shrink-0 shadow-2xs">
                <IoFlashSharp size={17} className="text-[#3b82f6]" />
              </div>
              <span className="text-xs font-bold text-gray-800 tracking-tight">
                Gali
              </span>
            </div>

            {/* TAB 3: Main (Navigates to Home) */}
            <div
              onClick={() => navigate('/')}
              className="bg-white/95 hover:bg-white active:scale-95 rounded-2xl py-3.5 px-2 flex flex-col items-center justify-center gap-1 shadow-sm cursor-pointer transition-all border border-white/60"
            >
              <div className="w-8 h-8 rounded-xl bg-[#ecfdf5] flex items-center justify-center text-[#10b981] shrink-0 shadow-2xs">
                <IoGridOutline size={18} className="text-[#10b981]" />
              </div>
              <span className="text-xs font-bold text-gray-800 tracking-tight">
                Main
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. BODY CONTENT */}
      <div className="px-4 pt-4 space-y-3.5">
        {/* Section Heading with Trophy */}
        <div className="flex items-center gap-2">
          <span className="text-lg leading-none select-none">🏆</span>
          <h1 className="text-[17px] font-bold text-gray-900 tracking-tight">
            Jackpot Markets
          </h1>
        </div>

        {/* 2-Column Grid of Jackpot Markets */}
        <div className="grid grid-cols-2 gap-3 sm:gap-3.5">
          {markets.map((market) => {
            const isClosed = market.status === 'closed' || market.is_closed;

            return (
              <div
                key={market.id || market.name}
                onClick={() => !isClosed && handlePlayMarket(market)}
                className={`bg-white rounded-2xl p-3.5 shadow-xs border-l-[4px] flex flex-col justify-between relative transition-all duration-200 select-none border border-gray-100 ${
                  isClosed
                    ? 'opacity-95'
                    : 'cursor-pointer hover:shadow-md active:scale-[0.98]'
                }`}
                style={{ borderLeftColor: accentBorderColor }}
              >
                <div>
                  <h2 className="text-xs sm:text-[13px] font-bold uppercase text-gray-900 tracking-wide truncate">
                    {market.name}
                  </h2>

                  <div className={`font-bold text-base sm:text-[17px] tracking-widest leading-tight my-1 ${resultTextColor}`}>
                    {market.result || '* *'}
                  </div>

                  <div className="flex items-center gap-1 text-[11px] font-medium text-gray-500 mt-1">
                    <IoTimeOutline size={13} className="text-gray-400 shrink-0" />
                    <span>{market.time}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 mt-1">
                  {isClosed ? (
                    <span className="bg-[#fee2e2]/80 text-[#ef4444] font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-red-100">
                      CLOSED
                    </span>
                  ) : (
                    <span className={`font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${runningBadgeClass}`}>
                      RUNNING
                    </span>
                  )}

                  {isClosed ? (
                    <div className="w-8 h-8 rounded-full bg-gray-100/90 flex items-center justify-center text-gray-400 border border-gray-200/50 shadow-2xs shrink-0">
                      <IoTimeOutline size={15} />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayMarket(market);
                      }}
                      className={`w-8 h-8 rounded-full active:scale-90 flex items-center justify-center border shadow-2xs transition-all cursor-pointer shrink-0 ${playBtnClass}`}
                      title="Play Market"
                    >
                      <FaPlay size={9} className="ml-0.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default UserJackpot;
