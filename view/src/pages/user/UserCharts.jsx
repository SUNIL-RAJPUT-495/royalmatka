import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import {
  FaArrowLeft,
  FaChartLine,
  FaLayerGroup,
  FaTh
} from 'react-icons/fa';
import { IoNotificationsOutline } from 'react-icons/io5';

const MAIN_MARKETS = [
  'KALYAN',
  'TIME BAZAR',
  'MADHUR DAY',
  'MILAN DAY',
  'RAJDHANI DAY',
  'SUPREME DAY',
  'SRIDEVI NIGHT',
  'MILAN NIGHT',
  'KALYAN NIGHT',
  'RAJDHANI NIGHT',
  'MAIN BAZAR'
];

const GALI_MARKETS = [
  'DESAWAR',
  'FARIDABAD',
  'GAZIYABAD',
  'GALI',
  'DELHI BAZAR',
  'SHRI GANESH',
  'TAJ',
  'CHARMINAR'
];

const STARLINE_MARKETS = [
  'STARLINE 10:00 AM',
  'STARLINE 11:00 AM',
  'STARLINE 12:00 PM',
  'STARLINE 01:00 PM',
  'STARLINE 02:00 PM',
  'STARLINE 03:00 PM',
  'STARLINE 04:00 PM',
  'STARLINE 05:00 PM'
];

const JODI_DATA = [
  ['82', '18', '53', '06', '08', '99', '09'],
  ['58', '68', '28', '**', '42', '83', '56'],
  ['30', '24', '71', '20', '**', '61', '84'],
  ['27', '73', '92', '49', '93', '70', '32'],
  ['78', '23', '—', '—', '78', '20', '21'],
  ['78', '68', '70', '—', '60', '57', '75'],
  ['40', '12', '98', '98', '95', '95', '32'],
  ['36', '15', '74', '27', '69', '26', '03'],
  ['**', '—', '—', '69', '10', '76', '59'],
  ['04', '79', '58', '—', '—', '—', '—']
];

const PANA_DATA = [
  {
    date: '05/08/2026\nto\n11/08/2026',
    days: [
      { top: '800', mid: '82', bot: '679' },
      { top: '344', mid: '18', bot: '260' },
      { top: '780', mid: '53', bot: '247' },
      { top: '136', mid: '06', bot: '114' },
      { top: '280', mid: '08', bot: '170' },
      { top: '667', mid: '99', bot: '126', isRed: true }
    ]
  },
  {
    date: '29/07/2026\nto\n04/08/2026',
    days: [
      { top: '357', mid: '58', bot: '134' },
      { top: '790', mid: '68', bot: '279' },
      { top: '228', mid: '28', bot: '800' },
      { top: '338', mid: '**', bot: '***', isRed: true },
      { top: '446', mid: '42', bot: '778' },
      { top: '990', mid: '83', bot: '238' }
    ]
  },
  {
    date: '22/07/2026\nto\n28/07/2026',
    days: [
      { top: '247', mid: '30', bot: '226' },
      { top: '156', mid: '24', bot: '590' },
      { top: '467', mid: '71', bot: '227' },
      { top: '138', mid: '20', bot: '136' },
      { top: '278', mid: '**', bot: '***', isRed: true },
      { top: '259', mid: '61', bot: '236' }
    ]
  }
];

export const UserCharts = () => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();

  // Mode: 'list' | 'jodi' | 'pana'
  const [viewMode, setViewMode] = useState('list');
  const [category, setCategory] = useState('main'); // 'main' | 'gali' | 'starline'
  const [selectedMarket, setSelectedMarket] = useState('KALYAN');

  const isGreenTheme = currentTheme?.id?.includes('green') || currentTheme?.headerBgColor === '#447668';
  const themeHeaderBg = currentTheme?.headerBgColor || (isGreenTheme ? '#447668' : '#ea580c');
  const accentBorderColor = isGreenTheme ? '#10b981' : '#f97316';
  const btnBg = isGreenTheme
    ? 'bg-[#dcfce7] hover:bg-emerald-100 text-[#16a34a] border-emerald-200/80'
    : 'bg-orange-50 hover:bg-orange-100 text-[#ea580c] border-orange-200/80';

  const openJodiChart = (marketName) => {
    setSelectedMarket(marketName);
    setViewMode('jodi');
    window.scrollTo(0, 0);
  };

  const openPanaChart = (marketName) => {
    setSelectedMarket(marketName);
    setViewMode('pana');
    window.scrollTo(0, 0);
  };

  const getActiveMarkets = () => {
    if (category === 'gali') return GALI_MARKETS;
    if (category === 'starline') return STARLINE_MARKETS;
    return MAIN_MARKETS;
  };

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
              onClick={() => {
                if (viewMode !== 'list') {
                  setViewMode('list');
                } else {
                  navigate(-1);
                }
              }}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all cursor-pointer active:scale-95 border border-white/20 shadow-xs shrink-0"
              title="Go Back"
            >
              <FaArrowLeft size={15} />
            </button>

            <div>
              <div className="flex items-center gap-2 text-base font-bold tracking-tight text-white">
                <FaChartLine size={16} />
                <span>{viewMode === 'list' ? 'Charts' : `${selectedMarket} Chart`}</span>
              </div>
              <p className="text-[11px] text-white/80 font-normal">
                {viewMode === 'list' ? '✨ Historical result records' : `${viewMode.toUpperCase()} Panel Records`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/notifications')}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all cursor-pointer active:scale-95 border border-white/20 shadow-xs shrink-0"
            title="Notifications"
          >
            <IoNotificationsOutline size={20} />
          </button>
        </div>

        {/* Categories Tab Bar (When in list mode) */}
        {viewMode === 'list' && (
          <div className="px-4 pb-4">
            <div className="grid grid-cols-3 gap-2 bg-black/15 p-1 rounded-2xl border border-white/10">
              <button
                type="button"
                onClick={() => setCategory('main')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  category === 'main'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                Main Markets
              </button>
              <button
                type="button"
                onClick={() => setCategory('gali')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  category === 'gali'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                Jackpot Gali
              </button>
              <button
                type="button"
                onClick={() => setCategory('starline')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  category === 'starline'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                StarLine
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. BODY CONTENT */}
      <div className="px-4 pt-4 space-y-3.5">
        {viewMode === 'list' ? (
          /* LIST VIEW: MARKET CARDS */
          <>
            <div className="flex items-center gap-1.5">
              <span className="text-base">📈</span>
              <h1 className="text-[17px] font-bold text-gray-900 tracking-tight">
                {category === 'main' ? 'Main Market Charts' : category === 'gali' ? 'Jackpot Gali Charts' : 'StarLine Charts'}
              </h1>
            </div>

            <div className="space-y-2.5">
              {getActiveMarkets().map((marketName, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-3.5 shadow-xs border-l-[4px] border border-gray-100 flex items-center justify-between transition-all hover:shadow-sm"
                  style={{ borderLeftColor: accentBorderColor }}
                >
                  <div>
                    <h3 className="text-xs sm:text-[13px] font-bold uppercase text-gray-900 tracking-wide">
                      {marketName}
                    </h3>
                    <p className="text-[11px] text-gray-500 font-medium mt-0.5">Updated Live</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => openJodiChart(marketName)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${btnBg}`}
                    >
                      <FaTh size={11} />
                      <span>Jodi</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openPanaChart(marketName)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${btnBg}`}
                    >
                      <FaLayerGroup size={11} />
                      <span>Pana</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : viewMode === 'jodi' ? (
          /* JODI CHART TABLE */
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">{selectedMarket} - Jodi Chart</h3>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="text-xs font-bold text-gray-600 hover:text-gray-900 cursor-pointer"
              >
                Back to list ✕
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse text-xs font-medium">
                <thead>
                  <tr className="bg-gray-50 text-gray-700 border-b border-gray-200">
                    <th className="py-2 px-1 font-bold">Mon</th>
                    <th className="py-2 px-1 font-bold">Tue</th>
                    <th className="py-2 px-1 font-bold">Wed</th>
                    <th className="py-2 px-1 font-bold">Thu</th>
                    <th className="py-2 px-1 font-bold">Fri</th>
                    <th className="py-2 px-1 font-bold">Sat</th>
                    <th className="py-2 px-1 font-bold">Sun</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {JODI_DATA.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-gray-50/50">
                      {row.map((cell, cIdx) => (
                        <td
                          key={cIdx}
                          className={`py-2 px-1 font-bold ${
                            cell === '**' ? 'text-red-500' : 'text-gray-900'
                          }`}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* PANA / PANEL CHART TABLE */
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">{selectedMarket} - Panel (Pana) Chart</h3>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="text-xs font-bold text-gray-600 hover:text-gray-900 cursor-pointer"
              >
                Back to list ✕
              </button>
            </div>

            <div className="space-y-3">
              {PANA_DATA.map((week, wIdx) => (
                <div key={wIdx} className="border border-gray-150 rounded-xl p-2.5 bg-gray-50/40">
                  <div className="text-[11px] font-bold text-gray-500 mb-1.5 whitespace-pre-line leading-tight">
                    {week.date}
                  </div>
                  <div className="grid grid-cols-6 gap-1.5 text-center text-[10px]">
                    {week.days.map((day, dIdx) => (
                      <div key={dIdx} className="bg-white p-1.5 rounded-lg border border-gray-100">
                        <div className="text-gray-400 font-medium">{day.top}</div>
                        <div className={`font-bold text-xs my-0.5 ${day.isRed ? 'text-red-600' : 'text-gray-900'}`}>
                          {day.mid}
                        </div>
                        <div className="text-gray-400 font-medium">{day.bot}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserCharts;
