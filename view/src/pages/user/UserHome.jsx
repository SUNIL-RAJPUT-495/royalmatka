import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { fetchGame } from '../../utils/api';
import { IoFlashSharp, IoTimeOutline } from 'react-icons/io5';
import { FaPlay } from 'react-icons/fa';
import aviatorImg from '../../assets/aviator.jpg';

const DUMMY_MARKETS = [
  {
    _id: 'm1',
    name: 'SITA MORNING',
    open_pana: '145',
    open_digit: '0',
    close_digit: '2',
    close_pana: '480',
    open_time: '9:40 AM',
    close_time: '10:40 AM',
    is_closed: true
  },
  {
    _id: 'm2',
    name: 'KARNATAKA DAY',
    open_pana: '566',
    open_digit: '7',
    close_digit: '1',
    close_pana: '335',
    open_time: '9:55 AM',
    close_time: '10:55 AM',
    is_closed: true
  },
  {
    _id: 'm3',
    name: 'MILAN MORNING',
    open_pana: '244',
    open_digit: '1',
    close_digit: '0',
    close_pana: '235',
    open_time: '10:15 AM',
    close_time: '11:15 AM',
    is_closed: true
  },
  {
    _id: 'm4',
    name: 'KALYAN MORNING',
    open_pana: '378',
    open_digit: '8',
    close_digit: '9',
    close_pana: '180',
    open_time: '11:00 AM',
    close_time: '12:02 PM',
    is_closed: false
  },
  {
    _id: 'm5',
    name: 'TIME BAZAR',
    open_pana: '234',
    open_digit: '9',
    close_digit: '2',
    close_pana: '345',
    open_time: '1:00 PM',
    close_time: '2:00 PM',
    is_closed: false
  },
  {
    _id: 'm6',
    name: 'MADHUR DAY',
    open_pana: '137',
    open_digit: '1',
    close_digit: '4',
    close_pana: '149',
    open_time: '1:30 PM',
    close_time: '2:30 PM',
    is_closed: false
  },
  {
    _id: 'm7',
    name: 'KALYAN',
    open_pana: '348',
    open_digit: '5',
    close_digit: '6',
    close_pana: '123',
    open_time: '3:45 PM',
    close_time: '5:45 PM',
    is_closed: false
  },
  {
    _id: 'm8',
    name: 'RAJDHANI NIGHT',
    open_pana: '178',
    open_digit: '6',
    close_digit: '8',
    close_pana: '350',
    open_time: '9:30 PM',
    close_time: '11:45 PM',
    is_closed: false
  }
];

export const UserHome = () => {
  const { currentTheme } = useTheme();
  const [games, setGames] = useState(DUMMY_MARKETS);

  useEffect(() => {
    const loadAllMarkets = async () => {
      try {
        const res = await fetchGame();
        if (res && Array.isArray(res) && res.length > 0) {
          setGames(res);
        }
      } catch (err) {
        console.warn('Using dummy markets fallback:', err);
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
        {games.map((game) => {
          const oPana = game.open_result_pana || game.open_pana || '***';
          const cPana = game.close_result_pana || game.close_pana || '***';
          const oDigit = game.open_digit !== undefined && game.open_digit !== null && game.open_digit !== ''
            ? game.open_digit
            : oPana !== '***'
            ? oPana.split('').reduce((a, b) => a + parseInt(b || 0, 10), 0) % 10
            : '*';
          const cDigit = game.close_digit !== undefined && game.close_digit !== null && game.close_digit !== ''
            ? game.close_digit
            : cPana !== '***'
            ? cPana.split('').reduce((a, b) => a + parseInt(b || 0, 10), 0) % 10
            : '*';
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
                  <span className="text-gray-700 font-semibold">{game.open_time}</span>
                </div>

                {/* Market Closed / Running Status Pill */}
                <div
                  className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                    isClosed
                      ? 'bg-red-50 text-red-600 border-red-100'
                      : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                  }`}
                >
                  {isClosed ? 'MARKET CLOSED' : 'BETTING IS RUNNING'}
                </div>

                <div className="flex flex-col items-end">
                  <span className="text-[9px] uppercase tracking-wider text-gray-400">CLOSE</span>
                  <span className="text-gray-700 font-semibold">{game.close_time}</span>
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
