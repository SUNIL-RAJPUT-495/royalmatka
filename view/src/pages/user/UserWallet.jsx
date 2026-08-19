import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import Axios from '../../utils/axios';
import SummaryApi from '../../common/SummerAPI';
import {
  FaCreditCard,
  FaChevronRight,
  FaArrowRight,
  FaQuestion,
  FaArrowUp,
  FaGift,
  FaArrowLeft
} from 'react-icons/fa';
import { IoWalletOutline, IoFlashSharp, IoRefreshOutline, IoTrendingUpOutline, IoDocumentTextOutline } from 'react-icons/io5';
import { HiOutlineSparkles } from 'react-icons/hi';

export const UserWallet = () => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  const context = useOutletContext() || {};

  const localUserStr = localStorage.getItem("user_data");
  let localUser = null;
  try {
    if (localUserStr) localUser = JSON.parse(localUserStr);
  } catch (e) { }

  const [currentUser, setCurrentUser] = useState(
    (context.user && context.user.role !== 'Admin')
      ? context.user
      : (localUser && localUser.role !== 'Admin' ? localUser : (context.user || localUser || {}))
  );

  const displayBalance = Number(currentUser.balance !== undefined ? currentUser.balance : (currentUser.walletBalance !== undefined ? currentUser.walletBalance : 0)).toFixed(2);

  const [activeFilter, setActiveFilter] = useState('All');
  const [lastUpdatedTime, setLastUpdatedTime] = useState(() => new Date().toLocaleTimeString('en-IN'));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dbTransactions, setDbTransactions] = useState([]);

  // Fetch live profile & transactions on mount
  const fetchWalletData = async () => {
    setIsRefreshing(true);
    try {
      // 1. Fetch latest User Profile
      const profileRes = await Axios({
        url: SummaryApi.getUserProfile.url,
        method: SummaryApi.getUserProfile.method,
        params: { mobile: currentUser.mobile || '' }
      }).catch(() => null);

      const updatedUser = profileRes?.data?.user || profileRes?.data?.data;
      if (updatedUser) {
        setCurrentUser(updatedUser);
        localStorage.setItem("user_data", JSON.stringify(updatedUser));
      }

      // 2. Fetch User Transactions
      const txRes = await Axios({
        url: SummaryApi.getUserTransactions.url,
        method: SummaryApi.getUserTransactions.method,
        params: {
          mobile: currentUser.mobile || '',
          userId: currentUser._id || currentUser.id || ''
        }
      }).catch(() => null);

      if (txRes?.data?.transactions && Array.isArray(txRes.data.transactions)) {
        const formatted = txRes.data.transactions.map((tx, idx) => {
          const dateStr = tx.createdAt ? new Date(tx.createdAt).toLocaleString('en-IN') : 'Just now';
          let category = 'Games';
          let txType = tx.amount < 0 ? 'loss' : 'bonus';
          let title = tx.type || 'Game Bet';

          if (tx.type === 'Deposit') {
            category = 'Deposits';
            txType = 'deposit';
            title = 'Deposit';
          } else if (tx.type === 'Withdrawal') {
            category = 'Withdrawals';
            txType = 'withdrawal';
            title = 'Withdrawal';
          } else if (tx.type === 'Bonus') {
            category = 'Bonuses';
            txType = 'bonus';
            title = 'Bonus';
          } else if (tx.type === 'Win' || tx.type === 'Game' || (tx.remark && tx.remark.toLowerCase().includes('aviator'))) {
            category = 'Games';
            title = tx.amount < 0 ? 'Aviator Bet' : 'Aviator Win';
          }

          return {
            id: tx._id || `tx-${idx}`,
            type: txType,
            title: title,
            time: dateStr,
            tag: tx.remark || tx.method || 'Aviator Casino',
            amount: tx.amount,
            category: category
          };
        });
        setDbTransactions(formatted);
      }
      setLastUpdatedTime(new Date().toLocaleTimeString('en-IN'));
    } catch (err) {
      console.warn("Wallet refresh error:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const handleRefreshBalance = () => {
    fetchWalletData();
  };

  // Transactions list (Live DB data only)
  const transactions = dbTransactions;

  const filterTabs = ['All', 'Deposits', 'Withdrawals', 'Games'];

  const filteredTransactions = activeFilter === 'All'
    ? transactions
    : transactions.filter((tx) => tx.category === activeFilter);

  return (
    <div className="w-full select-none pb-8 font-sans">
      {/* 1. TOP CURVED WALLET HEADER (Exact match with Screenshot) */}
      <div
        className="p-4 pt-4 pb-5 rounded-b-[28px] text-white shadow-md transition-colors duration-300 mb-4 sticky top-0 z-30"
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

          <div className="my-1 flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-bold text-white tracking-tight">
                ₹{displayBalance}
              </span>
              <span className="text-[10px] text-white/80 block font-semibold">Total Available Balance</span>
            </div>
          </div>

          <div className="mb-2"></div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-white/15">
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
          onClick={() => navigate('/bank-details')}
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
          {filteredTransactions.length > 0 ? (
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
          ) : (
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-2xs flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-2">
                <IoDocumentTextOutline size={24} />
              </div>
              <h3 className="text-xs font-bold text-gray-900">No Transactions Found</h3>
              <p className="text-[11px] text-gray-400 font-normal mt-0.5">
                No transactions yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserWallet;
