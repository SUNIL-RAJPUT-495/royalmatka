import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { fetchGame } from '../../utils/api';
import Axios from '../../utils/axios';
import SummaryApi from '../../common/SummerAPI';
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

// Deterministic string hash helper
const stringHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

// Generate dynamic market-specific Jodi chart data with DB history integration
const generateDynamicJodiData = (marketName, marketDoc, dbHistory = []) => {
  const seed = stringHash(marketName || 'DEFAULT');
  const rows = [];
  
  for (let r = 0; r < 10; r++) {
    const row = [];
    for (let c = 0; c < 7; c++) {
      const idx = r * 7 + c;
      const historyItem = dbHistory[idx];
      if (historyItem && historyItem.jodi_result && historyItem.jodi_result !== '**') {
        row.push(historyItem.jodi_result);
      } else if (r === 0 && c === 6 && marketDoc && marketDoc.jodi_result && marketDoc.jodi_result !== '**') {
        row.push(marketDoc.jodi_result);
      } else {
        const valSeed = (seed + r * 17 + c * 31) % 100;
        if (valSeed % 13 === 0) {
          row.push('**');
        } else if (valSeed % 17 === 0) {
          row.push('—');
        } else {
          const numStr = (valSeed % 100).toString().padStart(2, '0');
          row.push(numStr);
        }
      }
    }
    rows.push(row);
  }
  return rows;
};

// Generate dynamic market-specific Pana chart data with DB history integration
const generateDynamicPanaData = (marketName, marketDoc, dbHistory = []) => {
  const seed = stringHash(marketName || 'DEFAULT');
  const panaRows = [];
  
  const samplePanas = [
    '123', '234', '345', '456', '567', '678', '789', '890', '135', '246', 
    '357', '468', '579', '680', '790', '800', '280', '170', '260', '357', 
    '790', '800', '338', '446', '990', '238', '247', '156', '467', '138', 
    '278', '259', '246', '458', '379', '257', '359'
  ];

  const dateRanges = [
    '05/08/2026\nto\n11/08/2026',
    '29/07/2026\nto\n04/08/2026',
    '22/07/2026\nto\n28/07/2026',
    '15/07/2026\nto\n21/07/2026',
    '06/07/2026\nto\n14/07/2026'
  ];

  for (let r = 0; r < 5; r++) {
    const days = [];
    for (let c = 0; c < 6; c++) {
      const idx = r * 6 + c;
      const historyItem = dbHistory[idx];
      
      let topPana = historyItem?.open_pana && historyItem.open_pana !== '***' 
        ? historyItem.open_pana 
        : ((r === 0 && c === 5 && marketDoc && marketDoc.result_open && marketDoc.result_open !== '***')
            ? marketDoc.result_open 
            : samplePanas[(seed + r * 13 + c * 7) % samplePanas.length]);

      let botPana = historyItem?.close_pana && historyItem.close_pana !== '***'
        ? historyItem.close_pana
        : ((r === 0 && c === 5 && marketDoc && marketDoc.result_close && marketDoc.result_close !== '***')
            ? marketDoc.result_close
            : samplePanas[((seed + r * 13 + c * 7) + 5) % samplePanas.length]);

      let midJodi = historyItem?.jodi_result && historyItem.jodi_result !== '**'
        ? historyItem.jodi_result
        : ((r === 0 && c === 5 && marketDoc && marketDoc.jodi_result && marketDoc.jodi_result !== '**')
            ? marketDoc.jodi_result
            : ((stringHash(topPana + botPana) % 100).toString().padStart(2, '0')));

      const isRed = midJodi === '**' || midJodi === '99' || midJodi === '88' || midJodi === '77' || (topPana === botPana);

      days.push({
        top: topPana,
        mid: midJodi,
        bot: botPana,
        isRed
      });
    }
    panaRows.push({
      date: dateRanges[r],
      days
    });
  }

  return panaRows;
};

export const UserCharts = () => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();

  // Mode: 'list' | 'jodi' | 'pana'
  const [viewMode, setViewMode] = useState('list');
  const [selectedMarket, setSelectedMarket] = useState('MILAN MORNING');
  const [isMainGamesOpen, setIsMainGamesOpen] = useState(true);
  const [marketsList, setMarketsList] = useState(SAMPLE_MARKETS);
  const [rawMarketsData, setRawMarketsData] = useState([]);
  const [dbHistoryData, setDbHistoryData] = useState([]);

  useEffect(() => {
    const loadLiveMarkets = async () => {
      try {
        const res = await fetchGame();
        if (Array.isArray(res) && res.length > 0) {
          setRawMarketsData(res);
          const liveNames = res.map(g => (g.market_name || g.name || '').toUpperCase()).filter(Boolean);
          if (liveNames.length > 0) {
            setMarketsList(liveNames);
          }
        }
      } catch (err) {
        console.warn('Error loading live markets for charts:', err);
      }
    };
    loadLiveMarkets();
  }, []);

  const fetchChartHistory = async (marketName) => {
    try {
      const res = await Axios({
        url: `${SummaryApi.getChartHistory.url}?market_name=${encodeURIComponent(marketName)}`,
        method: SummaryApi.getChartHistory.method
      });
      if (res.data?.success && Array.isArray(res.data.data)) {
        setDbHistoryData(res.data.data);
      }
    } catch (e) {
      console.warn('Failed to fetch DB chart history for', marketName);
    }
  };

  const openJodiChart = (marketName) => {
    setSelectedMarket(marketName);
    setViewMode('jodi');
    fetchChartHistory(marketName);
  };

  const openPanaChart = (marketName) => {
    setSelectedMarket(marketName);
    setViewMode('pana');
    fetchChartHistory(marketName);
  };

  const currentMarketDoc = rawMarketsData.find(m => 
    (m.market_name || m.name || '').toUpperCase() === selectedMarket.toUpperCase()
  );

  const activeJodiData = generateDynamicJodiData(selectedMarket, currentMarketDoc, dbHistoryData);
  const activePanaData = generateDynamicPanaData(selectedMarket, currentMarketDoc, dbHistoryData);

  return (
    <div className="w-full select-none pb-12 font-sans">
      {/* 1. TOP HEADER (Exact Match with Screenshots) */}
      <div
        className="p-4 pt-4 pb-5 rounded-b-[28px] text-white shadow-md transition-colors duration-300 mb-4 sticky top-0 z-30"
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
            <div
              className="bg-white font-bold text-xs uppercase px-3.5 py-1.5 rounded-full shadow-xs"
              style={{ color: currentTheme.headerBgColor || '#f97316' }}
            >
              {selectedMarket}
            </div>
          )}
        </div>
      </div>

      <div className="px-3.5 space-y-4">
        {/* ======================= 1. LIST VIEW ======================= */}
        {viewMode === 'list' && (
          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-2xs">
            {/* Dynamic Theme Accordion Bar */}
            <div
              onClick={() => setIsMainGamesOpen(!isMainGamesOpen)}
              className="text-white p-3.5 px-4.5 flex items-center justify-between cursor-pointer transition-colors"
              style={{ backgroundColor: currentTheme.headerBgColor || '#0f766e' }}
            >
              <div className="flex items-center gap-2.5">
                <FaTh size={14} />
                <span className="font-bold text-sm">Main Games</span>
                <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {marketsList.length}
                </span>
              </div>
              <div>
                {isMainGamesOpen ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
              </div>
            </div>

            {/* List of Markets with 2 Theme Buttons each */}
            {isMainGamesOpen && (
              <div className="p-3.5 space-y-3 bg-[#f8f9fa]">
                {marketsList.map((market) => (
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
                        style={{ backgroundColor: currentTheme.playBtnBg || currentTheme.headerBgColor || '#059669' }}
                        className="hover:opacity-90 active:scale-95 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-all"
                      >
                        <FaLayerGroup size={12} />
                        <span>Jodi Chart</span>
                      </button>

                      {/* Pana Chart Button */}
                      <button
                        type="button"
                        onClick={() => openPanaChart(market)}
                        style={{ backgroundColor: currentTheme.playBtnBg || currentTheme.headerBgColor || '#059669' }}
                        className="hover:opacity-90 active:scale-95 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-all"
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

        {/* ======================= 2. JODI CHART VIEW ======================= */}
        {viewMode === 'jodi' && (
          <div className="space-y-3">
            {/* Theme Sub-Pill */}
            <div className="flex items-center gap-2">
              <span
                style={{ backgroundColor: currentTheme.playBtnBg || currentTheme.headerBgColor || '#059669' }}
                className="text-white text-xs font-bold px-3 py-1 rounded-full uppercase shadow-2xs"
              >
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
                  <tr
                    className="text-white text-xs font-bold"
                    style={{ backgroundColor: currentTheme.headerBgColor || '#065f46' }}
                  >
                    <th className="py-2.5 border-r border-white/20">MON</th>
                    <th className="py-2.5 border-r border-white/20">TUE</th>
                    <th className="py-2.5 border-r border-white/20">WED</th>
                    <th className="py-2.5 border-r border-white/20">THU</th>
                    <th className="py-2.5 border-r border-white/20">FRI</th>
                    <th className="py-2.5 border-r border-white/20">SAT</th>
                    <th className="py-2.5">SUN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150 text-xs font-bold text-gray-900">
                  {activeJodiData.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-gray-50/50">
                      {row.map((val, cIdx) => {
                        const isRed = val === '99' || val === '88' || val === '77' || val === '66' || val === '55' || val === '44' || val === '33' || val === '22' || val === '11' || val === '00' || val === '**';
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

        {/* ======================= 3. PANA CHART VIEW ======================= */}
        {viewMode === 'pana' && (
          <div className="space-y-3">
            {/* Theme Sub-Pill */}
            <div className="flex items-center gap-2">
              <span
                style={{ backgroundColor: currentTheme.playBtnBg || currentTheme.headerBgColor || '#059669' }}
                className="text-white text-xs font-bold px-3 py-1 rounded-full uppercase shadow-2xs"
              >
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
                  <tr
                    className="text-white text-[11px] font-bold"
                    style={{ backgroundColor: currentTheme.headerBgColor || '#065f46' }}
                  >
                    <th className="py-2.5 px-2 border-r border-white/20">Date</th>
                    <th className="py-2.5 px-1.5 border-r border-white/20">MON</th>
                    <th className="py-2.5 px-1.5 border-r border-white/20">TUE</th>
                    <th className="py-2.5 px-1.5 border-r border-white/20">WED</th>
                    <th className="py-2.5 px-1.5 border-r border-white/20">THU</th>
                    <th className="py-2.5 px-1.5 border-r border-white/20">FRI</th>
                    <th className="py-2.5 px-1.5">SAT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-[11px]">
                  {activePanaData.map((row, rIdx) => (
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
                              className={`text-[12px] font-bold my-0.5 ${d.isRed ? 'text-red-500' : 'text-emerald-700'
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
