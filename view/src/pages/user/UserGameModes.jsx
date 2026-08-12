import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { FaArrowLeft } from 'react-icons/fa';

export const UserGameModes = () => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  const { marketName = 'SRIDEVI NIGHT' } = useParams();

  const gameTypes = [
    { id: 'single-digit', name: 'Single Digit', isClosed: false, iconType: 'single-dot-concentric' },
    { id: 'single-digit-bulk', name: 'Single Digit Bulk', isClosed: false, iconType: 'single-dot-arc' },
    { id: 'jodi-digit', name: 'Jodi Digit', isClosed: true, iconType: 'two-dots-concentric' },
    { id: 'jodi-bulk', name: 'Jodi Bulk', isClosed: true, iconType: 'two-dots-arc' },
    { id: 'single-pana', name: 'Single Pana', isClosed: false, iconType: 'card-concentric' },
    { id: 'single-pana-bulk', name: 'Single Pana Bulk', isClosed: false, iconType: 'card-arc' },
    { id: 'double-pana', name: 'Double Pana', isClosed: false, iconType: 'two-cards-concentric' },
    { id: 'double-pana-bulk', name: 'Double Pana Bulk', isClosed: false, iconType: 'two-cards-arc' },
    { id: 'triple-pana', name: 'Triple Pana', isClosed: false, iconType: 'three-cards-concentric' },
    { id: 'triple-pana-bulk', name: 'Triple Pana Bulk', isClosed: false, iconType: 'three-cards-arc' },
    { id: 'sp-motor', name: 'SP Motor', isClosed: false, iconType: 'star-concentric' },
    { id: 'dp-motor', name: 'DP Motor', isClosed: false, iconType: 'star-arc' },
    { id: 'odd-even', name: 'Odd Even', isClosed: false, iconType: 'pentagon' },
    { id: 'two-digit-panel', name: 'Two Digit Panel (CP,SR)', isClosed: false, iconType: 'grid' },
    { id: 'sp-dp-tp', name: 'SP DP TP', isClosed: false, iconType: 'two-blocks' },
    { id: 'half-sangam', name: 'Half Sangam', isClosed: true, iconType: 'dots-cluster' },
    { id: 'full-sangam', name: 'Full Sangam', isClosed: true, iconType: 'dots-cluster' },
    { id: 'red-brackets', name: 'Red Brackets', isClosed: false, iconType: 'brackets' },
    { id: 'digit-based', name: 'Digit Based', isClosed: false, iconType: 'digit-symbol' }
  ];

  const renderIcon = (type, isClosed) => {
    const strokeColor = isClosed ? '#9ca3af' : '#c2410c';
    const arcColor = isClosed ? '#d1d5db' : '#ea580c';
    const dotColor = isClosed ? '#9ca3af' : '#ea580c';

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
            <circle cx="25" cy="25" r="20" stroke={arcColor} strokeWidth="2.5" strokeDasharray="70 60" />
            <circle cx="20" cy="25" r="2.5" fill={dotColor} />
            <circle cx="30" cy="25" r="2.5" fill={dotColor} />
          </svg>
        );
      case 'card-concentric':
        return (
          <svg className="w-12 h-12" viewBox="0 0 50 50" fill="none">
            <circle cx="25" cy="25" r="22" stroke={strokeColor} strokeWidth="2" strokeDasharray="100 40" />
            <rect x="18" y="15" width="14" height="20" rx="3" stroke={strokeColor} strokeWidth="1.5" />
            <path d="M23 23a2 2 0 0 1 4 0c0 2-2 3-2 3s-2-1-2-3z" fill={dotColor} />
          </svg>
        );
      case 'card-arc':
        return (
          <svg className="w-12 h-12" viewBox="0 0 50 50" fill="none">
            <circle cx="25" cy="25" r="20" stroke={arcColor} strokeWidth="2.5" strokeDasharray="70 60" />
            <rect x="18" y="15" width="14" height="20" rx="3" stroke={strokeColor} strokeWidth="1.5" />
            <path d="M23 23a2 2 0 0 1 4 0c0 2-2 3-2 3s-2-1-2-3z" fill={dotColor} />
          </svg>
        );
      case 'two-cards-concentric':
        return (
          <svg className="w-12 h-12" viewBox="0 0 50 50" fill="none">
            <circle cx="25" cy="25" r="22" stroke={strokeColor} strokeWidth="2" strokeDasharray="100 40" />
            <rect x="16" y="17" width="12" height="17" rx="2" stroke={strokeColor} strokeWidth="1.2" />
            <rect x="21" y="14" width="12" height="17" rx="2" stroke={strokeColor} strokeWidth="1.2" />
          </svg>
        );
      case 'two-cards-arc':
        return (
          <svg className="w-12 h-12" viewBox="0 0 50 50" fill="none">
            <circle cx="25" cy="25" r="20" stroke={arcColor} strokeWidth="2.5" strokeDasharray="70 60" />
            <rect x="16" y="17" width="12" height="17" rx="2" stroke={strokeColor} strokeWidth="1.2" />
            <rect x="21" y="14" width="12" height="17" rx="2" stroke={strokeColor} strokeWidth="1.2" />
          </svg>
        );
      case 'three-cards-concentric':
      case 'three-cards-arc':
        return (
          <svg className="w-12 h-12" viewBox="0 0 50 50" fill="none">
            <circle cx="25" cy="25" r="22" stroke={strokeColor} strokeWidth="2" strokeDasharray="100 40" />
            <rect x="15" y="18" width="11" height="15" rx="2" stroke={strokeColor} strokeWidth="1.2" />
            <rect x="19" y="15" width="11" height="15" rx="2" stroke={strokeColor} strokeWidth="1.2" />
            <rect x="23" y="12" width="11" height="15" rx="2" stroke={strokeColor} strokeWidth="1.2" />
          </svg>
        );
      case 'star-concentric':
      case 'star-arc':
        return (
          <svg className="w-12 h-12" viewBox="0 0 50 50" fill="none">
            <circle cx="25" cy="25" r="22" stroke={strokeColor} strokeWidth="2" strokeDasharray="100 40" />
            <circle cx="25" cy="25" r="16" stroke={strokeColor} strokeWidth="1.2" />
            <path
              d="M25 18l2 4 4.5.5-3.5 3 1 4.5-4-2.5-4 2.5 1-4.5-3.5-3 4.5-.5z"
              stroke={strokeColor}
              strokeWidth="1.2"
              fill="none"
            />
          </svg>
        );
      case 'pentagon':
        return (
          <svg className="w-12 h-12" viewBox="0 0 50 50" fill="none">
            <circle cx="25" cy="25" r="20" stroke={strokeColor} strokeWidth="2.5" strokeDasharray="90 50" />
            <polygon points="25,16 34,22 30,33 20,33 16,22" stroke={strokeColor} strokeWidth="1.5" fill="none" />
          </svg>
        );
      case 'grid':
        return (
          <svg className="w-12 h-12" viewBox="0 0 50 50" fill="none">
            <circle cx="25" cy="25" r="20" stroke={strokeColor} strokeWidth="2.5" />
            <rect x="17" y="17" width="16" height="16" rx="2" stroke={strokeColor} strokeWidth="1.5" />
            <line x1="22" y1="17" x2="22" y2="33" stroke={strokeColor} strokeWidth="1.2" />
            <line x1="28" y1="17" x2="28" y2="33" stroke={strokeColor} strokeWidth="1.2" />
            <line x1="17" y1="22" x2="33" y2="22" stroke={strokeColor} strokeWidth="1.2" />
            <line x1="17" y1="28" x2="33" y2="28" stroke={strokeColor} strokeWidth="1.2" />
          </svg>
        );
      case 'two-blocks':
        return (
          <svg className="w-12 h-12" viewBox="0 0 50 50" fill="none">
            <circle cx="25" cy="25" r="20" stroke={strokeColor} strokeWidth="2.5" />
            <rect x="17" y="19" width="6" height="12" rx="2" stroke={strokeColor} strokeWidth="1.5" />
            <circle cx="20" cy="25" r="1.5" fill={dotColor} />
            <rect x="27" y="19" width="6" height="12" rx="2" stroke={strokeColor} strokeWidth="1.5" />
            <circle cx="30" cy="25" r="1.5" fill={dotColor} />
          </svg>
        );
      case 'dots-cluster':
        return (
          <svg className="w-12 h-12" viewBox="0 0 50 50" fill="none">
            <circle cx="25" cy="25" r="20" stroke={strokeColor} strokeWidth="2" strokeDasharray="100 40" />
            <circle cx="25" cy="25" r="15" stroke={strokeColor} strokeWidth="1.2" />
            <circle cx="21" cy="22" r="1.5" fill={dotColor} />
            <circle cx="25" cy="22" r="1.5" fill={dotColor} />
            <circle cx="29" cy="22" r="1.5" fill={dotColor} />
            <circle cx="21" cy="28" r="1.5" fill={dotColor} />
            <circle cx="25" cy="28" r="1.5" fill={dotColor} />
            <circle cx="29" cy="28" r="1.5" fill={dotColor} />
          </svg>
        );
      case 'brackets':
        return (
          <svg className="w-12 h-12" viewBox="0 0 50 50" fill="none">
            <circle cx="25" cy="25" r="20" stroke={strokeColor} strokeWidth="2.5" />
            <path d="M19 18h-3v14h3" stroke={strokeColor} strokeWidth="2" />
            <path d="M31 18h3v14h-3" stroke={strokeColor} strokeWidth="2" />
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
      {/* 1. TOP ORANGE HEADER (Exact Match with Screenshot) */}
      <div
        className="p-4 pt-4 pb-5 rounded-b-[28px] text-white shadow-md transition-colors duration-300 mb-3.5 sticky top-0 z-30"
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
          <h2 className="text-base font-bold tracking-tight text-white uppercase">
            {marketName}
          </h2>
        </div>
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
                    navigate(`/bet/${marketName}/${game.id}`);
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
