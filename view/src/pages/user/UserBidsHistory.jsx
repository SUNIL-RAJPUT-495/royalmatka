import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import {
  FaArrowLeft,
  FaGamepad,
  FaSearch,
  FaWallet
} from 'react-icons/fa';
import { IoFilterSharp, IoSearchOutline } from 'react-icons/io5';

export const UserBidsHistory = () => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = ['All', 'Wins', 'Losses', 'Pending'];
  const bids = [];

  const filteredBids = bids.filter((bid) => {
    const matchesTab = activeTab === 'All' || bid.status === activeTab;
    const matchesSearch = bid.gameName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="w-full select-none pb-8 font-sans">
      {/* 1. TOP ORANGE HEADER */}
      <div
        className="p-4 pt-4 pb-5 rounded-b-[28px] text-white shadow-md transition-colors duration-300 mb-4 sticky top-0 z-30"
        style={{ backgroundColor: currentTheme.headerBgColor }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-all cursor-pointer active:scale-95 border border-white/20 shadow-xs shrink-0"
              title="Go Back"
            >
              <FaArrowLeft size={14} />
            </button>
            <h2 className="text-base font-bold text-white tracking-wide">
              Bid History
            </h2>
          </div>

          <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-white shrink-0">
            <FaGamepad size={17} />
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* 2. TWO STATS CARDS */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-3xl p-4 border border-gray-150 shadow-2xs space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
              <FaWallet className="text-[#f97316]" size={13} />
              <span>Total Winnings</span>
            </div>
            <div className="text-2xl font-bold text-[#f97316]">
              ₹0
            </div>
          </div>

          <div className="bg-white rounded-3xl p-4 border border-gray-150 shadow-2xs space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
              <FaGamepad className="text-[#f97316]" size={14} />
              <span>Total Bets</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              0
            </div>
          </div>
        </div>

        {/* 3. FOUR FILTER TABS */}
        <div className="bg-white rounded-2xl p-1 border border-gray-150 shadow-2xs flex items-center justify-between">
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-center ${
                  isActive
                    ? 'bg-[#f97316] text-white shadow-xs font-bold'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* 4. SEARCH & FILTER ROW */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search games..."
              className="w-full pl-9 pr-3.5 py-2.5 bg-white rounded-2xl border border-gray-200 text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#f97316] transition-colors"
            />
          </div>

          <button
            type="button"
            className="w-10 h-10 bg-white rounded-2xl border border-gray-200 text-[#f97316] hover:bg-gray-50 flex items-center justify-center cursor-pointer shadow-2xs shrink-0"
          >
            <IoFilterSharp size={15} />
          </button>
        </div>

        {/* 5. NO BETS FOUND */}
        <div className="bg-white rounded-3xl p-12 border border-gray-150 shadow-2xs flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-full bg-gray-100/90 flex items-center justify-center text-gray-400 mb-3">
            <IoSearchOutline size={26} />
          </div>
          <h3 className="text-sm font-bold text-gray-900">No Bets Found</h3>
          <p className="text-xs text-gray-400 font-normal mt-1">
            We couldn't find any bets matching your current filters.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserBidsHistory;
