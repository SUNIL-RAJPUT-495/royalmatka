import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import {
  FaArrowLeft,
  FaFileAlt,
  FaSearch,
  FaCheck,
  FaGift,
  FaArrowRight,
  FaSyncAlt
} from 'react-icons/fa';
import { IoFilterSharp, IoDocumentTextOutline } from 'react-icons/io5';

export const UserPassbook = () => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('Bonuses'); // 'All', 'Deposits', 'Withdrawals', 'Bonuses'
  const [searchQuery, setSearchQuery] = useState('');

  // Transactions data matching screenshots
  const allTransactions = [
    {
      id: 'tx-bonus-1',
      type: 'Bonus',
      date: '28/7/2026, 2:31:25 PM',
      amount: 9,
      utr: 'BET-1785229285955',
      status: 'Confirmed',
      category: 'Bonuses'
    }
  ];

  const tabs = [
    { id: 'All', label: 'All' },
    { id: 'Deposits', label: 'Deposits' },
    { id: 'Withdrawals', label: 'Withdrawals' },
    { id: 'Bonuses', label: 'Bonuses' }
  ];

  const filteredTransactions = allTransactions.filter((tx) => {
    const matchesTab = activeTab === 'All' || tx.category === activeTab;
    const matchesSearch =
      tx.utr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.amount.toString().includes(searchQuery);
    return matchesTab && matchesSearch;
  });

  return (
    <div className="w-full space-y-4 select-none pb-8 font-sans">
      {/* 1. TOP HEADER */}
      <div
        className="-mx-4 -mt-3 p-4 pt-4 pb-5 rounded-b-[28px] text-white shadow-md transition-colors duration-300"
        style={{ backgroundColor: currentTheme.headerBgColor }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-all cursor-pointer active:scale-95 border border-white/20 shadow-xs shrink-0"
          >
            <FaArrowLeft size={14} />
          </button>
          <div>
            <div className="flex items-center gap-2 text-base font-bold tracking-tight text-white">
              <FaFileAlt size={15} />
              <span>Transaction History</span>
            </div>
            <p className="text-xs text-white/80 font-normal mt-0.5">View all transactions</p>
          </div>
        </div>
      </div>

      {/* 2. FOUR TABS BAR */}
      <div className="bg-white rounded-2xl p-1 border border-gray-150 shadow-2xs flex items-center justify-between">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          let activeBgClass = 'bg-[#f97316] text-white';
          if (tab.id === 'Bonuses') activeBgClass = 'bg-[#8b5cf6] text-white';
          if (tab.id === 'Withdrawals') activeBgClass = 'bg-[#f97316] text-white';
          if (tab.id === 'Deposits') activeBgClass = 'bg-[#10b981] text-white';

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer text-center ${
                isActive
                  ? `${activeBgClass} shadow-xs font-bold`
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 3. ACTIVE CATEGORY INFO BANNER */}
      {activeTab === 'Bonuses' && (
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shadow-2xs shrink-0">
            <FaGift size={16} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900 leading-tight">Bonuses</h4>
            <p className="text-xs text-purple-600 font-medium mt-0.5">
              Rewards and referral credits
            </p>
          </div>
        </div>
      )}

      {activeTab === 'Withdrawals' && (
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center shadow-2xs shrink-0">
            <FaArrowRight size={14} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900 leading-tight">Withdrawals</h4>
            <p className="text-xs text-orange-600 font-medium mt-0.5">
              Money withdrawn from account
            </p>
          </div>
        </div>
      )}

      {/* 4. SEARCH & FILTER ROW */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by UTR or amount"
            className="w-full pl-9 pr-3.5 py-2.5 bg-white rounded-2xl border border-gray-200 text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#f97316] transition-colors"
          />
        </div>

        <button
          type="button"
          className="px-3.5 py-2.5 bg-white rounded-2xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
        >
          <IoFilterSharp className="text-[#f97316]" size={14} />
          <span>Filter</span>
        </button>

        <button
          type="button"
          onClick={() => setSearchQuery('')}
          className="w-10 h-10 bg-white rounded-2xl border border-gray-200 text-gray-500 hover:text-gray-900 flex items-center justify-center cursor-pointer shadow-2xs shrink-0"
        >
          <FaSyncAlt size={12} />
        </button>
      </div>

      <div className="text-[11px] font-medium text-gray-400 px-1">
        {filteredTransactions.length} transaction found
      </div>

      {/* 5. TRANSACTIONS LIST / EMPTY STATE */}
      {filteredTransactions.length > 0 ? (
        <div className="space-y-3">
          {filteredTransactions.map((tx) => (
            <div
              key={tx.id}
              className="bg-white rounded-3xl p-4.5 border border-emerald-200 shadow-2xs space-y-3"
            >
              {/* Header Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                    <FaCheck size={13} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{tx.type}</h4>
                    <span className="text-[11px] text-gray-400 font-normal">{tx.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="bg-purple-50 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-purple-100">
                    <FaGift size={9} />
                    <span>Bonus</span>
                  </span>
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-100">
                    <FaCheck size={9} />
                    <span>Confirmed</span>
                  </span>
                </div>
              </div>

              {/* 2 Inner Sub-Boxes (Amount & UTR) */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 bg-gray-50/70 rounded-2xl border border-gray-100">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Amount</span>
                  <span className="text-base font-bold text-gray-900 mt-0.5 block">₹{tx.amount}</span>
                </div>

                <div className="p-3 bg-gray-50/70 rounded-2xl border border-gray-100 overflow-hidden">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">UTR</span>
                  <span className="text-xs font-bold text-gray-800 mt-1 block truncate">
                    {tx.utr}
                  </span>
                </div>
              </div>

              {/* Status Row */}
              <div className="p-2.5 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                <FaCheck size={11} />
                <span>Confirmed</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State (Matching Screenshot 3) */
        <div className="bg-white rounded-3xl p-12 border border-gray-100 shadow-2xs flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
            <IoDocumentTextOutline size={28} />
          </div>
          <h3 className="text-sm font-bold text-gray-900">No Transactions Found</h3>
          <p className="text-xs text-gray-400 font-normal mt-1">
            No transactions match your filters.
          </p>
        </div>
      )}

      {/* 6. BACK TO WALLET BUTTON */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => navigate('/wallet')}
          className="w-full bg-[#f97316] hover:bg-orange-600 active:scale-98 text-white font-bold py-3 rounded-2xl shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all text-xs"
        >
          <FaArrowLeft size={12} />
          <span>Back to Wallet</span>
        </button>
      </div>
    </div>
  );
};

export default UserPassbook;
