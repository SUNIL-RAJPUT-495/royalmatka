import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { FaArrowLeft, FaPlay, FaChartLine } from 'react-icons/fa';
import { IoNotificationsOutline, IoStarOutline, IoTimeOutline, IoGridOutline, IoFlashSharp } from 'react-icons/io5';
import { fetchGame } from '../../utils/api';
import Axios from '../../utils/axios';
import SummaryApi from '../../common/SummerAPI';

// 1. STARLINE / HOURLY JACKPOT MARKETS (Screenshot 2: "Jackpot Markets")
const DEFAULT_STARLINE_MARKETS = [
  { id: 'sl-1', name: '10:30 AM', result: '* *', time: '10:30 AM', status: 'closed', is_closed: true },
  { id: 'sl-2', name: '11:30 AM', result: '* *', time: '11:30 AM', status: 'closed', is_closed: true },
  { id: 'sl-3', name: '12:30 PM', result: '* *', time: '12:30 PM', status: 'closed', is_closed: true },
  { id: 'sl-4', name: '1:30 PM', result: '* *', time: '1:30 PM', status: 'closed', is_closed: true },
  { id: 'sl-5', name: '2:30 PM', result: '* *', time: '2:30 PM', status: 'closed', is_closed: true },
  { id: 'sl-6', name: '3:30 PM', result: '* *', time: '3:30 PM', status: 'running', is_closed: false },
  { id: 'sl-7', name: '4:30 PM', result: '* *', time: '4:30 PM', status: 'running', is_closed: false },
  { id: 'sl-8', name: '5:30 PM', result: '* *', time: '5:30 PM', status: 'running', is_closed: false },
  { id: 'sl-9', name: '6:30 PM', result: '* *', time: '6:30 PM', status: 'running', is_closed: false },
  { id: 'sl-10', name: '7:30 PM', result: '* *', time: '7:30 PM', status: 'running', is_closed: false },
  { id: 'sl-11', name: '8:30 PM', result: '* *', time: '8:30 PM', status: 'running', is_closed: false },
  { id: 'sl-12', name: '9:30 PM', result: '* *', time: '9:30 PM', status: 'running', is_closed: false },
  { id: 'sl-13', name: '10:30 PM', result: '* *', time: '10:30 PM', status: 'running', is_closed: false }
];

// 2. GALI / JACKPOT GALI MARKETS (Screenshot 1: "Jackpot Gali Markets")
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

export const UserGaliBazar = () => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { tab: routeTab } = useParams();

  // Determine initial tab from URL pathname
  const getInitialTab = () => {
    const path = location.pathname.toLowerCase();
    if (path.includes('/gali') || path.includes('/jackpot-gali')) return 'gali';
    if (path.includes('/starline')) return 'starline';
    if (routeTab) return routeTab.toLowerCase();
    // Default index is starline view as requested
    return 'starline';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [galiMarkets, setGaliMarkets] = useState(DEFAULT_GALI_MARKETS);
  const [starlineMarkets, setStarlineMarkets] = useState(DEFAULT_STARLINE_MARKETS);

  useEffect(() => {
    const tabFromUrl = getInitialTab();
    setActiveTab(tabFromUrl);
    window.scrollTo(0, 0);
  }, [location.pathname, routeTab]);

  useEffect(() => {
    const loadMarkets = async () => {
      try {
        const [galiRes, starlineRes] = await Promise.all([
          Axios({ url: SummaryApi.getGaliMarkets.url, method: SummaryApi.getGaliMarkets.method }).catch(() => null),
          Axios({ url: SummaryApi.getStarlineMarkets.url, method: SummaryApi.getStarlineMarkets.method }).catch(() => null)
        ]);

        if (galiRes?.data?.data && Array.isArray(galiRes.data.data)) {
          setGaliMarkets(
            galiRes.data.data.map((g) => ({
              id: g._id || g.id,
              name: g.name,
              result: g.jodi_result || '**',
              time: g.time || '11:25 PM',
              status: g.is_closed ? 'closed' : 'running',
              is_closed: !!g.is_closed
            }))
          );
        }

        if (starlineRes?.data?.data && Array.isArray(starlineRes.data.data)) {
          setStarlineMarkets(
            starlineRes.data.data.map((s) => ({
              id: s._id || s.id,
              name: s.time,
              result: s.display_result || (s.pana_result && s.digit_result ? `${s.pana_result}-${s.digit_result}` : '***-*'),
              time: s.time,
              status: s.is_closed ? 'closed' : 'running',
              is_closed: !!s.is_closed
            }))
          );
        }
      } catch (err) {
        console.warn('Using default markets fallback:', err);
      }
    };
    loadMarkets();
  }, []);

  const handleTabClick = (tab) => {
    if (tab === 'main') {
      navigate('/');
      return;
    }
    setActiveTab(tab);
    if (tab === 'starline') {
      navigate('/gali-bazar/starline', { replace: true });
    } else if (tab === 'gali') {
      navigate('/gali-bazar/gali', { replace: true });
    }
  };

  const handlePlayMarket = (market) => {
    if (market.status === 'closed' || market.is_closed) return;
    navigate(`/play-game/${encodeURIComponent(market.name)}`);
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

  // Select list and title according to active tab
  const isGaliMode = activeTab === 'gali';
  const currentList = isGaliMode ? galiMarkets : starlineMarkets;
  const sectionTitle = isGaliMode ? 'Jackpot Gali Markets' : 'Jackpot Markets';

  return (
    <div className="w-full min-h-screen bg-[#f5f6fa] select-none font-sans flex flex-col pb-24">
      {/* 1. TOP HEADER */}
      <div
        className="w-full text-white shadow-xs transition-colors duration-300 shrink-0"
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
            {/* TAB 1: StarLine (Always Fixed on Left) */}
            <div
              onClick={() => handleTabClick('starline')}
              className={`rounded-2xl py-3.5 px-2 flex flex-col items-center justify-center gap-1 shadow-sm cursor-pointer transition-all ${
                !isGaliMode
                  ? 'bg-white shadow-md border-2 border-white scale-[1.02]'
                  : 'bg-white/95 hover:bg-white active:scale-95 border border-white/60'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-[#f5eeff] flex items-center justify-center text-[#9333ea] shrink-0 shadow-2xs">
                <IoStarOutline size={18} className="text-[#9333ea]" />
              </div>
              <span className="text-xs font-bold text-gray-900 tracking-tight">
                StarLine
              </span>
            </div>

            {/* TAB 2: Center Tab (Toggles ONLY between Jackpot and Gali) */}
            <div
              onClick={() => handleTabClick(isGaliMode ? 'starline' : 'gali')}
              className="bg-white rounded-2xl py-3.5 px-2 flex flex-col items-center justify-center gap-1 shadow-md cursor-pointer transition-all border-2 border-white scale-[1.02] active:scale-95"
            >
              {isGaliMode ? (
                /* Gali Mode -> Shows Jackpot with Orange Chart */
                <>
                  <div className="w-8 h-8 rounded-xl bg-[#fff7ed] flex items-center justify-center text-[#ea580c] shrink-0 shadow-2xs">
                    <FaChartLine size={16} className="text-[#ea580c]" />
                  </div>
                  <span className="text-xs font-bold text-gray-900 tracking-tight">
                    Jackpot
                  </span>
                </>
              ) : (
                /* Starline Mode -> Shows Gali with Blue Lightning */
                <>
                  <div className="w-8 h-8 rounded-xl bg-[#eff6ff] flex items-center justify-center text-[#3b82f6] shrink-0 shadow-2xs">
                    <IoFlashSharp size={17} className="text-[#3b82f6]" />
                  </div>
                  <span className="text-xs font-bold text-gray-900 tracking-tight">
                    Gali
                  </span>
                </>
              )}
            </div>

            {/* TAB 3: Main (Always Fixed on Right -> Navigates to Home) */}
            <div
              onClick={() => navigate('/')}
              className="bg-white/95 hover:bg-white active:scale-95 rounded-2xl py-3.5 px-2 flex flex-col items-center justify-center gap-1 shadow-sm cursor-pointer transition-all border border-white/60"
            >
              <div className="w-8 h-8 rounded-xl bg-[#ecfdf5] flex items-center justify-center text-[#10b981] shrink-0 shadow-2xs">
                <IoGridOutline size={18} className="text-[#10b981]" />
              </div>
              <span className="text-xs font-bold text-gray-900 tracking-tight">
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
            {sectionTitle}
          </h1>
        </div>

        {/* 2-Column Grid of Markets */}
        <div className="grid grid-cols-2 gap-3 sm:gap-3.5">
          {currentList.map((market) => {
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
                {/* Top: Market Title */}
                <div>
                  <h2 className="text-xs sm:text-[13px] font-bold uppercase text-gray-900 tracking-wide truncate">
                    {market.name}
                  </h2>

                  {/* Result: Digits in Dynamic Theme Color */}
                  <div className={`font-bold text-base sm:text-[17px] tracking-widest leading-tight my-1 ${resultTextColor}`}>
                    {market.result || '* *'}
                  </div>

                  {/* Market Timing with Outline Clock */}
                  <div className="flex items-center gap-1 text-[11px] font-medium text-gray-500 mt-1">
                    <IoTimeOutline size={13} className="text-gray-400 shrink-0" />
                    <span>{market.time}</span>
                  </div>
                </div>

                {/* Bottom Row: Status Pill + Action Circle Button */}
                <div className="flex items-center justify-between pt-3 mt-1">
                  {/* Status Badge */}
                  {isClosed ? (
                    <span className="bg-[#fee2e2]/80 text-[#ef4444] font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-red-100">
                      CLOSED
                    </span>
                  ) : (
                    <span className={`font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${runningBadgeClass}`}>
                      RUNNING
                    </span>
                  )}

                  {/* Action Icon Button */}
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

export default UserGaliBazar;
