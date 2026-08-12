import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { FaArrowLeft, FaPlay, FaChartLine } from 'react-icons/fa';
import { IoNotificationsOutline, IoStarOutline, IoTimeOutline, IoGridOutline } from 'react-icons/io5';
import { fetchGame } from '../../utils/api';

const DEFAULT_GALI_MARKETS = [
  { id: 'gali-1', name: 'DESAWAR', result: '* *', time: '4:00 AM', status: 'closed', is_closed: true },
  { id: 'gali-2', name: 'FARIDABAD', result: '* *', time: '5:50 PM', status: 'running', is_closed: false },
  { id: 'gali-3', name: 'GAZIYABAD', result: '* *', time: '8:55 PM', status: 'running', is_closed: false },
  { id: 'gali-4', name: 'GALI', result: '* *', time: '11:25 PM', status: 'running', is_closed: false },
  { id: 'gali-5', name: 'DELHI BAZAR', result: '* *', time: '3:00 PM', status: 'running', is_closed: false },
  { id: 'gali-6', name: 'SHRI GANESH', result: '* *', time: '4:30 PM', status: 'running', is_closed: false },
  { id: 'gali-7', name: 'TAJ', result: '* *', time: '3:15 PM', status: 'running', is_closed: false },
  { id: 'gali-8', name: 'CHARMINAR', result: '* *', time: '2:00 PM', status: 'closed', is_closed: true }
];

export const UserJackpotGali = () => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  const [markets, setMarkets] = useState(DEFAULT_GALI_MARKETS);

  useEffect(() => {
    window.scrollTo(0, 0);

    const loadMarkets = async () => {
      try {
        const res = await fetchGame();
        if (res && Array.isArray(res) && res.length > 0) {
          const galiFromDb = res.filter(
            (g) =>
              g.game_type === 'gali' ||
              g.isGali ||
              ['DESAWAR', 'FARIDABAD', 'GAZIYABAD', 'GALI', 'DELHI BAZAR', 'SHRI GANESH'].some(
                (name) => g.name?.toUpperCase().includes(name)
              )
          );
          if (galiFromDb.length > 0) {
            setMarkets(
              galiFromDb.map((g) => ({
                id: g._id || g.id,
                name: g.name,
                result: g.result || '* *',
                time: g.close_time || g.open_time || '8:00 PM',
                status: g.is_closed ? 'closed' : 'running',
                is_closed: !!g.is_closed
              }))
            );
          }
        }
      } catch (err) {
        console.warn('Using default Gali markets fallback:', err);
      }
    };
    loadMarkets();
  }, []);

  const handlePlayMarket = (market) => {
    if (market.status === 'closed' || market.is_closed) return;
    navigate(`/play-game/${encodeURIComponent(market.name)}`);
  };

  return (
    <div className="w-full min-h-screen bg-[#f5f6fa] select-none font-sans flex flex-col pb-24">
      {/* 1. TOP ORANGE HEADER */}
      <div
        className="w-full text-white shadow-xs transition-colors duration-300 shrink-0"
        style={{ backgroundColor: currentTheme.headerBgColor || '#f95e07' }}
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

            {/* TAB 2: Jackpot / Gali (Active) */}
            <div
              onClick={() => navigate('/Jackpot')}
              className="bg-white rounded-2xl py-3.5 px-2 flex flex-col items-center justify-center gap-1 shadow-md cursor-pointer transition-all border-2 border-white scale-[1.02] active:scale-95"
            >
              <div className="w-8 h-8 rounded-xl bg-[#fff7ed] flex items-center justify-center text-[#ea580c] shrink-0 shadow-2xs">
                <FaChartLine size={16} className="text-[#ea580c]" />
              </div>
              <span className="text-xs font-bold text-gray-900 tracking-tight">
                Jackpot
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
            Jackpot Gali Markets
          </h1>
        </div>

        {/* 2-Column Grid of Gali Markets */}
        <div className="grid grid-cols-2 gap-3 sm:gap-3.5">
          {markets.map((market) => {
            const isClosed = market.status === 'closed' || market.is_closed;

            return (
              <div
                key={market.id || market.name}
                onClick={() => !isClosed && handlePlayMarket(market)}
                className={`bg-white rounded-2xl p-3.5 shadow-xs border-l-[4px] border-l-[#00c853] flex flex-col justify-between relative transition-all duration-200 select-none border border-gray-100 ${
                  isClosed
                    ? 'opacity-95'
                    : 'cursor-pointer hover:shadow-md active:scale-[0.98]'
                }`}
              >
                <div>
                  <h2 className="text-xs sm:text-[13px] font-bold uppercase text-gray-900 tracking-wide truncate">
                    {market.name}
                  </h2>

                  <div className="text-[#00c853] font-bold text-base sm:text-[17px] tracking-widest leading-tight my-1">
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
                    <span className="bg-[#dcfce7] text-[#16a34a] font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-emerald-100">
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
                      className="w-8 h-8 rounded-full bg-[#dcfce7] hover:bg-emerald-100 active:scale-90 text-[#16a34a] flex items-center justify-center border border-emerald-200/80 shadow-2xs transition-all cursor-pointer shrink-0"
                      title="Play Market"
                    >
                      <FaPlay size={9} className="ml-0.5 text-emerald-600" />
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

export default UserJackpotGali;
