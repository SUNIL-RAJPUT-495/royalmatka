import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { fetchGame } from '../../utils/api';
import { IoFlashSharp, IoTimeOutline } from 'react-icons/io5';
import { FaPlay } from 'react-icons/fa';
import aviatorImg from '../../assets/aviator.jpg';

export const UserHome = () => {
  const { currentTheme } = useTheme();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAllMarkets = async () => {
      setLoading(true);
      try {
        const res = await fetchGame();
        if (res && Array.isArray(res)) {
          setGames(res);
        }
      } catch (err) {
        console.error('Error loading games:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAllMarkets();
  }, []);

  return (
    <div className="w-full space-y-4 select-none pb-6">
      {/* 1. CASINO / AVIATOR BANNER (Exact match with Screenshot 1) */}
      <div
        className="rounded-3xl p-4 text-white shadow-md relative overflow-hidden flex items-center justify-between transition-colors duration-300"
        style={{
          background: `linear-gradient(135deg, ${currentTheme.headerBgColor} 0%, #9a3412 100%)`
        }}
      >
        {/* Left Side: Casino text & Play Now button */}
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-1 text-[11px] font-extrabold text-yellow-300 tracking-wider uppercase">
            <span>★</span>
            <span>LIVE CASINO</span>
          </div>
          <h2 className="text-xl font-black tracking-tight text-white leading-tight">
            Play & win big
          </h2>
          <button
            type="button"
            className="mt-1 bg-[#fbbf24] hover:bg-yellow-400 active:scale-95 text-gray-900 font-extrabold text-xs px-4 py-1.5 rounded-full shadow-xs flex items-center gap-1.5 cursor-pointer transition-transform"
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
        <h3 className="font-extrabold text-gray-900 text-base tracking-tight flex items-center gap-1.5">
          <IoFlashSharp className="text-yellow-500" size={18} />
          <span>Main Markets</span>
        </h3>
      </div>

      {/* 3. Market Cards List (Exact match with Screenshot 1) */}
      <div className="space-y-3.5">
        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm font-medium">
            Loading live markets...
          </div>
        ) : games.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-gray-100 shadow-2xs">
            <p className="text-gray-500 text-sm font-bold">No markets available right now.</p>
          </div>
        ) : (
          games.map((game) => {
            const oPana = game.open_result_pana || game.open_pana || '***';
            const cPana = game.close_result_pana || game.close_pana || '***';
            const oDigit = game.open_digit || (oPana !== '***' ? oPana.split('').reduce((a, b) => a + parseInt(b || 0, 10), 0) % 10 : '*');
            const cDigit = game.close_digit || (cPana !== '***' ? cPana.split('').reduce((a, b) => a + parseInt(b || 0, 10), 0) % 10 : '*');
            const resultDisplay = `${oPana}-${oDigit}${cDigit}-${cPana}`;
            const isClosed = game.status === 'closed' || game.is_closed || false;

            return (
              <div
                key={game._id}
                className="bg-white rounded-3xl p-4 border border-gray-100 shadow-2xs hover:shadow-md transition-all duration-200 border-l-[6px] border-l-[#ef4444]"
              >
                {/* Top Row: Market Name & Clock Icon */}
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="font-black text-gray-900 text-sm uppercase tracking-tight">
                    {game.name}
                  </h4>
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-red-500 border border-gray-100">
                    <IoTimeOutline size={16} />
                  </div>
                </div>

                {/* Middle Row: Big Bold Orange Result */}
                <div className="text-center py-1">
                  <span className="text-xl font-black tracking-widest text-[#f97316]">
                    {resultDisplay}
                  </span>
                </div>

                {/* Bottom Row: Timings & Status Pill */}
                <div className="mt-2 pt-2 border-t border-gray-50 flex items-center justify-between text-[11px] font-bold text-gray-400">
                  <div className="flex flex-col items-start">
                    <span className="text-[9px] uppercase tracking-wider text-gray-400">OPEN</span>
                    <span className="text-gray-700">{game.open_time}</span>
                  </div>

                  {/* Market Closed / Open Status Pill */}
                  <div className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-50 text-red-600 border border-red-100">
                    {isClosed ? 'MARKET CLOSED' : 'MARKET CLOSED'}
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="text-[9px] uppercase tracking-wider text-gray-400">CLOSE</span>
                    <span className="text-gray-700">{game.close_time}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default UserHome;
