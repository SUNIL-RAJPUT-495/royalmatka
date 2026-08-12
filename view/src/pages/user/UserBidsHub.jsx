import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { FaArrowLeft } from 'react-icons/fa';
import {
  IoDocumentTextOutline,
  IoTrophyOutline,
  IoListOutline,
  IoStarOutline
} from 'react-icons/io5';

// Game History Hub (Previous 8-grid history menu)
export const UserBidsHub = () => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();

  const isGreenTheme = currentTheme?.id?.includes('green') || currentTheme?.headerBgColor === '#447668';
  const themeColor = currentTheme?.headerBgColor || (isGreenTheme ? '#447668' : '#f95e07');
  const iconBorderColor = isGreenTheme ? '#10b981' : '#f97316';

  const bidHubItems = [
    {
      id: 'bid-history',
      title: 'Bid History',
      icon: IoDocumentTextOutline,
      link: '/bids-history'
    },
    {
      id: 'game-result-history',
      title: 'Game Result History',
      icon: IoTrophyOutline,
      link: '/game-result-history'
    },
    {
      id: 'starline-bid-history',
      title: 'Starline Bid History',
      icon: IoListOutline,
      link: '/starline-bids'
    },
    {
      id: 'starline-result-history',
      title: 'Starline Result History',
      icon: IoStarOutline,
      link: '/starline-results'
    },
    {
      id: 'jackpot-bid-history',
      title: 'Jackpot Bid History',
      icon: IoDocumentTextOutline,
      link: '/jackpot-bids'
    },
    {
      id: 'jackpot-result-history',
      title: 'Jackpot Result History',
      icon: IoTrophyOutline,
      link: '/jackpot-results'
    },
    {
      id: 'jackpot-gali-bid-history',
      title: 'Jackpot Gali Bid History',
      icon: IoDocumentTextOutline,
      link: '/jackpot-gali-bids'
    },
    {
      id: 'gali-result-history',
      title: 'Gali Result History',
      icon: IoStarOutline,
      link: '/gali-results'
    }
  ];

  return (
    <div className="w-full min-h-screen bg-[#f5f6fa] select-none font-sans flex flex-col pb-28">
      {/* 1. TOP HEADER */}
      <div
        className="w-full text-white shadow-md rounded-b-[24px] transition-colors duration-300 shrink-0 mb-2"
        style={{ backgroundColor: themeColor }}
      >
        <div className="px-4 pt-3.5 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all cursor-pointer active:scale-95 border border-white/20 shadow-xs shrink-0"
              title="Go Back"
            >
              <FaArrowLeft size={13} />
            </button>

            <div>
              <h1 className="text-base font-bold tracking-tight text-white leading-tight">
                Game History
              </h1>
              <p className="text-[10px] text-white/80 font-normal mt-0.5">
                View all your game result records
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 2 COLUMNS X 4 ROWS GRID OF 8 CARDS */}
      <div className="px-3.5 pt-1">
        <div className="grid grid-cols-2 gap-2.5">
          {bidHubItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => navigate(item.link)}
                className="bg-white rounded-2xl py-3 px-2 border border-gray-100 shadow-2xs flex flex-col items-center justify-center text-center cursor-pointer active:scale-[0.98] transition-all min-h-[96px]"
              >
                {/* Soft Themed Icon Container */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-1.5 shrink-0 shadow-2xs ${
                    isGreenTheme
                      ? 'bg-[#ecfdf5] text-[#10b981] border border-emerald-100/80'
                      : 'bg-[#fff7ed] text-[#ea580c] border border-orange-100/80'
                  }`}
                >
                  <Icon size={18} />
                </div>

                {/* Card Label */}
                <h4 className="text-[11px] sm:text-xs font-bold text-gray-900 tracking-tight leading-tight px-0.5">
                  {item.title}
                </h4>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default UserBidsHub;
