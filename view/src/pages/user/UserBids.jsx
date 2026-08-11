import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoDocumentTextOutline,
  IoTrophyOutline,
  IoListOutline,
  IoStarOutline
} from 'react-icons/io5';

export const UserBids = () => {
  const navigate = useNavigate();

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
    <div className="w-full select-none pb-24 font-sans px-3.5 pt-2.5">
      {/* 2 COLUMNS X 4 ROWS GRID OF 8 CARDS */}
      <div className="grid grid-cols-2 gap-3">
        {bidHubItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              onClick={() => navigate(item.link)}
              className="bg-white rounded-2xl py-3.5 px-2.5 border border-gray-200/80 shadow-2xs flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50/80 active:scale-[0.98] transition-all min-h-[118px]"
            >
              {/* Circular Orange Border Icon */}
              <div className="w-12 h-12 rounded-full border-[1.5px] border-[#f97316] text-[#f97316] flex items-center justify-center mb-2 shadow-2xs shrink-0">
                <Icon size={20} />
              </div>

              {/* Card Label */}
              <h4 className="text-[12px] font-semibold text-gray-800 tracking-tight leading-tight px-1">
                {item.title}
              </h4>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserBids;
