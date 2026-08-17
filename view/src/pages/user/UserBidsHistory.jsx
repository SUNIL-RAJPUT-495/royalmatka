import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import {
  FaArrowLeft,
  FaGamepad,
  FaSearch,
  FaWallet,
  FaRedoAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaClock
} from 'react-icons/fa';
import { IoFilterSharp, IoSearchOutline, IoCalendarOutline } from 'react-icons/io5';
import toast from 'react-hot-toast';
import SummaryApi from '../../common/SummerAPI';

export const UserBidsHistory = () => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  const tabs = ['All', 'Wins', 'Losses', 'Pending'];

  // Load User Data from localStorage
  useEffect(() => {
    try {
      const savedUserStr = localStorage.getItem('user_data') || localStorage.getItem('user');
      if (savedUserStr) {
        setUserData(JSON.parse(savedUserStr));
      }
    } catch (err) {
      console.error("Failed to parse user data:", err);
    }
  }, []);

  const mobile = userData?.mobile;
  const userId = userData?._id || userData?.id;

  // Fetch Bids from API
  const fetchUserBids = async (showToast = false) => {
    if (!mobile && !userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const queryParam = userId ? `userId=${userId}` : `mobile=${encodeURIComponent(mobile)}`;
      const res = await fetch(`${SummaryApi.getUserBids.url}?${queryParam}&limit=200`);
      const data = await res.json();

      if (data.success) {
        setBids(data.bids || []);
        if (showToast) toast.success("Bid history updated!");
      } else {
        toast.error(data.message || "Failed to load bids");
      }
    } catch (err) {
      console.error("Error fetching user bids:", err);
      toast.error("Failed to load bid history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mobile || userId) {
      fetchUserBids();
    }
  }, [mobile, userId]);

  // Calculate statistics
  const totalWinnings = bids
    .filter(b => b.status === 'Won' || b.type === 'Won' || b.winAmount > 0)
    .reduce((sum, b) => sum + (b.winAmount || 0), 0);

  const totalBetsCount = bids.length;

  // Filter bids by active tab & search query
  const filteredBids = bids.filter((bid) => {
    const status = bid.status || 'Pending';
    const type = bid.type || '';

    const isWon = status === 'Won' || type === 'Won' || bid.winAmount > 0;
    const isLost = status === 'Lost' || type === 'Lost';
    const isPending = !isWon && !isLost;

    let matchesTab = true;
    if (activeTab === 'Wins') {
      matchesTab = isWon;
    } else if (activeTab === 'Losses') {
      matchesTab = isLost;
    } else if (activeTab === 'Pending') {
      matchesTab = isPending;
    }

    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      bid.marketName?.toLowerCase().includes(query) ||
      bid.gameMode?.toLowerCase().includes(query) ||
      bid.digit?.toString().includes(query) ||
      bid.pana?.toString().includes(query) ||
      bid.jodi?.toString().includes(query) ||
      bid.session?.toLowerCase().includes(query);

    return matchesTab && matchesSearch;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] select-none pb-16 font-sans text-left">
      
      {/* 1. TOP HEADER */}
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
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Bid History
              </h2>
              <p className="text-[10px] text-white/80 font-normal">
                All your market bets & winning status
              </p>
            </div>
          </div>

          <button
            onClick={() => fetchUserBids(true)}
            className="w-10 h-10 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 flex items-center justify-center text-white shrink-0 active:scale-95 transition-all cursor-pointer"
            title="Refresh Bids"
          >
            <FaRedoAlt size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="px-4 space-y-4 max-w-lg mx-auto">
        
        {/* 2. STATS CARDS */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-3xl p-4 border border-gray-150 shadow-2xs space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
              <FaWallet className="text-emerald-600" size={13} />
              <span>Total Winnings</span>
            </div>
            <div className="text-xl font-black text-emerald-600">
              ₹{totalWinnings.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-4 border border-gray-150 shadow-2xs space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
              <FaGamepad className="text-[#f97316]" size={14} />
              <span>Total Bets</span>
            </div>
            <div className="text-xl font-black text-gray-900">
              {totalBetsCount}
            </div>
          </div>
        </div>

        {/* 3. FILTER TABS */}
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

        {/* 4. SEARCH BAR */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search market, digit, pana..."
              className="w-full pl-9 pr-3.5 py-2.5 bg-white rounded-2xl border border-gray-200 text-xs font-semibold text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#f97316] transition-colors"
            />
          </div>

          <div className="w-10 h-10 bg-white rounded-2xl border border-gray-200 text-[#f97316] flex items-center justify-center shadow-2xs shrink-0">
            <IoFilterSharp size={15} />
          </div>
        </div>

        {/* 5. BIDS LIST */}
        {loading ? (
          <div className="bg-white rounded-3xl p-12 border border-gray-150 shadow-2xs text-center text-xs text-gray-400 font-semibold">
            Loading bid history...
          </div>
        ) : filteredBids.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-gray-150 shadow-2xs flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-full bg-gray-100/90 flex items-center justify-center text-gray-400 mb-3">
              <IoSearchOutline size={26} />
            </div>
            <h3 className="text-sm font-bold text-gray-900">No Bets Found</h3>
            <p className="text-xs text-gray-400 font-normal mt-1">
              We couldn't find any bets matching your current filters.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBids.map((bid) => {
              const isWon = bid.status === 'Won' || bid.type === 'Won' || bid.winAmount > 0;
              const isLost = bid.status === 'Lost' || bid.type === 'Lost';
              const isPending = !isWon && !isLost;

              const playedNumber = bid.digit || bid.pana || bid.jodi || bid.openPana || bid.closePana || '-';

              return (
                <div
                  key={bid._id || bid.id}
                  className="bg-white rounded-2xl p-4 border border-gray-150 shadow-2xs space-y-2.5 transition-all hover:border-gray-300"
                >
                  {/* Top Row: Market Name & Status Badge */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black text-gray-900 tracking-wide uppercase flex items-center gap-1.5">
                        {bid.marketName}
                        <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-bold">
                          {bid.session || 'Open'}
                        </span>
                      </h4>
                      <p className="text-[10px] text-gray-400 font-medium flex items-center gap-1 mt-0.5">
                        <IoCalendarOutline size={11} />
                        {formatDate(bid.createdAt || bid.bidDate)}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {isWon ? (
                        <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-xl font-extrabold text-xs">
                          <FaCheckCircle size={12} className="text-emerald-600" />
                          <span>Won ₹{bid.winAmount || 0}</span>
                        </div>
                      ) : isLost ? (
                        <div className="flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-xl font-bold text-xs">
                          <FaTimesCircle size={12} className="text-rose-600" />
                          <span>Lost</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-xl font-bold text-xs">
                          <FaClock size={11} className="text-amber-600" />
                          <span>Pending</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-100" />

                  {/* Bottom Row: Game details */}
                  <div className="grid grid-cols-3 gap-2 text-center bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-[9px] text-gray-400 font-bold uppercase block">Type</span>
                      <strong className="text-xs font-bold text-gray-800 truncate block mt-0.5">
                        {bid.gameMode || bid.type || 'Single'}
                      </strong>
                    </div>

                    <div>
                      <span className="text-[9px] text-gray-400 font-bold uppercase block">Number / Digit</span>
                      <strong className="text-xs font-extrabold text-teal-700 block mt-0.5">
                        {playedNumber}
                      </strong>
                    </div>

                    <div>
                      <span className="text-[9px] text-gray-400 font-bold uppercase block">Points / Bet</span>
                      <strong className="text-xs font-black text-gray-900 block mt-0.5">
                        ₹{bid.points || 0}
                      </strong>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default UserBidsHistory;
