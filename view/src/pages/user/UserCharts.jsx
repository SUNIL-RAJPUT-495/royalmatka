import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import {
  FaArrowLeft,
  FaChartLine,
  FaChevronUp,
  FaChevronDown,
  FaLayerGroup,
  FaTh
} from 'react-icons/fa';

const SAMPLE_MARKETS = [
  'MILAN MORNING',
  'MILAN NIGHT',
  'KALYAN NIGHT',
  'RAJDHANI NIGHT',
  'SUPREME DAY',
  'SRIDEVI NIGHT',
  'TIME BAZAR',
  'MADHUR DAY',
  'KALYAN',
  'MAIN BAZAR'
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
  },
  {
    date: '15/07/2026\nto\n21/07/2026',
    days: [
      { top: '246', mid: '27', bot: '368' },
      { top: '458', mid: '73', bot: '120' },
      { top: '379', mid: '92', bot: '156' },
      { top: '257', mid: '49', bot: '360' },
      { top: '379', mid: '93', bot: '139' },
      { top: '359', mid: '70', bot: '389' }
    ]
  },
  {
    date: '06/07/2026\nto\n14/07/2026',
    days: [
      { top: '359', mid: '78', bot: '369' },
      { top: '246', mid: '23', bot: '779' },
      { top: '—', mid: '—', bot: '—' },
      { top: '—', mid: '—', bot: '—' },
      { top: '269', mid: '78', bot: '279' },
      { top: '589', mid: '20', bot: '235' }
    ]
  }
];

export const UserCharts = () => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();

  // Mode: 'list' | 'jodi' | 'pana'
  const [viewMode, setViewMode] = useState('list');
  const [selectedMarket, setSelectedMarket] = useState('MILAN MORNING');
  const [isMainGamesOpen, setIsMainGamesOpen] = useState(true);

  const openJodiChart = (marketName) => {
    setSelectedMarket(marketName);
    setViewMode('jodi');
  };

  const openPanaChart = (marketName) => {
    setSelectedMarket(marketName);
    setViewMode('pana');
  };

  return (
    <div className="w-full select-none pb-12 font-sans">
      {/* 1. TOP HEADER (Exact Match with Screenshots) */}
      <div
        className="p-4 pt-4 pb-5 rounded-b-[28px] text-white shadow-md transition-colors duration-300 mb-4"
        style={{ backgroundColor: currentTheme.headerBgColor }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (viewMode !== 'list') {
                  setViewMode('list');
                } else {
                  navigate(-1);
                }
              }}
              className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-all cursor-pointer active:scale-95 border border-white/20 shadow-xs shrink-0"
              title="Go Back"
            >
              <FaArrowLeft size={14} />
            </button>

            <div className="flex items-center gap-2">
              <FaChartLine size={16} />
              <div>
                <h2 className="text-base font-bold tracking-tight text-white leading-tight">
                  Charts
                </h2>
                <p className="text-xs text-white/80 font-normal mt-0.5">
                  Latest chart history
                </p>
              </div>
            </div>
          </div>

          {/* Right White Pill if in Jodi or Pana Chart View */}
          {viewMode !== 'list' && (
            <div className="bg-white text-[#f97316] font-bold text-xs uppercase px-3.5 py-1.5 rounded-full shadow-xs">
              {selectedMarket}
            </div>
          )}
        </div>
      </div>

      <div className="px-3.5 space-y-4">
        {/* ======================= 1. LIST VIEW (Screenshot 3) ======================= */}
        {viewMode === 'list' && (
          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-2xs">
            {/* Green Accordion Bar */}
            <div
              onClick={() => setIsMainGamesOpen(!isMainGamesOpen)}
              className="bg-[#0f766e] hover:bg-[#115e59] text-white p-3.5 px-4.5 flex items-center justify-between cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <FaTh size={14} />
                <span className="font-bold text-sm">Main Games</span>
                <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  27
                </span>
              </div>
              <div>
                {isMainGamesOpen ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
              </div>
            </div>

            {/* List of Markets with 2 Green Buttons each */}
            {isMainGamesOpen && (
              <div className="p-3.5 space-y-3 bg-[#f8f9fa]">
                {SAMPLE_MARKETS.map((market) => (
                  <div
                    key={market}
                    className="bg-white rounded-2xl p-4 border border-gray-150 shadow-2xs space-y-3"
                  >
                    <h4 className="text-xs font-bold text-gray-900 tracking-wide uppercase">
                      {market}
                    </h4>

                    <div className="grid grid-cols-2 gap-2.5">
                      {/* Jodi Chart Button */}
                      <button
                        type="button"
                        onClick={() => openJodiChart(market)}
                        className="bg-[#059669] hover:bg-[#047857] active:scale-95 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-all"
                      >
                        <FaLayerGroup size={12} />
                        <span>Jodi Chart</span>
                      </button>

                      {/* Pana Chart Button */}
                      <button
                        type="button"
                        onClick={() => openPanaChart(market)}
                        className="bg-[#059669] hover:bg-[#047857] active:scale-95 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-all"
                      >
                        <FaTh size={12} />
                        <span>Pana Chart</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================= 2. JODI CHART VIEW (Screenshot 4) ======================= */}
        {viewMode === 'jodi' && (
          <div className="space-y-3">
            {/* Green Sub-Pill */}
            <div className="flex items-center gap-2">
              <span className="bg-[#059669] text-white text-xs font-bold px-3 py-1 rounded-full uppercase shadow-2xs">
                Jodi Chart
              </span>
              <span className="text-xs font-bold text-gray-700 uppercase">
                {selectedMarket}
              </span>
            </div>

            {/* Main Jodi Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr className="bg-[#065f46] text-white text-xs font-bold">
                    <th className="py-2.5 border-r border-emerald-700/50">MON</th>
                    <th className="py-2.5 border-r border-emerald-700/50">TUE</th>
                    <th className="py-2.5 border-r border-emerald-700/50">WED</th>
                    <th className="py-2.5 border-r border-emerald-700/50">THU</th>
                    <th className="py-2.5 border-r border-emerald-700/50">FRI</th>
                    <th className="py-2.5 border-r border-emerald-700/50">SAT</th>
                    <th className="py-2.5">SUN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150 text-xs font-bold text-gray-900">
                  {JODI_DATA.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-gray-50/50">
                      {row.map((val, cIdx) => {
                        const isRed = val === '99' || val === '**';
                        return (
                          <td
                            key={cIdx}
                            className={`py-3 px-1 border-r border-gray-150 last:border-r-0 ${
                              isRed ? 'text-red-500 font-bold' : 'text-gray-900 font-bold'
                            }`}
                          >
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================= 3. PANA CHART VIEW (Screenshot 5) ======================= */}
        {viewMode === 'pana' && (
          <div className="space-y-3">
            {/* Green Sub-Pill */}
            <div className="flex items-center gap-2">
              <span className="bg-[#059669] text-white text-xs font-bold px-3 py-1 rounded-full uppercase shadow-2xs">
                Pana Chart
              </span>
              <span className="text-xs font-bold text-gray-700 uppercase">
                {selectedMarket}
              </span>
            </div>

            {/* Main Pana Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden overflow-x-auto">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr className="bg-[#065f46] text-white text-[11px] font-bold">
                    <th className="py-2.5 px-2 border-r border-emerald-700/50">Date</th>
                    <th className="py-2.5 px-1.5 border-r border-emerald-700/50">MON</th>
                    <th className="py-2.5 px-1.5 border-r border-emerald-700/50">TUE</th>
                    <th className="py-2.5 px-1.5 border-r border-emerald-700/50">WED</th>
                    <th className="py-2.5 px-1.5 border-r border-emerald-700/50">THU</th>
                    <th className="py-2.5 px-1.5 border-r border-emerald-700/50">FRI</th>
                    <th className="py-2.5 px-1.5">SAT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-[11px]">
                  {PANA_DATA.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-gray-50/50">
                      {/* Date Column */}
                      <td className="py-2 px-1 bg-emerald-50/40 font-semibold text-[10px] text-gray-600 border-r border-gray-200 whitespace-pre-line leading-tight">
                        {row.date}
                      </td>

                      {/* 6 Day Columns */}
                      {row.days.map((d, dIdx) => (
                        <td
                          key={dIdx}
                          className="py-1.5 px-1 border-r border-gray-200 last:border-r-0"
                        >
                          <div className="flex flex-col items-center leading-tight">
                            <span className="text-[11px] font-semibold text-gray-900">{d.top}</span>
                            <span
                              className={`text-[12px] font-bold my-0.5 ${
                                d.isRed ? 'text-red-500' : 'text-emerald-700'
                              }`}
                            >
                              {d.mid}
                            </span>
                            <span className="text-[11px] font-semibold text-gray-900">{d.bot}</span>
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserCharts;
