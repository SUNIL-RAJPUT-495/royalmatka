import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { fetchGame } from '../../utils/api';
import { getMarketSessionStatus } from '../../utils/marketTiming';
import { IoFlashSharp, IoTimeOutline } from 'react-icons/io5';
import { FaPlay } from 'react-icons/fa';
import aviatorImg from '../../assets/aviator.jpg';


export const UserHome = () => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  const [games, setGames] = useState([]);

  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr) return 99999;
    const cleanStr = String(timeStr).trim().toUpperCase();
    const match = cleanStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/);
    if (!match) return 99999;

    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[3] || 'AM';

    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }

    return hours * 60 + minutes;
  };

  useEffect(() => {
    const loadAllMarkets = async () => {
      try {
        const res = await fetchGame();
        if (Array.isArray(res)) {
          const sorted = [...res].sort((a, b) => parseTimeToMinutes(a.open_time) - parseTimeToMinutes(b.open_time));
          setGames(sorted);
        }
      } catch (err) {
        console.warn('Error loading markets:', err);
      }
    };
    loadAllMarkets();
  }, []);

  const themePlayBtn = currentTheme?.playBtnBg || currentTheme?.headerBgColor || '#f97316';

  return (
    <div className="w-full space-y-4 select-none pb-6">
      {/* 1. CASINO / AVIATOR BANNER */}
      <div
        onClick={() => navigate('/casino')}
        className="rounded-3xl p-4 text-white shadow-md relative overflow-hidden flex items-center justify-between transition-all duration-300 cursor-pointer hover:opacity-95 active:scale-[0.99]"
        style={{
          background: `linear-gradient(135deg, ${currentTheme?.headerBgColor || '#ea580c'} 0%, #9a3412 100%)`
        }}
      >
        {/* Left Side: Casino text & Play Now button */}
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-yellow-300 tracking-wider uppercase">
            <span>★</span>
            <span>LIVE CASINO</span>
          </div>
          <h2 className="text-lg font-bold tracking-tight text-white leading-tight">
            Play & win big
          </h2>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate('/casino');
            }}
            className="mt-1 bg-[#fbbf24] hover:bg-yellow-400 active:scale-95 text-gray-900 font-semibold text-xs px-3.5 py-1.5 rounded-full shadow-xs flex items-center gap-1.5 cursor-pointer transition-transform"
          >
            <span>Play now</span>
            <FaPlay size={8} />
          </button>
        </div>

        {/* Right Side: Aviator Banner Image */}
        <div className="w-32 h-20 sm:w-36 sm:h-22 rounded-2xl overflow-hidden shadow-inner border border-white/20 shrink-0 flex items-center justify-center bg-black">
          <img
            src={aviatorImg}
            alt="Aviator"
            className="w-full h-full object-cover rounded-2xl"
          />
        </div>
      </div>

      {/* 2. Main Markets Section Header */}
      <div className="flex items-center justify-between pt-1">
        <h3 className="font-bold text-gray-900 text-sm tracking-tight flex items-center gap-1.5">
          <IoFlashSharp className="text-yellow-500" size={16} />
          <span>Main Markets</span>
        </h3>
      </div>

      {/* 3. Market Cards List */}
      <div className="space-y-3">
        {games.map((game) => {
          const sessionStatus = getMarketSessionStatus(game);
          // Time-based session determines market closure; after 12:00 AM midnight, bidding opens for new date
          const isClosed = sessionStatus.isMarketClosed;
          const marketTitle = game.market_name || game.name || game.title || 'UNNAMED MARKET';
          
          let resultDisplay = game.display_result || game.result;
          // Fresh result display for new day (before today's open time)
          if (sessionStatus.isOpenSessionOpen && sessionStatus.isCloseSessionOpen) {
            resultDisplay = '***-**-***';
          } else if (!resultDisplay) {
            const oPana = game.result_open || game.open_result_pana || game.open_pana || '***';
            const cPana = game.result_close || game.close_result_pana || game.close_pana || '***';
            let jodi = game.jodi_result || game.jodi || '**';
            if (jodi === '**' || !jodi) {
              const oDigit = oPana !== '***' ? oPana.split('').reduce((a, b) => a + parseInt(b || 0, 10), 0) % 10 : '*';
              const cDigit = cPana !== '***' ? cPana.split('').reduce((a, b) => a + parseInt(b || 0, 10), 0) % 10 : '*';
              jodi = `${oDigit}${cDigit}`;
            }
            resultDisplay = `${oPana}-${jodi}-${cPana}`;
          }

          return (
            <div
              key={game._id || marketTitle}
              onClick={() => {
                if (!isClosed) {
                  navigate(`/play-game/${encodeURIComponent(marketTitle)}`);
                }
              }}
              style={{
                borderLeftColor: isClosed ? '#ef4444' : themePlayBtn
              }}
              className={`bg-white rounded-2xl p-4 border border-gray-100/90 shadow-2xs hover:shadow-xs transition-all duration-200 border-l-[4px] ${
                isClosed ? '' : 'cursor-pointer hover:bg-gray-50/50'
              }`}
            >
              {/* Top Row: Market Name on left, Clock/Play button on right */}
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-gray-900 text-[13px] uppercase tracking-tight">
                    {marketTitle}
                  </h4>
                  {/* Left-Aligned Dynamic Theme Result */}
                  <div className="mt-0.5">
                    <span
                      style={{ color: isClosed ? '#6b7280' : themePlayBtn }}
                      className="text-sm font-semibold tracking-wider"
                    >
                      {resultDisplay}
                    </span>
                  </div>
                </div>

                {/* Right Top Action */}
                {isClosed ? (
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-red-500 border border-gray-100 shadow-2xs">
                    <IoTimeOutline size={15} />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/play-game/${encodeURIComponent(marketTitle)}`);
                    }}
                    style={{ backgroundColor: themePlayBtn }}
                    className="w-8 h-8 rounded-full text-white flex items-center justify-center shadow-xs cursor-pointer active:scale-95 transition-transform"
                    title="Play Game"
                  >
                    <FaPlay size={9} className="ml-0.5" />
                  </button>
                )}
              </div>

              {/* Bottom Row: OPEN Time, Status Pill, CLOSE Time */}
              <div className="mt-3 flex items-center justify-between text-[11px]">
                {/* OPEN Time */}
                <div className="flex flex-col items-start leading-tight">
                  <span className="text-[9px] font-medium uppercase tracking-wider text-gray-400">
                    OPEN
                  </span>
                  <span className="text-gray-800 font-semibold text-[11px] mt-0.5">
                    {game.open_time}
                  </span>
                </div>

                {/* Status Pill Badge */}
                <div
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
                    isClosed
                      ? 'bg-red-50 text-red-600 border-red-100'
                      : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                  }`}
                >
                  {isClosed ? 'MARKET CLOSED' : 'MARKET RUNNING'}
                </div>

                {/* CLOSE Time */}
                <div className="flex flex-col items-end leading-tight">
                  <span className="text-[9px] font-medium uppercase tracking-wider text-gray-400">
                    CLOSE
                  </span>
                  <span className="text-gray-800 font-semibold text-[11px] mt-0.5">
                    {game.close_time}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserHome;
