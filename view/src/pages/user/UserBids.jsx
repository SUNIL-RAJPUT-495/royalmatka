import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaFileAlt,
  FaTrophy,
  FaListUl,
  FaStar
} from 'react-icons/fa';

export const UserBids = () => {
  const navigate = useNavigate();

  const bidHubItems = [
    {
      id: 'bid-history',
      title: 'Bid History',
      icon: FaFileAlt,
      link: '/bids-history'
    },
    {
      id: 'game-result-history',
      title: 'Game Result History',
      icon: FaTrophy,
      link: '/game-result-history'
    },
    {
      id: 'starline-bid-history',
      title: 'Starline Bid History',
      icon: FaListUl,
      link: '/starline-bids'
    },
    {
      id: 'starline-result-history',
      title: 'Starline Result History',
      icon: FaStar,
      link: '/starline-results'
    },
    {
      id: 'jackpot-bid-history',
      title: 'Jackpot Bid History',
      icon: FaFileAlt,
      link: '/jackpot-bids'
    },
    {
      id: 'jackpot-result-history',
      title: 'Jackpot Result History',
      icon: FaTrophy,
      link: '/jackpot-results'
    },
    {
      id: 'jackpot-gali-bid-history',
      title: 'Jackpot Gali Bid History',
      icon: FaFileAlt,
      link: '/jackpot-gali-bids'
    },
    {
      id: 'gali-result-history',
      title: 'Gali Result History',
      icon: FaStar,
      link: '/gali-results'
    }
  ];

  return (
    <div className="w-full select-none pb-8 font-sans px-4 pt-3 space-y-3.5">
      {/* 2 COLUMNS X 4 ROWS GRID OF 8 CARDS (Exact match with Screenshot) */}
      <div className="grid grid-cols-2 gap-3.5">
        {bidHubItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              onClick={() => navigate(item.link)}
              className="bg-white rounded-3xl p-5 border border-gray-150/90 shadow-2xs flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 active:scale-95 transition-all space-y-3 aspect-[1.15]"
            >
              {/* Circular Orange Border Icon */}
              <div className="w-13 h-13 rounded-full border-2 border-[#f97316] text-[#f97316] flex items-center justify-center shadow-2xs shrink-0">
                <Icon size={18} />
              </div>

              {/* Card Label */}
              <h4 className="text-xs font-bold text-gray-900 leading-tight px-1">
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
