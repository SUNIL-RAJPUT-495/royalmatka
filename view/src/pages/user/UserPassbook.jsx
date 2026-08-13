import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import Axios from '../../utils/axios';
import SummaryApi from '../../common/SummerAPI';
import {
  FaArrowLeft,
  FaFileAlt,
  FaSearch,
  FaCheck,
  FaGift,
  FaArrowRight,
  FaSyncAlt,
  FaInfoCircle
} from 'react-icons/fa';
import { IoFilterSharp, IoDocumentTextOutline, IoTimeOutline, IoCheckmarkCircleOutline } from 'react-icons/io5';

export const UserPassbook = () => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();

  // 1. DEFAULT ACTIVE TAB IS 'All'
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [dbTransactions, setDbTransactions] = useState([]);

  // Fetch transactions from backend
  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const savedUserStr = localStorage.getItem('user_data');
        let savedUser = null;
        try { if (savedUserStr) savedUser = JSON.parse(savedUserStr); } catch (e) {}

        const res = await Axios({
          url: SummaryApi.getUserTransactions.url,
          method: SummaryApi.getUserTransactions.method,
          params: { mobile: savedUser?.mobile || '' }
        });

        if (res.data?.transactions && Array.isArray(res.data.transactions)) {
          const formatted = res.data.transactions.map((tx, idx) => {
            const dateStr = tx.createdAt ? new Date(tx.createdAt).toLocaleString('en-IN') : 'Just now';
            const code = tx.transactionId ? `#${tx.transactionId.slice(-5)}` : `#tx-${idx}`;
            
            let category = 'Games';
            if (tx.type === 'Deposit') category = 'Deposits';
            else if (tx.type === 'Withdrawal') category = 'Withdrawals';
            else if (tx.type === 'Bonus') category = 'Bonuses';

            return {
              id: tx._id || `tx-${idx}`,
              code,
              title: `${tx.type || 'Transaction'} ${code}`,
              date: dateStr,
              type: tx.type || 'Game',
              amount: tx.amount,
              utr: tx.utrNumber || tx.transactionId || 'N/A',
              status: tx.status || 'Confirmed',
              category: category,
              notes: tx.remark || ''
            };
          });
          setDbTransactions(formatted);
        }
      } catch (err) {
        console.warn('Failed to fetch transactions from backend');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Combined transactions list (Live DB + screenshot fallback data)
  const allTransactions = dbTransactions.length > 0 ? dbTransactions : [
    {
      id: 'tx-1',
      code: '#be160',
      title: 'Deposit #be160',
      date: '5/8/2026, 1:50:58 PM',
      type: 'Deposit',
      amount: 500,
      utr: 'TX-1785918058381-187',
      status: 'Pending',
      category: 'Deposits'
    },
    {
      id: 'tx-2',
      code: '#be07e',
      title: 'Deposit #be07e',
      date: '5/8/2026, 1:34:04 PM',
      type: 'Deposit',
      amount: 500,
      utr: 'TX-1785917044872-156',
      status: 'Pending',
      category: 'Deposits'
    },
    {
      id: 'tx-3',
      code: '#b14ce',
      title: 'Transaction #b14ce',
      date: '1/8/2026, 2:27:03 PM',
      type: 'Game',
      amount: -10,
      utr: 'TX-1785574623987-561',
      status: 'Confirmed',
      category: 'Games',
      notes: 'Nexx settle round:11499933095758999572 bet:10 win:0 bal:9 serial:f588cacd-ff67-3c8d-819c-b50060164ea4'
    },
    {
      id: 'tx-4',
      code: '#b091f',
      title: 'Bonus #b091f',
      date: '28/7/2026, 2:31:25 PM',
      type: 'Bonus',
      amount: 9,
      utr: 'BET-1785229285955',
      status: 'Confirmed',
      category: 'Bonuses'
    },
    {
      id: 'tx-5',
      code: '#w992a',
      title: 'Withdrawal #w992a',
      date: '20/7/2026, 5:40:22 PM',
      type: 'Withdrawal',
      amount: -500,
      utr: 'TX-1784992819201-332',
      status: 'Confirmed',
      category: 'Withdrawals'
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
      tx.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.amount.toString().includes(searchQuery);
    return matchesTab && matchesSearch;
  });

  return (
    <div className="w-full select-none pb-8 font-sans">
      {/* 1. TOP HEADER */}
      <div
        className="p-4 pt-4 pb-5 rounded-b-[28px] text-white shadow-md transition-colors duration-300 mb-4 sticky top-0 z-30"
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

      <div className="px-4 space-y-4">
        {/* 2. FOUR TABS BAR */}
        <div className="bg-white rounded-2xl p-1 border border-gray-150 shadow-2xs flex items-center justify-between">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            let activeBgClass = 'bg-[#f97316] text-white';
            if (tab.id === 'Bonuses') activeBgClass = 'bg-[#8b5cf6] text-white';
            if (tab.id === 'Withdrawals') activeBgClass = 'bg-[#f97316] text-white';
            if (tab.id === 'Deposits') activeBgClass = 'bg-[#10b981] text-white';
            if (tab.id === 'All') activeBgClass = 'bg-[#f97316] text-white';

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-center ${
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

        {/* 3. ACTIVE CATEGORY INFO BANNER (Matching Screenshot) */}
        {activeTab === 'All' && (
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-[#f97316] text-white flex items-center justify-center shadow-xs shrink-0">
              <FaInfoCircle size={18} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 leading-tight">All Transactions</h4>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Showing all transaction types
              </p>
            </div>
          </div>
        )}

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

        {activeTab === 'Deposits' && (
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-2xs shrink-0">
              <FaArrowRight size={14} className="rotate-45" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 leading-tight">Deposits</h4>
              <p className="text-xs text-emerald-600 font-medium mt-0.5">
                Funds added to wallet
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
          {filteredTransactions.length} transactions found
        </div>

        {/* 5. TRANSACTIONS LIST (Exact Match with Screenshot) */}
        {filteredTransactions.length > 0 ? (
          <div className="space-y-3">
            {filteredTransactions.map((tx) => {
              const isPending = tx.status === 'Pending';
              const isGame = tx.type === 'Game';
              const isBonus = tx.type === 'Bonus';

              return (
                <div
                  key={tx.id}
                  className={`bg-white rounded-3xl p-4.5 shadow-2xs space-y-3 border ${
                    isPending
                      ? 'border-orange-200'
                      : isGame || isBonus
                      ? 'border-emerald-200'
                      : 'border-gray-150'
                  }`}
                >
                  {/* Top Row: Icon, Title & Date on Left, Badges on Right */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {/* Status Circle Icon */}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shadow-xs shrink-0 ${
                          isPending
                            ? 'bg-[#f97316] text-white'
                            : 'bg-emerald-500 text-white'
                        }`}
                      >
                        {isPending ? <IoTimeOutline size={15} /> : <FaCheck size={12} />}
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-gray-900 leading-tight">
                          {tx.title}
                        </h4>
                        <span className="text-[10px] text-gray-400 font-normal mt-0.5 block">
                          {tx.date}
                        </span>
                      </div>
                    </div>

                    {/* Right Badges */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {tx.type === 'Deposit' && (
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-150">
                          <span>← Deposit</span>
                        </span>
                      )}

                      {tx.type === 'Bonus' && (
                        <span className="bg-purple-50 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-purple-150">
                          <FaGift size={9} />
                          <span>Bonus</span>
                        </span>
                      )}

                      {isPending ? (
                        <span className="bg-orange-50 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-orange-150">
                          <IoTimeOutline size={11} />
                          <span>Pending</span>
                        </span>
                      ) : (
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-150">
                          <FaCheck size={9} />
                          <span>Confirmed</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 2 Inner Sub-Boxes: Amount & UTR */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-3 bg-gray-50/70 rounded-2xl border border-gray-100">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">Amount</span>
                      <span className="text-base font-bold text-gray-900 mt-0.5 block">
                        ₹{tx.amount}
                      </span>
                    </div>

                    <div className="p-3 bg-gray-50/70 rounded-2xl border border-gray-100 overflow-hidden">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">UTR</span>
                      <span className="text-[11px] font-bold text-gray-800 mt-1 block truncate">
                        {tx.utr}
                      </span>
                    </div>
                  </div>

                  {/* Optional Notes Box (For Game transactions) */}
                  {tx.notes && (
                    <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-150 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-blue-500 block">Notes</span>
                      <p className="text-[11px] text-blue-900 leading-relaxed font-semibold break-all">
                        {tx.notes}
                      </p>
                    </div>
                  )}

                  {/* Confirmed Status pill row if not game */}
                  {!tx.notes && !isPending && (
                    <div className="p-2.5 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                      <FaCheck size={11} />
                      <span>Confirmed</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
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
      </div>
    </div>
  );
};

export default UserPassbook;
