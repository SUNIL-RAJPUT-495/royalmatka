import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { FaArrowLeft } from 'react-icons/fa';
import { fetchGame } from '../../utils/api';
import { getMarketSessionStatus } from '../../utils/marketTiming';

export const UserGameModes = () => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { marketName = 'SRIDEVI NIGHT' } = useParams();
  const decodedMarketName = decodeURIComponent(marketName).toUpperCase();

  const [marketDetails, setMarketDetails] = useState(null);
  const [sessionStatus, setSessionStatus] = useState({
    isOpenSessionOpen: true,
    isCloseSessionOpen: true,
    isMarketClosed: false
  });

  const GALI_MARKETS_LIST = ['DESAWAR', 'FARIDABAD', 'GAZIYABAD', 'GALI', 'DELHI BAZAR', 'SHRI GANESH', 'TAJ', 'CHARMINAR'];
  const isGaliMarket = location.search.includes('type=gali') || GALI_MARKETS_LIST.some(name => decodedMarketName.includes(name));

  // Always Scroll To Top when opening game modes page (iOS Safari compatible)
  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
      const root = document.getElementById('root');
      if (root) root.scrollTop = 0;
    };

    scrollToTop();
    requestAnimationFrame(scrollToTop);
    const timer = setTimeout(scrollToTop, 50);
    return () => clearTimeout(timer);
  }, [decodedMarketName]);

  useEffect(() => {
    const loadMarketInfo = async () => {
      try {
        const gamesList = await fetchGame();
        if (Array.isArray(gamesList)) {
          const match = gamesList.find(
            (g) =>
              (g.market_name || g.name || '').toUpperCase() === decodedMarketName
          );
          if (match) {
            setMarketDetails(match);
            const status = getMarketSessionStatus(match);
            setSessionStatus(status);
          }
        }
      } catch (err) {
        console.warn('Error fetching market details:', err);
      }
    };
    loadMarketInfo();
  }, [decodedMarketName]);

  const galiGameTypes = [
    { id: 'left-digit', name: 'Left Digit', isOpenOnly: false, iconType: 'left-digit' },
    { id: 'right-digit', name: 'Right Digit', isOpenOnly: false, iconType: 'right-digit' },
    { id: 'jodi-digit', name: 'Jodi Digit', isOpenOnly: false, iconType: 'two-dots-concentric' },
    { id: 'jodi-bulk', name: 'Jodi Bulk', isOpenOnly: false, iconType: 'two-dots-arc' },
    { id: 'digit-based', name: 'Digit Based', isOpenOnly: false, iconType: 'digit-symbol' }
  ];

  const baseGameTypes = [
    { id: 'single-digit', name: 'Single Digit', isOpenOnly: false, iconType: 'single-dot-concentric' },
    { id: 'single-digit-bulk', name: 'Single Digit Bulk', isOpenOnly: false, iconType: 'single-dot-arc' },
    { id: 'jodi-digit', name: 'Jodi Digit', isOpenOnly: true, iconType: 'two-dots-concentric' },
    { id: 'jodi-bulk', name: 'Jodi Bulk', isOpenOnly: true, iconType: 'two-dots-arc' },
    { id: 'single-pana', name: 'Single Pana', isOpenOnly: false, iconType: 'card-concentric' },
    { id: 'single-pana-bulk', name: 'Single Pana Bulk', isOpenOnly: false, iconType: 'card-arc' },
    { id: 'double-pana', name: 'Double Pana', isOpenOnly: false, iconType: 'two-cards-concentric' },
    { id: 'double-pana-bulk', name: 'Double Pana Bulk', isOpenOnly: false, iconType: 'two-cards-arc' },
    { id: 'triple-pana', name: 'Triple Pana', isOpenOnly: false, iconType: 'three-cards-concentric' },
    { id: 'triple-pana-bulk', name: 'Triple Pana Bulk', isOpenOnly: false, iconType: 'three-cards-arc' },
    { id: 'sp-motor', name: 'SP Motor', isOpenOnly: false, iconType: 'star-concentric' },
    { id: 'dp-motor', name: 'DP Motor', isOpenOnly: false, iconType: 'star-arc' },
    { id: 'odd-even', name: 'Odd Even', isOpenOnly: false, iconType: 'pentagon' },
    { id: 'two-digit-panel', name: 'Two Digit Panel (CP,SR)', isOpenOnly: false, iconType: 'grid' },
    { id: 'sp-dp-tp', name: 'SP DP TP', isOpenOnly: false, iconType: 'two-blocks' },
    { id: 'half-sangam', name: 'Half Sangam', isOpenOnly: true, iconType: 'dots-cluster' },
    { id: 'full-sangam', name: 'Full Sangam', isOpenOnly: true, iconType: 'dots-cluster' },
    { id: 'red-brackets', name: 'Red Brackets', isOpenOnly: true, iconType: 'brackets' },
    { id: 'digit-based', name: 'Digit Based', isOpenOnly: false, iconType: 'digit-symbol' }
  ];

  const activeBaseGameTypes = isGaliMarket ? galiGameTypes : baseGameTypes;

  // Dynamically calculate isClosed for every game mode
  const gameTypes = activeBaseGameTypes.map(game => {
    let isClosed = false;
    if (sessionStatus.isMarketClosed) {
      isClosed = true;
    } else if (game.isOpenOnly && !isGaliMarket) {
      // Open-only games (Jodi, Sangam, Brackets) close as soon as Open Result Time passes
      isClosed = !sessionStatus.isOpenSessionOpen;
    } else {
      // General games close when both Open & Close sessions end
      isClosed = !sessionStatus.isOpenSessionOpen && !sessionStatus.isCloseSessionOpen;
    }
    return { ...game, isClosed };
  });

  const themeColor = currentTheme?.headerBgColor || currentTheme?.playBtnBg || '#ea580c';

  const renderIcon = (type, isClosed) => {
    const strokeColor = isClosed ? '#9ca3af' : themeColor;
    const arcColor = isClosed ? '#d1d5db' : themeColor;
    const dotColor = isClosed ? '#9ca3af' : themeColor;

    switch (type) {
      case 'single-dot-concentric':
        return (
          <svg className="w-12 h-12" viewBox="0 0 50 50" fill="none">
            <circle cx="25" cy="25" r="22" stroke={strokeColor} strokeWidth="2" strokeDasharray="100 40" />
            <circle cx="25" cy="25" r="16" stroke={strokeColor} strokeWidth="1.5" />
            <circle cx="25" cy="25" r="3.5" fill={dotColor} />
          </svg>
        );
      case 'single-dot-arc':
        return (
          <svg className="w-12 h-12" viewBox="0 0 50 50" fill="none">
            <circle cx="25" cy="25" r="20" stroke={arcColor} strokeWidth="2.5" strokeDasharray="70 60" />
            <circle cx="25" cy="25" r="3.5" fill={dotColor} />
          </svg>
        );
      case 'two-dots-concentric':
        return (
          <svg className="w-12 h-12" viewBox="0 0 50 50" fill="none">
            <circle cx="25" cy="25" r="22" stroke={strokeColor} strokeWidth="2" strokeDasharray="100 40" />
            <circle cx="25" cy="25" r="16" stroke={strokeColor} strokeWidth="1.5" />
            <circle cx="20" cy="25" r="2.5" fill={dotColor} />
            <circle cx="30" cy="25" r="2.5" fill={dotColor} />
          </svg>
        );
      case 'two-dots-arc':
        return (
          <svg className="w-12 h-12" viewBox="0 0 50 50" fill="none">
            <circle cx="25" cy="25" r="20" stroke={arcColor} strokeWidth="2.5" strokeDasharray="60 40" />
            <circle cx="20" cy="25" r="2.5" fill={dotColor} />
            <circle cx="30" cy="25" r="2.5" fill={dotColor} />
          </svg>
        );
      case 'card-concentric':
        return (
          <svg className="w-12 h-12" viewBox="0 0 50 50" fill="none">
            <circle cx="25" cy="25" r="22" stroke={strokeColor} strokeWidth="2" strokeDasharray="100 40" />
            <circle cx="25" cy="25" r="16" stroke={strokeColor} strokeWidth="1.5" />
            <rect x="18" y="16" width="14" height="18" rx="2" stroke={strokeColor} strokeWidth="1.5" fill="none" />
          </svg>
        );
      case 'card-arc':
        return (
          <svg className="w-12 h-12" viewBox="0 0 50 50" fill="none">
            <circle cx="25" cy="25" r="20" stroke={arcColor} strokeWidth="2.5" strokeDasharray="80 50" />
            <rect x="18" y="16" width="14" height="18" rx="2" stroke={strokeColor} strokeWidth="1.5" fill="none" />
          </svg>
        );
      case 'two-cards-concentric':
        return (
          <svg className="w-12 h-12" viewBox="0 0 50 50" fill="none">
            <circle cx="25" cy="25" r="22" stroke={strokeColor} strokeWidth="2" strokeDasharray="100 40" />
            <circle cx="25" cy="25" r="16" stroke={strokeColor} strokeWidth="1.5" />
            <rect x="16" y="18" width="12" height="15" rx="2" stroke={strokeColor} strokeWidth="1.2" fill="none" />
            <rect x="22" y="15" width="12" height="15" rx="2" stroke={strokeColor} strokeWidth="1.2" fill="none" />
          </svg>
        );
      case 'two-cards-arc':
        return (
          <svg className="w-12 h-12" viewBox="0 0 50 50" fill="none">
            <circle cx="25" cy="25" r="20" stroke={arcColor} strokeWidth="2.5" strokeDasharray="70 40" />
            <rect x="16" y="18" width="12" height="15" rx="2" stroke={strokeColor} strokeWidth="1.2" fill="none" />
            <rect x="22" y="15" width="12" height="15" rx="2" stroke={strokeColor} strokeWidth="1.2" fill="none" />
          </svg>
        );
      case 'three-cards-concentric':
        return (
          <svg className="w-12 h-12" viewBox="0 0 50 50" fill="none">
            <circle cx="25" cy="25" r="22" stroke={strokeColor} strokeWidth="2" strokeDasharray="100 40" />
            <circle cx="25" cy="25" r="16" stroke={strokeColor} strokeWidth="1.5" />
            <rect x="14" y="19" width="10" height="13" rx="1.5" stroke={strokeColor} strokeWidth="1" fill="none" />
            <rect x="20" y="16" width="10" height="13" rx="1.5" stroke={strokeColor} strokeWidth="1" fill="none" />
            <rect x="26" y="13" width="10" height="13" rx="1.5" stroke={strokeColor} strokeWidth="1" fill="none" />
          </svg>
        );
      case 'three-cards-arc':
        return (
          <svg className="w-12 h-12" viewBox="0 0 50 50" fill="none">
            <circle cx="25" cy="25" r="20" stroke={arcColor} strokeWidth="2.5" strokeDasharray="80 40" />
            <rect x="14" y="19" width="10" height="13" rx="1.5" stroke={strokeColor} strokeWidth="1" fill="none" />
            <rect x="20" y="16" width="10" height="13" rx="1.5" stroke={strokeColor} strokeWidth="1" fill="none" />
            <rect x="26" y="13" width="10" height="13" rx="1.5" stroke={strokeColor} strokeWidth="1" fill="none" />
          </svg>
        );
      case 'star-concentric':
        return (
          <svg className="w-12 h-12" viewBox="0 0 50 50" fill="none">
            <circle cx="25" cy="25" r="22" stroke={strokeColor} strokeWidth="2" strokeDasharray="100 40" />
            <circle cx="25" cy="25" r="16" stroke={strokeColor} strokeWidth="1.5" />
            <path d="M25 15l2.5 5 5.5.8-4 3.9 1 5.5-5-2.6-5 2.6 1-5.5-4-3.9 5.5-.8z" stroke={strokeColor} strokeWidth="1.2" fill="none" />
          </svg>
        );
      case 'star-arc':
        return (
          <svg className="w-12 h-12" viewBox="0 0 50 50" fill="none">
            <circle cx="25" cy="25" r="20" stroke={arcColor} strokeWidth="2.5" strokeDasharray="75 50" />
            <path d="M25 15l2.5 5 5.5.8-4 3.9 1 5.5-5-2.6-5 2.6 1-5.5-4-3.9 5.5-.8z" stroke={strokeColor} strokeWidth="1.2" fill="none" />
          </svg>
        );
      case 'pentagon':
        return (
          <svg className="w-12 h-12" viewBox="0 0 50 50" fill="none">
            <circle cx="25" cy="25" r="20" stroke={arcColor} strokeWidth="2.5" strokeDasharray="75 50" />
            <polygon points="25,14 36,22 32,35 18,35 14,22" stroke={strokeColor} strokeWidth="1.5" fill="none" />
          </svg>
        );
      case 'grid':
        return (
          <svg className="w-12 h-12" viewBox="0 0 50 50" fill="none">
            <circle cx="25" cy="25" r="20" stroke={arcColor} strokeWidth="2.5" strokeDasharray="75 50" />
            <rect x="17" y="17" width="16" height="16" stroke={strokeColor} strokeWidth="1.5" fill="none" />
            <path d="M25 17v16M17 25h16" stroke={strokeColor} strokeWidth="1.2" />
          </svg>
        );
      case 'two-blocks':
        return (
          <svg className="w-12 h-12" viewBox="0 0 50 50" fill="none">
            <circle cx="25" cy="25" r="20" stroke={arcColor} strokeWidth="2.5" strokeDasharray="75 50" />
            <rect x="15" y="20" width="8" height="10" rx="1" stroke={strokeColor} strokeWidth="1.5" fill="none" />
            <rect x="27" y="20" width="8" height="10" rx="1" stroke={strokeColor} strokeWidth="1.5" fill="none" />
          </svg>
        );
      case 'dots-cluster':
        return (
          <svg className="w-12 h-12" viewBox="0 0 50 50" fill="none">
            <circle cx="25" cy="25" r="20" stroke={arcColor} strokeWidth="2.5" strokeDasharray="75 50" />
            <circle cx="20" cy="20" r="2" fill={dotColor} />
            <circle cx="30" cy="20" r="2" fill={dotColor} />
            <circle cx="20" cy="30" r="2" fill={dotColor} />
            <circle cx="30" cy="30" r="2" fill={dotColor} />
          </svg>
        );
      case 'brackets':
        return (
          <svg className="w-12 h-12" viewBox="0 0 50 50" fill="none">
            <circle cx="25" cy="25" r="20" stroke={arcColor} strokeWidth="2.5" strokeDasharray="75 50" />
            <path d="M18 18h-3v14h3M32 18h3v14h-3" stroke={strokeColor} strokeWidth="2" fill="none" />
          </svg>
        );
      case 'left-digit':
        return (
          <svg className="w-12 h-12" viewBox="0 0 50 50" fill="none">
            <circle cx="25" cy="25" r="20" stroke={arcColor} strokeWidth="2.5" strokeDasharray="75 50" />
            <text x="25" y="31" textAnchor="middle" fill={dotColor} fontSize="17" fontWeight="bold" fontFamily="sans-serif">L</text>
          </svg>
        );
      case 'right-digit':
        return (
          <svg className="w-12 h-12" viewBox="0 0 50 50" fill="none">
            <circle cx="25" cy="25" r="20" stroke={arcColor} strokeWidth="2.5" strokeDasharray="75 50" />
            <text x="25" y="31" textAnchor="middle" fill={dotColor} fontSize="17" fontWeight="bold" fontFamily="sans-serif">R</text>
          </svg>
        );
      default:
        return (
          <svg className="w-12 h-12" viewBox="0 0 50 50" fill="none">
            <circle cx="25" cy="25" r="20" stroke={strokeColor} strokeWidth="2.5" strokeDasharray="100 30" />
            <circle cx="25" cy="25" r="14" stroke={strokeColor} strokeWidth="1.2" />
            <path d="M22 25h6M25 22v6" stroke={strokeColor} strokeWidth="1.5" />
          </svg>
        );
    }
  };

  return (
    <div className="w-full select-none pb-24 font-sans">
      {/* 1. TOP ORANGE HEADER */}
      <div
        className="p-4 pt-4 pb-5 rounded-b-[28px] text-white shadow-md transition-colors duration-300 mb-3.5 sticky top-0 z-30 flex items-center justify-between"
        style={{ backgroundColor: currentTheme.headerBgColor }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-all cursor-pointer active:scale-95 border border-white/20 shadow-xs shrink-0"
            title="Go Back"
          >
            <FaArrowLeft size={14} />
          </button>
          <div>
            <h2 className="text-base font-bold tracking-tight text-white uppercase">
              {decodedMarketName}
            </h2>
            {marketDetails && (
              <p className="text-[10px] text-white/80 font-semibold mt-0.5">
                Open: {marketDetails.open_time} | Close: {marketDetails.close_time}
              </p>
            )}
          </div>
        </div>

        {sessionStatus.isMarketClosed ? (
          <span className="bg-red-500 text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-full shadow-2xs">
            MARKET CLOSED
          </span>
        ) : !sessionStatus.isOpenSessionOpen ? (
          <span className="bg-yellow-400 text-gray-900 text-[9px] font-black uppercase px-2.5 py-1 rounded-full shadow-2xs">
            OPEN RESULT DECLARED
          </span>
        ) : null}
      </div>

      <div className="px-3.5">
        {/* 2. 2-COLUMN GRID OF GAME OPTIONS */}
        <div className="grid grid-cols-2 gap-3.5">
          {gameTypes.map((game) => {
            return (
              <div
                key={game.id}
                onClick={() => {
                  if (!game.isClosed) {
                    navigate(`/bet/${marketName}/${game.id}${isGaliMarket ? '?type=gali' : ''}`);
                  }
                }}
                className={`bg-white rounded-3xl p-5 border border-gray-150/90 shadow-2xs flex flex-col items-center justify-center text-center transition-all min-h-[145px] space-y-2 ${
                  game.isClosed
                    ? 'opacity-70 cursor-not-allowed'
                    : 'cursor-pointer hover:bg-gray-50/80 active:scale-[0.98]'
                }`}
              >
                {/* Custom SVG Icon */}
                <div className="flex items-center justify-center">
                  {renderIcon(game.iconType, game.isClosed)}
                </div>

                {/* Game Title */}
                <h4
                  className={`text-[12px] font-bold leading-tight px-1 ${
                    game.isClosed ? 'text-gray-500' : 'text-gray-800'
                  }`}
                >
                  {game.name}
                </h4>

                {/* CLOSED BADGE IF CLOSED */}
                {game.isClosed && (
                  <span className="bg-[#6b7280] text-white text-[9px] font-black uppercase px-3 py-0.5 rounded-full tracking-wider shadow-2xs">
                    CLOSED
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default UserGameModes;
