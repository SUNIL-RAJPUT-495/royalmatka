import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import {
  FaCreditCard,
  FaChevronRight,
  FaArrowRight,
  FaQuestion,
  FaArrowUp,
  FaGift,
  FaArrowLeft
} from 'react-icons/fa';
import { IoWalletOutline, IoFlashSharp, IoRefreshOutline, IoTrendingUpOutline } from 'react-icons/io5';
import { HiOutlineSparkles } from 'react-icons/hi';

export const UserWallet = () => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  const context = useOutletContext() || {};
  const user = context.user || { name: 'Shubham', walletBalance: 9.0 };

  const [activeFilter, setActiveFilter] = useState('All');
  const [lastUpdatedTime, setLastUpdatedTime] = useState(() => new Date().toLocaleTimeString());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshBalance = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastUpdatedTime(new Date().toLocaleTimeString());
      setIsRefreshing(false);
    }, 400);
  };

  // Dummy transactions matching exact screenshot
  const transactions = [
    {
      id: 'tx1',
      type: 'loss',
      title: 'Game Loss',
      time: '1/8/2026, 2:27:03 PM',
      tag: 'Aviator • casino',
      amount: -10,
      category: 'Games'
    },
    {
      id: 'tx2',
      type: 'deposit',
      title: 'Deposit',
      time: '31/7/2026, 6:57:08 PM',
      amount: 10,
      category: 'Deposits'
    },
    {
      id: 'tx3',
      type: 'bonus',
      title: 'Bonus',
      time: '28/7/2026, 1:12:00 PM',
      amount: 9,
      category: 'Bonuses'
    },
    {
      id: 'tx4',
      type: 'withdrawal',
      title: 'Withdrawal',
      time: '20/7/2026, 5:40:22 PM',
      amount: -500,
      category: 'Withdrawals'
    }
  ];

  const filterTabs = ['All', 'Deposits', 'Withdrawals', 'Games', 'Bonuses'];

  const filteredTransactions = activeFilter === 'All'
    ? transactions
    : transactions.filter((tx) => tx.category === activeFilter);

  return (
    <div className="w-full select-none pb-8 font-sans">
      {/* 1. TOP CURVED WALLET HEADER (Exact match with Screenshot) */}
      <div
        className="p-4 pt-4 pb-5 rounded-b-[28px] text-white shadow-md transition-colors duration-300 mb-4"
        style={{ backgroundColor: currentTheme.headerBgColor }}
      >
        {/* Header Top Row */}
        <div className="flex items-center gap-3 mb-3.5">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-all cursor-pointer active:scale-95 border border-white/20 shadow-xs shrink-0"
            title="Go Back"
          >
            <FaArrowLeft size={14} />
          </button>

          <div>
            <div className="flex items-center gap-1.5 text-base font-bold tracking-tight text-white">
              <span>My Wallet</span>
              <HiOutlineSparkles size={16} className="text-yellow-300" />
            </div>
            <p className="text-xs text-white/80 font-normal -mt-0.5">Manage your funds</p>
          </div>
        </div>

        {/* Current Balance Glass Card */}
        <div className="bg-white/15 hover:bg-white/20 backdrop-blur-md rounded-3xl p-4.5 border border-white/25 shadow-xs transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white/90">Current Balance</span>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">
              <IoWalletOutline size={15} />
            </div>
          </div>

          <div className="my-1">
            <span className="text-3xl font-bold text-white tracking-tight">
              ₹{Number(user.walletBalance || 9).toFixed(0)}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-white/15">
            <div className="text-[11px] text-white/80 font-normal leading-tight">
              Last updated<br />
              <span className="font-semibold text-white">{lastUpdatedTime}</span>
            </div>

            <button
              type="button"
              onClick={handleRefreshBalance}
              className="bg-white/20 hover:bg-white/30 active:scale-95 px-3 py-1 rounded-full text-xs font-semibold text-white border border-white/25 flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
            >
              <IoRefreshOutline size={13} className={isRefreshing ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* 2. QUICK ACTIONS SECTION */}
        <div>
          <div className="flex items-center gap-1.5 text-sm font-bold text-gray-900 mb-2.5 px-1">
            <span>Quick Actions</span>
            <IoFlashSharp className="text-amber-500" size={14} />
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {/* Add Fund */}
            <div
              onClick={() => navigate('/deposit')}
              className="bg-white rounded-2xl p-3.5 border border-gray-100/90 shadow-2xs flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 active:scale-95 transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-1.5 shadow-2xs">
                <IoWalletOutline size={18} />
              </div>
              <h4 className="text-xs font-semibold text-gray-900 leading-tight">Add Fund</h4>
              <p className="text-[10px] text-gray-400 font-normal mt-0.5">Deposit money</p>
            </div>

            {/* Withdraw Fund */}
            <div
              onClick={() => navigate('/withdraw')}
              className="bg-white rounded-2xl p-3.5 border border-gray-100/90 shadow-2xs flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 active:scale-95 transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-500 flex items-center justify-center mb-1.5 shadow-2xs">
                <FaArrowRight size={14} />
              </div>
              <h4 className="text-xs font-semibold text-gray-900 leading-tight">Withdraw Fund</h4>
              <p className="text-[10px] text-gray-400 font-normal mt-0.5">Cash out winnings</p>
            </div>

            {/* Wallet History */}
            <div
              onClick={() => navigate('/passbook')}
              className="bg-white rounded-2xl p-3.5 border border-gray-100/90 shadow-2xs flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 active:scale-95 transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-sky-50 text-sky-500 flex items-center justify-center mb-1.5 shadow-2xs">
                <IoRefreshOutline size={18} />
              </div>
              <h4 className="text-xs font-semibold text-gray-900 leading-tight">Wallet History</h4>
              <p className="text-[10px] text-gray-400 font-normal mt-0.5">View transactions</p>
            </div>
          </div>
        </div>

        {/* 3. PAYMENT DETAILS CARD */}
        <div
          onClick={() => navigate('/payment-methods')}
          className="bg-white rounded-2xl p-4 border border-gray-100/90 shadow-2xs flex items-center justify-between cursor-pointer hover:bg-gray-50 active:scale-[0.99] transition-all"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center shadow-2xs">
              <FaCreditCard size={16} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 leading-tight">Payment Details</h4>
              <p className="text-[11px] text-gray-400 font-normal mt-0.5">Manage payment methods</p>
            </div>
          </div>
          <FaChevronRight size={12} className="text-gray-400" />
        </div>

        {/* 4. RECENT TRANSACTIONS SECTION */}
        <div className="space-y-3 pt-1">
          {/* Header Row */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5 text-sm font-bold text-gray-900">
              <span>Recent Transactions</span>
              <IoTrendingUpOutline className="text-orange-500" size={16} />
            </div>
            <button
              onClick={() => navigate('/passbook')}
              className="text-xs font-semibold text-[#f97316] hover:underline cursor-pointer"
            >
              View All →
            </button>
          </div>

          {/* Filter Tabs Container */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
            {filterTabs.map((tab) => {
              const isActive = activeFilter === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveFilter(tab)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-[#f97316] text-white shadow-xs'
                      : 'bg-white text-gray-500 hover:text-gray-900 border border-gray-150'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Transactions List */}
          <div className="bg-white rounded-3xl p-2 border border-gray-100 shadow-2xs divide-y divide-gray-50">
            {filteredTransactions.map((tx) => {
              const isNegative = tx.amount < 0;
              return (
                <div key={tx.id} className="p-3 flex items-center justify-between">
                  {/* Left: Icon & Title/Time */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shadow-2xs shrink-0 ${
                        tx.type === 'deposit'
                          ? 'bg-emerald-50 text-emerald-500'
                          : tx.type === 'bonus'
                          ? 'bg-purple-50 text-purple-500'
                          : tx.type === 'loss'
                          ? 'bg-gray-100 text-gray-500'
                          : 'bg-red-50 text-red-500'
                      }`}
                    >
                      {tx.type === 'deposit' ? (
                        <FaArrowUp size={13} className="rotate-45" />
                      ) : tx.type === 'bonus' ? (
                        <FaGift size={13} />
                      ) : tx.type === 'loss' ? (
                        <FaQuestion size={12} />
                      ) : (
                        <FaArrowRight size={12} className="rotate-45" />
                      )}
                    </div>

                    <div>
                      <h5 className="text-xs font-semibold text-gray-900">{tx.title}</h5>
                      <span className="text-[10px] text-gray-400 font-normal block mt-0.5">
                        {tx.time}
                      </span>
                      {tx.tag && (
                        <span className="inline-block mt-1 bg-gray-100 text-gray-600 text-[9px] font-medium px-2 py-0.5 rounded-full">
                          {tx.tag}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Amount */}
                  <div className="text-right">
                    <span
                      className={`text-sm font-bold tracking-tight ${
                        isNegative ? 'text-red-500' : 'text-emerald-600'
                      }`}
                    >
                      {isNegative ? `₹${tx.amount}` : `+₹${tx.amount}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserWallet;
